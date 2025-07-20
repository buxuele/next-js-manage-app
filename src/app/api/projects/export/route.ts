import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const projects = await query(
      `SELECT * FROM projects 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [session.user.id]
    );

    const exportData = {
      export_time: new Date().toISOString(),
      total_projects: projects.length,
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        url: project.url,
        path: project.path,
        image: project.image,
        created_at: project.created_at,
        updated_at: project.updated_at,
      })),
    };

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error("导出项目数据失败:", error);
    return NextResponse.json({ error: "导出项目数据失败" }, { status: 500 });
  }
}
