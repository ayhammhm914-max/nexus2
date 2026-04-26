const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("../backend/node_modules/@prisma/client");

const rootDir = path.resolve(__dirname, "..");
const backendEnvPath = path.join(rootDir, "backend", ".env");

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(backendEnvPath);

const prisma = new PrismaClient();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  "devolverdigital",
  "devolver digital",
  "warner bros",
  "activision",
  "blizzard",
  "riot games",
  "epic games"
];

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractInitialData = (html) => {
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

const textFromRuns = (value) => {
  if (!value || typeof value !== "object") {
    return "";
  }

  if (typeof value.simpleText === "string") {
    return value.simpleText;
  }

  if (Array.isArray(value.runs)) {
    return value.runs.map((run) => run.text ?? "").join("");
  }

  return "";
};

const parseViewCount = (value) => {
  const compact = value.toLowerCase().replace(/,/g, "");
  const match = compact.match(/([\d.]+)\s*([kmb])?/);
  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  const multiplier =
    match[2] === "b" ? 1_000_000_000 : match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1;
  return Number.isFinite(amount) ? Math.round(amount * multiplier) : 0;
};

const scoreCandidate = (candidate, productName) => {
  const title = normalize(candidate.title);
  const channel = normalize(candidate.channel);
  const product = normalize(productName);
  const productTokens = product.split(" ").filter((token) => token.length > 2);
  let score = 0;

  if (title.includes("official trailer")) score += 35;
  if (title.includes("trailer")) score += 12;
  if (productTokens.length && productTokens.every((token) => title.includes(token))) score += 22;
  if (trustedPublisherNames.some((publisher) => channel.includes(publisher))) score += 45;
  if (channel.includes("official")) score += 20;
  if (channel.includes("games") || channel.includes("game")) score += 10;
  if (title.includes("gameplay")) score -= 4;
  if (title.includes("review") || title.includes("walkthrough") || title.includes("reaction")) score -= 24;
  score += Math.min(14, Math.log10(Math.max(candidate.viewCount, 1)));

  return score;
};

const findVideoRenderers = (value, output = []) => {
  if (!value || typeof value !== "object") {
    return output;
  }

  if ("videoRenderer" in value && typeof value.videoRenderer === "object") {
    output.push(value.videoRenderer);
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

async function getTrailerVideoId(productName) {
  const query = encodeURIComponent(`${productName} official trailer`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`https://www.youtube.com/results?search_query=${query}`, {
      signal: controller.signal,
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
      }
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const json = extractInitialData(html);
    if (!json) {
      return null;
    }

    let initialData;
    try {
      initialData = JSON.parse(json);
    } catch {
      return null;
    }

    const seen = new Set();
    const candidates = findVideoRenderers(initialData)
      .map((renderer) => {
        const videoId = renderer.videoId ?? "";
        const title = textFromRuns(renderer.title);
        const channel =
          textFromRuns(renderer.ownerText) ||
          textFromRuns(renderer.longBylineText) ||
          textFromRuns(renderer.shortBylineText);
        const viewCount = parseViewCount(textFromRuns(renderer.viewCountText));

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
        score: scoreCandidate(candidate, productName)
      }))
      .sort((left, right) => right.score - left.score);

    const trusted = candidates.find((candidate) => candidate.score >= 40);
    return trusted?.videoId ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const ensureTrailerColumn = async () => {
  try {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `Product` ADD COLUMN `trailerVideoId` VARCHAR(50) NULL DEFAULT NULL"
    );
  } catch (error) {
    const message = String(error);
    if (!message.includes("Duplicate column") && !message.includes("1060")) {
      throw error;
    }
  }
};

const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add it to backend/.env before running this script.");
  }

  await ensureTrailerColumn();

  const products = await prisma.$queryRawUnsafe(
    "SELECT `id`, `name` FROM `Product` WHERE `trailerVideoId` IS NULL AND `isActive` = true ORDER BY `updatedAt` DESC"
  );

  process.stdout.write(`Found ${products.length} products without trailerVideoId.\n`);

  for (const [index, product] of products.entries()) {
    const videoId = await getTrailerVideoId(product.name);

    if (videoId) {
      await prisma.$executeRawUnsafe(
        "UPDATE `Product` SET `trailerVideoId` = ? WHERE `id` = ?",
        videoId,
        product.id
      );
      process.stdout.write(`✅ ${product.name} → ${videoId}\n`);
    } else {
      process.stdout.write(`❌ ${product.name} → not found\n`);
    }

    if (index < products.length - 1) {
      await delay(500);
    }
  }
};

main()
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
