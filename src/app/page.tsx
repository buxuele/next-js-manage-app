import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import ProjectManager from "@/components/ProjectManager";
import { Project } from "@/types/project";

async function getProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/projects`, {
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Failed to fetch projects");
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export default async function HomePage() {
  // 检查用户是否已登录
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 直接在根路径显示项目管理界面，不重定向
  const projects = await getProjects();

  return <ProjectManager initialProjects={projects} />;
}
