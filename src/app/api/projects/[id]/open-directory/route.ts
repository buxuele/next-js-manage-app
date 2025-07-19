import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";
import { getProjectConfig } from "@/lib/project-config";
import { ApiResponse } from "@/types";

const execAsync = promisify(exec);

/**
 * POST /api/projects/[id]/open-directory - 在文件管理器中打开项目目录
 */
export async function POST(
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

    // 验证路径是否存在
    const projectPath = path.resolve(project.path);

    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        const response: ApiResponse = {
          success: false,
          error: "Project path is not a directory",
          code: "INVALID_PATH",
        };
        return NextResponse.json(response, { status: 400 });
      }
    } catch {
      const response: ApiResponse = {
        success: false,
        error: "Project directory does not exist",
        code: "PATH_NOT_FOUND",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // 根据操作系统打开目录
    let command: string;
    const platform = process.platform;

    switch (platform) {
      case "win32":
        // Windows - 使用 explorer
        command = `explorer "${projectPath}"`;
        break;
      case "darwin":
        // macOS - 使用 open
        command = `open "${projectPath}"`;
        break;
      case "linux":
        // Linux - 使用 xdg-open
        command = `xdg-open "${projectPath}"`;
        break;
      default:
        const response: ApiResponse = {
          success: false,
          error: `Unsupported platform: ${platform}`,
          code: "UNSUPPORTED_PLATFORM",
        };
        return NextResponse.json(response, { status: 400 });
    }

    // 执行命令
    try {
      await execAsync(command);

      const response: ApiResponse = {
        success: true,
        data: {
          message: "Directory opened successfully",
          path: projectPath,
          platform,
        },
      };

      return NextResponse.json(response);
    } catch (execError) {
      console.error("Error executing open directory command:", execError);

      const response: ApiResponse = {
        success: false,
        error: "Failed to open directory",
        code: "EXEC_ERROR",
      };

      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    const resolvedParams = await params;
    console.error(
      `Error opening directory for project ${resolvedParams.id}:`,
      error
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to open directory",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
