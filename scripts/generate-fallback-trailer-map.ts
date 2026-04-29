import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatedFallbackProducts } from "../frontend/src/data/generatedFallbackProducts";
import { fallbackTrailerVideoIds } from "../frontend/src/data/fallbackTrailerVideoIds";

type TrailerCandidate = {
  videoId: string;
  title: string;
  channel: string;
  viewCount: number;
  score: number;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "frontend", "src", "data", "fallbackTrailerVideoIds.ts");
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const trustedPublisherNames = [
  "playstation",
  "xbox",
  "nintendo",
  "steam",
  "ubisoft",
  "electronic arts",
  "ea",
  "bethesda",
  "capcom",
  "bandai namco",
  "square enix",
  "sega",
  "atlus",
  "rockstar games",
  "cd projekt",
  "devolver digital",
  "warner bros",
  "activision",
  "blizzard",
  "riot games",
  "epic games",
  "focus entertainment",
  "bandai namco entertainment",
  "koei tecmo",
  "team ninja",
  "obsidian entertainment",
  "larian studios",
  "fromsoftware",
  "squareenix",
  "505 games",
  "paradox interactive"
];

const stripPlatformNoise = (value: string) =>
  value
    .replace(/\b(PC|PS5|PS4|PS3|Xbox|Nintendo|Switch|PlayStation)\b/gi, " ")
    .replace(/\b(Complete Edition|Definitive Edition|Ultimate Edition|GOTY|Game of the Year)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const textFromRuns = (value: unknown): string => {
  if (!value || typeof value !== "object") {
    return "";
  }

  const maybeText = value as { simpleText?: string; runs?: Array<{ text?: string }> };
  if (typeof maybeText.simpleText === "string") {
    return maybeText.simpleText;
  }

  if (Array.isArray(maybeText.runs)) {
    return maybeText.runs.map((run) => run.text ?? "").join("");
  }

  return "";
};

const parseViewCount = (value: string) => {
  const compact = value.toLowerCase().replace(/,/g, "");
  const match = compact.match(/([\d.]+)\s*([kmb])?/);
  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  const multiplier = match[2] === "b" ? 1_000_000_000 : match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1;
  return Number.isFinite(amount) ? Math.round(amount * multiplier) : 0;
};

const scoreCandidate = (candidate: Omit<TrailerCandidate, "score">, searchName: string) => {
  const title = normalize(candidate.title);
  const channel = normalize(candidate.channel);
  const productTokens = normalize(searchName)
    .split(" ")
    .filter((token) => token.length > 2);
  let score = 0;

  if (title.includes("official trailer")) score += 35;
  if (title.includes("announcement trailer")) score += 28;
  if (title.includes("launch trailer")) score += 24;
  if (title.includes("story trailer")) score += 20;
  if (title.includes("trailer")) score += 12;
  if (productTokens.length && productTokens.every((token) => title.includes(token))) score += 22;
  if (trustedPublisherNames.some((publisher) => channel.includes(publisher))) score += 45;
  if (channel.includes("official")) score += 20;
  if (channel.includes("games") || channel.includes("game")) score += 10;
  if (title.includes("review") || title.includes("walkthrough") || title.includes("reaction")) score -= 30;
  if (title.includes("all cutscenes") || title.includes("full movie")) score -= 28;
  if (title.includes("gameplay")) score -= 4;
  score += Math.min(14, Math.log10(Math.max(candidate.viewCount, 1)));

  return score;
};

const extractInitialData = (html: string) => {
  const markerIndex = html.indexOf("ytInitialData");
  if (markerIndex < 0) {
    return null;
  }

  const objectStart = html.indexOf("{", markerIndex);
  if (objectStart < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = objectStart; index < html.length; index += 1) {
    const char = html[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return html.slice(objectStart, index + 1);
      }
    }
  }

  return null;
};

const findVideoRenderers = (value: unknown, output: unknown[] = []) => {
  if (!value || typeof value !== "object") {
    return output;
  }

  if ("videoRenderer" in value && typeof (value as { videoRenderer?: unknown }).videoRenderer === "object") {
    output.push((value as { videoRenderer: unknown }).videoRenderer);
  }

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      child.forEach((item) => findVideoRenderers(item, output));
    } else if (child && typeof child === "object") {
      findVideoRenderers(child, output);
    }
  }

  return output;
};

