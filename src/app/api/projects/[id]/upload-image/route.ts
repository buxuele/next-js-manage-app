import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // 验证项目是否属于当前用户
    const projects = await query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, session.user.id]
    );

    if (projects.length === 0) {
      return NextResponse.json(
        { success: false, error: "项目不存在或无权限" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "没有找到图片文件" },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "文件类型不支持，请上传图片文件" },
        { status: 400 }
      );
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "文件大小不能超过5MB" },
        { status: 400 }
      );
    }

    // 创建上传目录
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // 目录可能已存在，忽略错误
    }

    // 生成唯一文件名
    const fileExtension = file.name.split(".").pop() || "jpg";
    const uniqueFilename = `${projectId}_${uuidv4().substring(
      0,
      8
    )}.${fileExtension}`;
    const filePath = join(uploadDir, uniqueFilename);

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 删除旧图片（如果存在）
    const project = projects[0];
    if (project.image) {
      try {
        const oldImagePath = join(
          process.cwd(),
          "public",
          project.image.replace("/", "")
        );
        const { existsSync, unlinkSync } = await import("fs");
        if (existsSync(oldImagePath)) {
          unlinkSync(oldImagePath);
        }
      } catch {
        console.warn("删除旧图片失败");
      }
    }

    // 更新数据库中的图片路径
    const imageUrl = `/uploads/${uniqueFilename}`;
    await query(
      `UPDATE projects SET image = $1, updated_at = $2 WHERE id = $3`,
      [imageUrl, Date.now(), projectId]
    );

    return NextResponse.json({
      success: true,
      image_url: imageUrl,
      message: "图片上传成功",
    });
  } catch (error) {
    console.error("图片上传失败:", error);
    return NextResponse.json(
      { success: false, error: "图片上传失败" },
      { status: 500 }
    );
  }
}
