import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import ProjectManager from "@/components/ProjectManager";
import ProjectErrorBoundary from "@/components/ProjectErrorBoundary";

export default async function ProjectsPage() {
  // 检查用户是否已登录
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="container-fluid mt-4 px-4">
      <ProjectErrorBoundary>
        <ProjectManager />
      </ProjectErrorBoundary>
    </main>
  );
}
