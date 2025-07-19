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
 * POST /api/projects/[id]/start - 启动项目开发服务器
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

    // 检查项目是否已在运行
    const currentStatus = processManager.getProjectStatus(id);
    if (currentStatus?.isRunning) {
      return NextResponse.json(
        {
          success: false,
          error: "Project is already running",
          code: "ALREADY_RUNNING",
        },
        { status: 400 }
      );
    }

    // 启动项目
    const status = await processManager.startProject(
      id,
      project.path,
      project.port || 3000
    );

    // 更新项目配置
    await updateProjectConfig(id, {
      isRunning: true,
      port: status.port,
      url: `http://localhost:${status.port}`,
      lastAccessed: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        isRunning: true,
        port: status.port,
        url: `http://localhost:${status.port}`,
        pid: status.pid,
        startTime: status.startTime,
      },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`POST /api/projects/${id}/start error:`, error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to start project: ${errorMessage}`,
        code: "START_ERROR",
      },
      { status: 500 }
    );
  }
}
