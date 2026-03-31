import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { importPage } from "nextra/pages";

import { useMDXComponents as getMDXComponents } from "../../mdx-components";

type PageParams = {
  mdxPath?: string[];
};

type PageProps = {
  params: Promise<PageParams>;
};

const CONTENT_ROOT = path.join(process.cwd(), "content");
const CONTENT_EXTENSIONS = new Set([".md", ".mdx"]);

async function collectStaticMdxPaths(
  directory: string,
  segments: string[] = [],
): Promise<string[][]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: string[][] = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isDirectory()) {
      paths.push(
        ...(await collectStaticMdxPaths(path.join(directory, entry.name), [
          ...segments,
          entry.name,
        ])),
      );
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name);

    if (!CONTENT_EXTENSIONS.has(extension) || entry.name.startsWith("_meta.")) {
      continue;
    }

    const slug = entry.name.slice(0, -extension.length);
    paths.push(slug === "index" ? segments : [...segments, slug]);
  }

  return paths;
}

export async function generateStaticParams() {
  const discoveredPaths = await collectStaticMdxPaths(CONTENT_ROOT);
  const mdxPaths = discoveredPaths.some((segments) => segments.length === 0)
    ? discoveredPaths
    : [[], ...discoveredPaths];

  return mdxPaths.map((mdxPath) => ({ mdxPath }));
}

const Wrapper = getMDXComponents().wrapper;

function isAssetLikePath(mdxPath?: string[]) {
  return mdxPath?.some((segment) => segment.includes(".")) ?? false;
}

async function loadPageOrNotFound(mdxPath?: string[]) {
  if (isAssetLikePath(mdxPath)) {
    notFound();
  }

  try {
    return await importPage(mdxPath);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "MODULE_NOT_FOUND"
    ) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const { metadata } = await loadPageOrNotFound(params.mdxPath);
  return metadata;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const result = await loadPageOrNotFound(params.mdxPath);
  const { default: MDXContent, metadata, sourceCode, toc } = result;

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
