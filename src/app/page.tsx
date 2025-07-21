import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";
import ProjectManager from "@/components/ProjectManager";
import { Project } from "@/types/project";

async function getProjects(userId: string): Promise<Project[]> {
  try {
    const projects = await query(
      `SELECT * FROM projects 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [userId]
    );
    return projects;
  } catch (error) {
    console.error("获取项目列表失败:", error);
    return [];
  }
}

export default async function HomePage() {
  // 检查用户是否已登录
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 直接使用数据库查询获取项目数据
  const projects = await getProjects(session.user.id);

  return <ProjectManager initialProjects={projects} />;
}
