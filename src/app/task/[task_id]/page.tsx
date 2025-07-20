import { getTask } from "@/lib/data-adapter";
// import { Task } from "@/lib/data";
import { notFound } from "next/navigation";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.min.css";
import { TaskDetailClientView } from "@/components/TaskDetailClientView";

// Next.js 15 页面参数类型
type PageParams = {
  params: Promise<{ task_id: string }>;
};

export async function generateMetadata({ params }: PageParams) {
  const { task_id } = await params;
  const task = await getTask(task_id);
  if (!task) {
    return { title: "Not Found" };
  }
  return {
    title: `${task.filename} - 我的任务库`,
    description: task.description,
  };
}

export default async function TaskDetailPage({ params }: PageParams) {
  const { task_id } = await params;
  const task = await getTask(task_id);

  if (!task) {
    notFound();
  }

  const lines = task.content.split("\n");
  const lineNumbers = Array.from(
    { length: lines.length },
    (_, i) => i + 1
  ).join("\n");
  const highlightedCode = hljs.highlight(task.content, {
    language: task.filename.split(".").pop() || "plaintext",
    ignoreIllegals: true,
  }).value;

  return (
    <TaskDetailClientView
      task={task}
      lineNumbers={lineNumbers}
      highlightedCodeHTML={highlightedCode}
    />
  );
}
