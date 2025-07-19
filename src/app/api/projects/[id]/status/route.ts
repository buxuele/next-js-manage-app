import { NextRequest, NextResponse } from "next/server";
import { processManager } from "@/lib/process-manager";
import { getProjectConfig } from "@/lib/project-config";
import { ApiResponse } from "@/types";

/**
 * GET /api/projects/[id]/status - 获取特定项目的状态
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取项目配置
    const project = await getProjectConfig(id);
    if (!project) {
      const response: ApiResponse = {
        success: false,
        error: "Project not found",
        code: "PROJECT_NOT_FOUND",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // 获取项目完整状态
    const status = await processManager.getProjectFullStatus(
      project.id,
      project.path,
      project.port || 3000
    );

    const response: ApiResponse = {
      success: true,
      data: status,
    };

    return NextResponse.json(response);
  } catch (error) {
    const resolvedParams = await params;
    console.error(
      `Error checking project status for ${resolvedParams.id}:`,
      error
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check project status",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
