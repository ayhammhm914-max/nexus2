type TrailerCandidate = {
  videoId: string;
  title: string;
  channel: string;
  viewCount: number;
  score: number;
};

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

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractInitialData = (html: string) => {
  const marker = "ytInitialData";
  const markerIndex = html.indexOf(marker);
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

const scoreCandidate = (candidate: Omit<TrailerCandidate, "score">, productName: string) => {
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

export const getTrailerVideoId = async (productName: string) => {
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

    let initialData: unknown;
    try {
      initialData = JSON.parse(json);
    } catch {
      return null;
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
};
