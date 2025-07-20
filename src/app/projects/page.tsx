import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";
import ProjectManager from "@/components/ProjectManager";
import { Project } from "@/types/project";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  let projects: Project[] = [];

  try {
    projects = await query(
      `SELECT * FROM projects 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [session.user.id]
    );
  } catch (error) {
    console.error("获取项目列表失败:", error);
  }

  return <ProjectManager initialProjects={projects} />;
}
