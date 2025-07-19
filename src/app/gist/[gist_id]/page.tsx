import { getGist } from "@/lib/data-adapter";
// import { Gist } from "@/lib/data";
import { notFound } from "next/navigation";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.min.css";
import { GistDetailClientView } from "@/components/GistDetailClientView";

// Next.js 15 页面参数类型
type PageParams = {
  params: Promise<{ gist_id: string }>;
};

export async function generateMetadata({ params }: PageParams) {
  const { gist_id } = await params;
  const gist = await getGist(gist_id);
  if (!gist) {
    return { title: "Not Found" };
  }
  return {
    title: `${gist.filename} - 我的知识库`,
    description: gist.description,
  };
}

export default async function GistDetailPage({ params }: PageParams) {
  const { gist_id } = await params;
  const gist = await getGist(gist_id);

  if (!gist) {
    notFound();
  }

  const lines = gist.content.split("\n");
  const lineNumbers = Array.from(
    { length: lines.length },
    (_, i) => i + 1
  ).join("\n");
  const highlightedCode = hljs.highlight(gist.content, {
    language: gist.filename.split(".").pop() || "plaintext",
    ignoreIllegals: true,
  }).value;

  return (
    <GistDetailClientView
      gist={gist}
      lineNumbers={lineNumbers}
      highlightedCodeHTML={highlightedCode}
    />
  );
}
