import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";

const execAsync = promisify(exec);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ project_id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取参数
    const { project_id } = await params;

    // 获取项目信息
    const projects = await query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [project_id, session.user.id]
    );

    if (projects.length === 0) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    const project = projects[0];
    const projectPath = project.path;

    if (!projectPath) {
      return NextResponse.json({ error: "项目路径未设置" }, { status: 400 });
    }

    // 检查路径是否存在
    if (!fs.existsSync(projectPath)) {
      return NextResponse.json({ error: "项目路径不存在" }, { status: 404 });
    }

    // 根据操作系统打开文件夹
    let command: string;
    const platform = process.platform;

    switch (platform) {
      case "win32":
        command = `explorer "${projectPath}"`;
        break;
      case "darwin":
        command = `open "${projectPath}"`;
        break;
      case "linux":
        command = `xdg-open "${projectPath}"`;
        break;
      default:
        return NextResponse.json(
          { error: "不支持的操作系统" },
          { status: 500 }
        );
    }

    await execAsync(command);

    return NextResponse.json({
      success: true,
      message: "文件夹已打开",
    });
  } catch (error) {
    console.error("打开文件夹失败:", error);
    return NextResponse.json({ error: "打开文件夹失败" }, { status: 500 });
  }
}
