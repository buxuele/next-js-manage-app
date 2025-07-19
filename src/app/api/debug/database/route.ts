import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

export async function GET() {
  try {
    // 检查环境变量
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_URL 环境变量未设置",
        },
        { status: 500 }
      );
    }

    // 创建数据库连接
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    // 测试基本连接
    const result = await client.query("SELECT NOW() as current_time");

    // 检查表是否存在
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map((row) => row.table_name);

    // 如果 users 表存在，检查其结构
    let usersTableInfo = null;
    if (tables.includes("users")) {
      const usersColumns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);
      usersTableInfo = usersColumns.rows;
    }

    client.release();

    return NextResponse.json({
      success: true,
      data: {
        connection: "成功",
        currentTime: result.rows[0].current_time,
        tables: tables,
        usersTableInfo: usersTableInfo,
      },
    });
  } catch (error) {
    console.error("Database debug error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "数据库连接失败",
      },
      { status: 500 }
    );
  }
}
