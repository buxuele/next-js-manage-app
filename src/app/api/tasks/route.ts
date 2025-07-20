import { NextResponse } from "next/server";
import { loadTasks, saveTask } from "@/lib/data-adapter";
import { validateTaskData } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-middleware";

export async function GET() {
  // 检查用户认证
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // 返回认证错误
  }

  try {
    // 只加载当前用户的 tasks
    const tasks = await loadTasks(authResult.user.id);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error loading tasks:", error);
    return NextResponse.json(
      { error: "Failed to load tasks" },
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
    const validation = validateTaskData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // 使用适配器的 saveTask 方法，关联到当前用户
    const newTask = await saveTask({
      user_id: authResult.user.id,
      description: data.description,
      filename: data.filename || "untitled.txt",
      content: data.content,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
