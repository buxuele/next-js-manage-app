import { NextRequest, NextResponse } from "next/server";
import { getProjectConfig, updateProjectConfig } from "@/lib/project-config";
import { processManager } from "@/lib/process-manager";
import { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/projects/[id]/stop - 停止项目开发服务器
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const { id } = await params;

    // 获取项目配置
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

    // 检查项目是否在运行
    const currentStatus = processManager.getProjectStatus(id);
    if (!currentStatus?.isRunning) {
      return NextResponse.json(
        {
          success: false,
          error: "Project is not running",
          code: "NOT_RUNNING",
        },
        { status: 400 }
      );
    }

    // 停止项目
    const stopped = await processManager.stopProject(id);

    if (!stopped) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to stop project process",
          code: "STOP_FAILED",
        },
        { status: 500 }
      );
    }

    // 更新项目配置
    await updateProjectConfig(id, {
      isRunning: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        isRunning: false,
        url: undefined,
      },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`POST /api/projects/${id}/stop error:`, error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to stop project: ${errorMessage}`,
        code: "STOP_ERROR",
      },
      { status: 500 }
    );
  }
}
