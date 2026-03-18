import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateStaticParamsFor, importPage } from "nextra/pages";

import { useMDXComponents as getMDXComponents } from "../../mdx-components";

type PageParams = {
  mdxPath?: string[];
};

type PageProps = {
  params: Promise<PageParams>;
};

export const generateStaticParams = generateStaticParamsFor("mdxPath");

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
