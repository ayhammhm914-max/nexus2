import path from "node:path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const prisma = new PrismaClient();

const isBlank = (value: string | null | undefined) => !value || value.trim().length === 0;

const encodeText = (text: string) => encodeURIComponent(text.replace(/\s+/g, " ").trim());

const placeholderUrl = (text: string, size: "900x1200" | "900x520") =>
  `https://placehold.co/${size}/0d1117/00e5ff?text=${encodeText(text)}`;

const normalizeJsonStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const uniqueStrings = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
};

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      coverImageUrl: true,
      thumbnailUrl: true,
      images: true
    }
  });

  const needsFix = products.filter(
    (product) => isBlank(product.coverImageUrl) || isBlank(product.thumbnailUrl)
  );

  // eslint-disable-next-line no-console
  console.log(`[fixMissingProductMedia] scanned=${products.length} needsFix=${needsFix.length}`);

  for (const product of needsFix) {
    const label = product.slug || product.name;
    const coverImageUrl = isBlank(product.coverImageUrl)
      ? placeholderUrl(label, "900x1200")
      : product.coverImageUrl!.trim();
    const thumbnailUrl = isBlank(product.thumbnailUrl)
      ? placeholderUrl(label, "900x520")
      : product.thumbnailUrl!.trim();
    const existingImages = normalizeJsonStringArray(product.images);
    const images = uniqueStrings([coverImageUrl, thumbnailUrl, ...existingImages]);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        coverImageUrl,
        thumbnailUrl,
        images
      }
    });

    // eslint-disable-next-line no-console
    console.log(`✅ ${product.slug} → cover+thumb set`);
  }
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("[fixMissingProductMedia] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

