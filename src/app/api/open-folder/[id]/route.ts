import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // 获取项目信息
    const projects = await query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, session.user.id]
    );

    if (projects.length === 0) {
      return NextResponse.json(
        { success: false, message: "项目不存在" },
        { status: 404 }
      );
    }

    const project = projects[0];
    const projectPath = project.path;

    if (!projectPath) {
      return NextResponse.json({
        success: false,
        message: "项目路径为空",
      });
    }

    // 检查路径是否存在
    try {
      const { existsSync } = await import("fs");
      if (!existsSync(projectPath)) {
        return NextResponse.json({
          success: false,
          message: "路径不存在或无法访问",
        });
      }
    } catch {
      return NextResponse.json({
        success: false,
        message: "无法访问路径",
      });
    }

    // 根据操作系统打开文件夹
    try {
      const platform = process.platform;
      let command = "";

      if (platform === "win32") {
        // Windows
        command = `explorer "${projectPath}"`;
      } else if (platform === "darwin") {
        // macOS
        command = `open "${projectPath}"`;
      } else {
        // Linux
        command = `xdg-open "${projectPath}"`;
      }

      await execAsync(command);

      return NextResponse.json({
        success: true,
        message: "目录已打开",
      });
    } catch (error) {
      console.error("打开目录失败:", error);
      return NextResponse.json({
        success: false,
        message: "打开目录失败",
      });
    }
  } catch (error) {
    console.error("API错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
