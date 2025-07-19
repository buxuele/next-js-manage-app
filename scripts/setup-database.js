#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于在 Neon 数据库中创建必要的表结构
 */

const { Pool } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function setupDatabase() {
  console.log("🚀 开始初始化数据库...");

  // 检查环境变量
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ 错误: DATABASE_URL 环境变量未设置");
    process.exit(1);
  }

  try {
    // 创建数据库连接
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();

    console.log("✅ 数据库连接成功");

    // 读取 SQL 文件
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // 分割 SQL 语句（按分号分割，忽略注释）
    const statements = schemaSql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"));

    console.log(`📝 准备执行 ${statements.length} 条 SQL 语句...`);

    // 执行每条 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await client.query(statement);
          console.log(
            `✅ 执行成功 (${i + 1}/${statements.length}): ${statement.substring(
              0,
              50
            )}...`
          );
        } catch (error) {
          // 如果是表已存在的错误，忽略它
          if (error.message.includes("already exists")) {
            console.log(`⚠️  跳过 (${i + 1}/${statements.length}): 表已存在`);
          } else {
            console.error(
              `❌ 执行失败 (${i + 1}/${statements.length}):`,
              error.message
            );
            throw error;
          }
        }
      }
    }

    // 验证表是否创建成功
    console.log("\n🔍 验证表结构...");

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("📋 数据库中的表:");
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    // 检查用户表结构
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log("\n👤 users 表结构:");
    usersColumns.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (${
          row.is_nullable === "YES" ? "nullable" : "not null"
        })`
      );
    });

    client.release();
    console.log("\n🎉 数据库初始化完成！");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
