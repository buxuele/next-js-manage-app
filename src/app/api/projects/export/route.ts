import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { readProjectsConfig } from "@/lib/project-config";
import { ApiResponse } from "@/types";

/**
 * GET /api/projects/export - 导出用户的所有项目配置
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    // 检查用户认证
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const projects = await readProjectsConfig(session.user.id);

    // 构建导出数据格式
    const exportData = {
      export_time: new Date().toISOString(),
      projects: projects.map((project) => ({
        created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
        description: project.description || "",
        id: parseInt(project.id),
        image: project.icon || "",
        name: project.name,
        path: project.path,
        updated_at: new Date().toISOString().replace("T", " ").substring(0, 19),
        url: project.url || "",
      })),
      total_projects: projects.length,
    };

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error("GET /api/projects/export error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to export projects",
        code: "EXPORT_ERROR",
      },
      { status: 500 }
    );
  }
}
