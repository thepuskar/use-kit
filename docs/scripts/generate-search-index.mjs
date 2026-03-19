import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");
const contentRoot = path.join(docsRoot, "content");
const outputPath = path.join(docsRoot, "public", "search-index.json");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolved = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walk(resolved);
      }

      return resolved;
    }),
  );

  return files.flat();
}

function parseFrontmatter(source) {
  if (!source.startsWith("---\n")) {
    return { frontmatter: {}, content: source };
  }

  const endIndex = source.indexOf("\n---\n", 4);

  if (endIndex === -1) {
    return { frontmatter: {}, content: source };
  }

  const rawFrontmatter = source.slice(4, endIndex);
  const content = source.slice(endIndex + 5);
  const frontmatter = {};

  for (const line of rawFrontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key) {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content };
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function stripMarkdown(source) {
  return normalizeWhitespace(
    source
      .replace(/^import\s.+$/gm, " ")
      .replace(/^export\s.+$/gm, " ")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, " $1 ")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
      .replace(/<[^>]+>/g, " ")
      .replace(/^\|.*$/gm, " ")
      .replace(/^[-*+]\s+/gm, " ")
      .replace(/^\d+\.\s+/gm, " ")
      .replace(/^#{1,6}\s+/gm, " ")
      .replace(/[*_~]/g, " "),
  );
}

function getHeadings(source) {
  return [...source.matchAll(/^#{1,3}\s+(.+)$/gm)].map((match) =>
    normalizeWhitespace(match[1].replace(/`/g, "")),
  );
}

function toRoute(relativePath) {
  const withoutExtension = relativePath.replace(/\.mdx$/, "");
  const segments = withoutExtension.split(path.sep);

  if (segments.at(-1) === "index") {
    segments.pop();
  }

  return segments.length ? `/${segments.join("/")}/` : "/";
}

function createEntry(relativePath, source) {
  const { frontmatter, content } = parseFrontmatter(source);
  const headings = getHeadings(content);
  const cleanBody = stripMarkdown(content);
  const title = frontmatter.title || headings[0] || path.basename(relativePath, ".mdx");
  const description = frontmatter.description || "";

  return {
    route: toRoute(relativePath),
    title,
    description,
    headings: headings.slice(0, 8),
    text: normalizeWhitespace([title, description, ...headings, cleanBody].filter(Boolean).join(" ")),
  };
}

async function main() {
  const files = (await walk(contentRoot))
    .filter((file) => file.endsWith(".mdx"))
    .sort((left, right) => left.localeCompare(right));

  const entries = await Promise.all(
    files.map(async (file) => {
      const relativePath = path.relative(contentRoot, file);
      const source = await readFile(file, "utf8");

      return createEntry(relativePath, source);
    }),
  );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`Generated ${entries.length} search entries at ${path.relative(docsRoot, outputPath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
