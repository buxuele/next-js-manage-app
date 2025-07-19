import { NextRequest, NextResponse } from "next/server";
import {
  getProjectConfig,
  updateProjectConfig,
  deleteProjectConfig,
} from "@/lib/project-config";
import { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/projects/[id] - 获取单个项目配置
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;
    const project = await getProjectConfig(id);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    const { id } = await params;
    console.error(`GET /api/projects/${id} error:`, error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project",
        code: "FETCH_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id] - 更新项目配置
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;
    const updates = await request.json();

    const updatedProject = await updateProjectConfig(id, updates);

    if (!updatedProject) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    const { id } = await params;
    console.error(`PUT /api/projects/${id} error:`, error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update project",
        code: "UPDATE_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id] - 删除项目配置
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;
    const deleted = await deleteProjectConfig(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`DELETE /api/projects/${id} error:`, error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete project",
        code: "DELETE_ERROR",
      },
      { status: 500 }
    );
  }
}
