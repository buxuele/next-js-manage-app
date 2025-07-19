import { NextResponse } from "next/server";
import { loadGists, saveGist } from "@/lib/data-adapter";
import { validateGistData } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-middleware";

export async function GET() {
  // 检查用户认证
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // 返回认证错误
  }

  try {
    // 只加载当前用户的 gists
    const gists = await loadGists(authResult.user.id);
    return NextResponse.json(gists);
  } catch (error) {
    console.error("Error loading gists:", error);
    return NextResponse.json(
      { error: "Failed to load gists" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // 检查用户认证
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // 返回认证错误
  }

  try {
    const data = await request.json();

    // 使用新的验证函数
    const validation = validateGistData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // 使用适配器的 saveGist 方法，关联到当前用户
    const newGist = await saveGist({
      user_id: authResult.user.id,
      description: data.description,
      filename: data.filename || "untitled.txt",
      content: data.content,
    });

    return NextResponse.json(newGist, { status: 201 });
  } catch (error) {
    console.error("Error creating gist:", error);
    return NextResponse.json(
      { error: "Failed to create gist" },
      { status: 500 }
    );
  }
}
