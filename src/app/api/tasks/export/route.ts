import { NextResponse } from "next/server";
import { loadTasks } from "@/lib/data-adapter";
import { requireAuth } from "@/lib/auth-middleware";

export async function GET() {
  // 检查用户认证
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // 返回认证错误
  }

  try {
    // 加载当前用户的所有任务
    const tasks = await loadTasks(authResult.user.id);

    // 返回导出数据
    return NextResponse.json({
      success: true,
      data: {
        tasks,
        exportDate: new Date().toISOString(),
        version: "1.0",
      },
    });
  } catch (error) {
    console.error("Error exporting tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "导出失败，请稍后重试",
      },
      { status: 500 }
    );
  }
}
