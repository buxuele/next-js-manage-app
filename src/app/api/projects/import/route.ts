import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { addProjectConfig } from "@/lib/project-config";
import { ApiResponse } from "@/types";

interface ImportProject {
  created_at: string;
  description: string;
  id: number;
  image: string;
  name: string;
  path: string;
  updated_at: string;
  url: string;
}

interface ImportData {
  export_time: string;
  projects: ImportProject[];
  total_projects: number;
}

/**
 * POST /api/projects/import - 导入项目配置
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
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

    const importData: ImportData = await request.json();

    // 验证导入数据格式
    if (!importData.projects || !Array.isArray(importData.projects)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid import data format",
          code: "INVALID_FORMAT",
        },
        { status: 400 }
      );
    }

    const importedProjects = [];
    const errors = [];

    // 逐个导入项目
    for (const project of importData.projects) {
      try {
        if (!project.name || !project.path) {
          errors.push(`项目 ${project.name || "Unknown"}: 缺少必要字段`);
          continue;
        }

        // 从URL中提取端口号
        let port = 3000;
        if (project.url) {
          const urlMatch = project.url.match(/:(\d+)/);
          if (urlMatch) {
            port = parseInt(urlMatch[1]);
          }
        }

        const newProject = await addProjectConfig(
          {
            name: project.name.trim(),
            description: project.description?.trim() || "",
            path: project.path.trim(),
            port: port,
          },
          session.user.id
        );

        importedProjects.push(newProject);
      } catch (error) {
        console.error(`Import project ${project.name} error:`, error);
        errors.push(`项目 ${project.name}: 导入失败`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: importedProjects.length,
        total: importData.projects.length,
        errors: errors,
        projects: importedProjects,
      },
    });
  } catch (error) {
    console.error("POST /api/projects/import error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to import projects",
        code: "IMPORT_ERROR",
      },
      { status: 500 }
    );
  }
}
