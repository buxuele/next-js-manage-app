import { NextResponse } from "next/server";
import { getGist, saveGist, deleteGist } from "@/lib/data-adapter";
import { validateGistData } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-middleware";

// Next.js 15 API 路由参数类型
type RouteParams = {
  params: Promise<{ gist_id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  // 检查用户认证
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // 返回认证错误
  }

  try {
    const { gist_id } = await params;
    const gist = await getGist(gist_id);

    if (!gist) {
      return NextResponse.json({ error: "Gist not found" }, { status: 404 });
    }

    // 检查权限：只有 gist 的所有者才能访问
    if (gist.user_id !== authResult.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(gist);
  } catch (error) {
    console.error("Error fetching gist:", error);
    return NextResponse.json(
      { error: "Failed to fetch gist" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  // 检查用户认证
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // 返回认证错误
  }

  try {
    const { gist_id } = await params;
    const data = await request.json();

    // 首先检查 gist 是否存在以及权限
    const existingGist = await getGist(gist_id);
    if (!existingGist) {
      return NextResponse.json({ error: "Gist not found" }, { status: 404 });
    }

    // 检查权限：只有 gist 的所有者才能修改
    if (existingGist.user_id !== authResult.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 使用新的验证函数
    const validation = validateGistData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // 使用适配器的 saveGist 方法
    const updatedGist = await saveGist({
      id: gist_id,
      user_id: existingGist.user_id, // 保持原有的用户关联
      description: data.description.trim(),
      filename: data.filename?.trim(),
      content: data.content.trim(),
    });

    return NextResponse.json(updatedGist);
  } catch (error) {
    console.error("Error updating gist:", error);
    return NextResponse.json(
      { error: "Failed to update gist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  // 检查用户认证
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // 返回认证错误
  }

  try {
    const { gist_id } = await params;

    // 首先检查 gist 是否存在以及权限
    const existingGist = await getGist(gist_id);
    if (!existingGist) {
      return NextResponse.json({ error: "Gist not found" }, { status: 404 });
    }

    // 检查权限：只有 gist 的所有者才能删除
    if (existingGist.user_id !== authResult.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const success = await deleteGist(gist_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete gist" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("Error deleting gist:", error);
    return NextResponse.json(
      { error: "Failed to delete gist" },
      { status: 500 }
    );
  }
}
