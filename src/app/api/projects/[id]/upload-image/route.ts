import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";

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

    // 将文件转换为Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    // 更新数据库中的图片数据
    await query(
      `UPDATE projects SET image = $1, updated_at = $2 WHERE id = $3`,
      [dataUrl, Date.now(), projectId]
    );

    return NextResponse.json({
      success: true,
      image_url: dataUrl,
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
