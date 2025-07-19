import { NextResponse } from "next/server";
import { processManager } from "@/lib/process-manager";
import { readProjectsConfig } from "@/lib/project-config";
import { ApiResponse } from "@/types";

/**
 * GET /api/projects/status - 获取所有项目的状态
 */
export async function GET() {
  try {
    // 读取项目配置
    const projects = await readProjectsConfig();

    // 检查所有项目状态
    const statusMap = await processManager.checkAllProjectsStatus(
      projects.map((p) => ({
        id: p.id,
        path: p.path,
        port: p.port || 3000,
      }))
    );

    // 转换为数组格式
    const statusList = Array.from(statusMap.entries()).map(([id, status]) => ({
      ...status,
      id, // Override the id from status with the map key
    }));

    const response: ApiResponse = {
      success: true,
      data: statusList,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error checking projects status:", error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check projects status",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
