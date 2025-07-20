import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { loadTasks } from "@/lib/data-adapter";
import TaskList from "@/components/TaskList";

export default async function TasksPage() {
  // 检查用户是否已登录
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 加载当前用户的任务
  const tasks = await loadTasks(session.user.id);

  return (
    <main className="container-fluid mt-4 px-4">
      <TaskList initialTasks={tasks} />
    </main>
  );
}