const fetchCandidates = async (query: string, searchName: string) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return [] as TrailerCandidate[];
    }

    const html = await response.text();
    const json = extractInitialData(html);
    if (!json) {
      const firstVideoId = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)?.[1];
      return firstVideoId
        ? [
            {
              videoId: firstVideoId,
              title: query,
              channel: "",
              viewCount: 0,
              score: 1
            }
          ]
        : [];
    }

    let initialData: unknown;
    try {
      initialData = JSON.parse(json);
    } catch {
      return [];
    }

    const seen = new Set<string>();
    const candidates = findVideoRenderers(initialData)
      .map((renderer) => {
        const item = renderer as {
          videoId?: string;
          title?: unknown;
          ownerText?: unknown;
          longBylineText?: unknown;
          shortBylineText?: unknown;
          viewCountText?: unknown;
        };
        const videoId = item.videoId ?? "";
        const title = textFromRuns(item.title);
        const channel =
          textFromRuns(item.ownerText) || textFromRuns(item.longBylineText) || textFromRuns(item.shortBylineText);
        const viewCount = parseViewCount(textFromRuns(item.viewCountText));

        return { videoId, title, channel, viewCount };
      })
      .filter((candidate) => {
        if (!/^[a-zA-Z0-9_-]{11}$/.test(candidate.videoId) || seen.has(candidate.videoId)) {
          return false;
        }
        seen.add(candidate.videoId);
        return Boolean(candidate.title);
      })
      .map((candidate) => ({
        ...candidate,
        score: scoreCandidate(candidate, searchName)
      }))
      .sort((left, right) => right.score - left.score);

    if (candidates.length > 0) {
      return candidates;
    }

    const firstVideoId = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)?.[1];
    return firstVideoId
      ? [
          {
            videoId: firstVideoId,
            title: query,
            channel: "",
            viewCount: 0,
            score: 1
          }
        ]
      : [];
  } catch {
    return [];
  }
};

const fetchFirstVideoId = async (query: string) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)?.[1] ?? null;
  } catch {
    return null;
  }
};

const getTrailerVideoId = async (productName: string) => {
  const cleanedName = stripPlatformNoise(productName);
  const queries = Array.from(
    new Set([
      `${cleanedName} official trailer`,
      cleanedName !== productName ? `${productName} official trailer` : ""
    ].filter(Boolean))
  );

  for (const query of queries) {
    const firstVideoId = await fetchFirstVideoId(query);
    if (firstVideoId) {
      return firstVideoId;
    }
  }

  for (const query of queries) {
    const candidates = await fetchCandidates(query, cleanedName || productName);
    const trusted = candidates.find((candidate) => candidate.score >= 40);
    if (trusted) {
      return trusted.videoId;
    }

    const usable = candidates.find((candidate) => candidate.score >= 16) ?? candidates[0];
    if (usable) {
      return usable.videoId;
    }
  }

  return null;
};

const gameProducts = generatedFallbackProducts
  .filter((product) => ["pc-games", "console-games"].includes(product.category.slug))
  .sort((left, right) => left.name.localeCompare(right.name));

const existingMap = { ...fallbackTrailerVideoIds };
const missingProducts = gameProducts.filter((product) => !existingMap[product.slug]);

const writeOutput = async (map: Record<string, string>) => {
  const sortedEntries = Object.entries(map).sort(([left], [right]) => left.localeCompare(right));
  const content = `export const fallbackTrailerVideoIds: Record<string, string> = ${JSON.stringify(
    Object.fromEntries(sortedEntries),
    null,
    2
  )};\n`;
  await fs.writeFile(outputPath, content, "utf8");
};

const runWorkers = async () => {
  const concurrency = 4;
  let index = 0;

  const worker = async () => {
    while (index < missingProducts.length) {
      const currentIndex = index;
      index += 1;
      const product = missingProducts[currentIndex];
      const videoId = await getTrailerVideoId(product.name);

      if (videoId) {
        existingMap[product.slug] = videoId;
        process.stdout.write(`OK  ${currentIndex + 1}/${missingProducts.length}  ${product.slug} -> ${videoId}\n`);
      } else {
        process.stdout.write(`MISS ${currentIndex + 1}/${missingProducts.length}  ${product.slug}\n`);
      }

      if ((currentIndex + 1) % 20 === 0 || currentIndex === missingProducts.length - 1) {
        await writeOutput(existingMap);
      }

      await delay(200);
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, missingProducts.length || 1) }, () => worker()));
};

const main = async () => {
  process.stdout.write(
    `Preparing trailer map for ${gameProducts.length} game products. ${missingProducts.length} still need trailer IDs.\n`
  );

  await runWorkers();
  await writeOutput(existingMap);

  const totalMappedGames = gameProducts.filter((product) => Boolean(existingMap[product.slug])).length;
  const missingSlugs = gameProducts.filter((product) => !existingMap[product.slug]).map((product) => product.slug);

  process.stdout.write(
    `Finished with ${totalMappedGames}/${gameProducts.length} game products mapped. Missing: ${missingSlugs.length}\n`
  );

  if (missingSlugs.length > 0) {
    process.stdout.write(`${missingSlugs.join("\n")}\n`);
  }
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
