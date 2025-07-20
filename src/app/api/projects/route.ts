import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const projects = await query(
      `SELECT * FROM projects 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(projects);
  } catch (error) {
    console.error("获取项目列表失败:", error);
    return NextResponse.json({ error: "获取项目列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, url, path } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "项目名称和URL是必填项" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const result = await query(
      `INSERT INTO projects (user_id, name, description, url, path, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [session.user.id, name, description || "", url, path || "", now, now]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("创建项目失败:", error);
    return NextResponse.json({ error: "创建项目失败" }, { status: 500 });
  }
}
