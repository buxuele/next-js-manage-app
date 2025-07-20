import { NextResponse } from "next/server";
import { getTask, saveTask, deleteTask } from "@/lib/data-adapter";
import { validateTaskData } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-middleware";

// Next.js 15 API 路由参数类型
type RouteParams = {
  params: Promise<{ task_id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  // 检查用户认证
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // 返回认证错误
  }

  try {
    const { task_id } = await params;
    const task = await getTask(task_id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 检查权限：只有 task 的所有者才能访问
    if (task.user_id !== authResult.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
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
    const { task_id } = await params;
    const data = await request.json();

    // 首先检查 task 是否存在以及权限
    const existingTask = await getTask(task_id);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 检查权限：只有 task 的所有者才能修改
    if (existingTask.user_id !== authResult.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 使用新的验证函数
    const validation = validateTaskData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // 使用适配器的 saveTask 方法
    const updatedTask = await saveTask({
      id: task_id,
      user_id: existingTask.user_id, // 保持原有的用户关联
      description: data.description.trim(),
      filename: data.filename?.trim(),
      content: data.content.trim(),
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
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
    const { task_id } = await params;

    // 首先检查 task 是否存在以及权限
    const existingTask = await getTask(task_id);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 检查权限：只有 task 的所有者才能删除
    if (existingTask.user_id !== authResult.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const success = await deleteTask(task_id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
