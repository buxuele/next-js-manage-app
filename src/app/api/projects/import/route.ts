import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";

// 处理不同格式的日期时间转换为时间戳
function parseDateTime(dateValue: any): number {
  if (!dateValue) {
    return Date.now();
  }

  // 如果已经是数字（时间戳），直接返回
  if (typeof dateValue === "number") {
    return dateValue;
  }

  // 如果是字符串，尝试解析
  if (typeof dateValue === "string") {
    // 处理 "2025-07-18 18:00:06" 格式
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }

  // 如果无法解析，返回当前时间
  return Date.now();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { projects: importProjects, replace_existing } = body;

    if (!importProjects || !Array.isArray(importProjects)) {
      return NextResponse.json(
        { error: "无效的导入数据格式" },
        { status: 400 }
      );
    }

    let imported = 0;
    const total = importProjects.length;
    const errors: string[] = [];

    // 如果选择替换现有数据，先删除用户的所有项目
    if (replace_existing) {
      await query(`DELETE FROM projects WHERE user_id = $1`, [session.user.id]);
    }

    const now = Date.now();

    for (const project of importProjects) {
      try {
        if (!project.name || !project.url) {
          errors.push(`项目 "${project.name || "未命名"}" 缺少必填字段`);
          continue;
        }

        // 如果不替换现有数据，检查是否已存在同名项目
        if (!replace_existing) {
          const existing = await query(
            `SELECT id FROM projects WHERE user_id = $1 AND name = $2`,
            [session.user.id, project.name]
          );

          if (existing.length > 0) {
            errors.push(`项目 "${project.name}" 已存在，跳过导入`);
            continue;
          }
        }

        await query(
          `INSERT INTO projects (user_id, name, description, url, path, image, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            session.user.id,
            project.name,
            project.description || "",
            project.url,
            project.path || "",
            project.image || "",
            parseDateTime(project.created_at) || now,
            parseDateTime(project.updated_at) || now,
          ]
        );

        imported++;
      } catch (error) {
        console.error(`导入项目 "${project.name}" 失败:`, error);
        errors.push(`导入项目 "${project.name}" 失败: ${error}`);
      }
    }

    // 获取用户的所有项目以返回给前端
    const allProjects = await query(
      `SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
      [session.user.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        imported,
        total,
        errors,
        projects: allProjects, // 返回所有项目数据
      },
    });
  } catch (error) {
    console.error("导入项目数据失败:", error);
    return NextResponse.json({ error: "导入项目数据失败" }, { status: 500 });
  }
}
