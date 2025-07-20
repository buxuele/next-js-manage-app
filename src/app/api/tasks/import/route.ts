import { NextResponse } from "next/server";
import { saveTask } from "@/lib/data-adapter";
import { validateTaskData } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-middleware";

export async function POST(request: Request) {
  // 检查用户认证
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult; // 返回认证错误
  }

  try {
    const importData = await request.json();

    // 验证导入数据格式
    if (!importData.tasks || !Array.isArray(importData.tasks)) {
      return NextResponse.json(
        {
          success: false,
          error: "无效的导入数据格式",
        },
        { status: 400 }
      );
    }

    const tasks = importData.tasks;
    const results = {
      imported: 0,
      total: tasks.length,
      errors: [] as string[],
    };

    // 逐个导入任务
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      try {
        // 验证任务数据
        const validation = validateTaskData(task);
        if (!validation.isValid) {
          results.errors.push(`任务 ${i + 1}: ${validation.errors.join(", ")}`);
          continue;
        }

        // 保存任务，关联到当前用户
        await saveTask({
          user_id: authResult.user.id,
          description: task.description,
          filename: task.filename || "untitled.txt",
          content: task.content,
        });

        results.imported++;
      } catch (error) {
        console.error(`Error importing task ${i + 1}:`, error);
        results.errors.push(`任务 ${i + 1}: 导入失败`);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error importing tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "导入失败，请检查文件格式",
      },
      { status: 500 }
    );
  }
}
