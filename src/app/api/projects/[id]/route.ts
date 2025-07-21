import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
    const projects = await query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [id, session.user.id]
    );

    if (projects.length === 0) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    return NextResponse.json(projects[0]);
  } catch (error) {
    console.error("获取项目失败:", error);
    return NextResponse.json({ error: "获取项目失败" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const now = Date.now();
    const result = await query(
      `UPDATE projects 
       SET name = $1, description = $2, url = $3, path = $4, updated_at = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, description || "", url, path || "", now, id, session.user.id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("更新项目失败:", error);
    return NextResponse.json({ error: "更新项目失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
    const result = await query(
      `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, session.user.id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "项目已删除" });
  } catch (error) {
    console.error("删除项目失败:", error);
    return NextResponse.json({ error: "删除项目失败" }, { status: 500 });
  }
}
