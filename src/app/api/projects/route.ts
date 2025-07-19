import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { readProjectsConfig, addProjectConfig } from "@/lib/project-config";
import { ApiResponse, ProjectFormData } from "@/types";

/**
 * GET /api/projects - 获取当前用户的所有项目配置
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

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
        code: "FETCH_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects - 添加新项目配置
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

    const body: ProjectFormData = await request.json();

    // 基本验证
    if (!body.name || !body.path) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and path are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // 验证路径格式（简单检查）
    if (!body.path.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid path format",
          code: "INVALID_PATH",
        },
        { status: 400 }
      );
    }

    const newProject = await addProjectConfig(
      {
        name: body.name.trim(),
        description: body.description?.trim() || "",
        path: body.path.trim(),
        port: body.port || 3000,
      },
      session.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: newProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
        code: "CREATE_ERROR",
      },
      { status: 500 }
    );
  }
}
