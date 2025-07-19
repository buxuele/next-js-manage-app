// 数据迁移脚本：从本地 JSON 迁移到 Neon 数据库
const fs = require("fs");
const { Pool } = require("@neondatabase/serverless");

async function migrateToNeon() {
  try {
    // 检查环境变量
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL 环境变量未设置");
      console.log(
        "请在 .env 文件中设置 DATABASE_URL=your_neon_connection_string"
      );
      process.exit(1);
    }

    // 读取本地 gists.json
    if (!fs.existsSync("gists.json")) {
      console.error("❌ gists.json 文件不存在");
      process.exit(1);
    }

    const localData = JSON.parse(fs.readFileSync("gists.json", "utf-8"));
    console.log(`📁 找到 ${localData.length} 个本地 gists`);

    // 连接到 Neon 数据库
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    try {
      // 开始事务
      await client.query("BEGIN");

      // 清空现有数据（可选，如果你想保留现有数据请注释掉这行）
      await client.query("DELETE FROM gists");
      console.log("🗑️  清空了现有数据");

      // 批量插入数据
      let insertedCount = 0;
      for (const gist of localData) {
        await client.query(
          `
          INSERT INTO gists (id, description, filename, content, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            description = EXCLUDED.description,
            filename = EXCLUDED.filename,
            content = EXCLUDED.content,
            updated_at = EXCLUDED.updated_at
        `,
          [
            gist.id,
            gist.description,
            gist.filename,
            gist.content,
            gist.created_at,
            gist.updated_at,
          ]
        );
        insertedCount++;
      }

      // 提交事务
      await client.query("COMMIT");
      console.log(`✅ 成功迁移 ${insertedCount} 个 gists 到 Neon 数据库`);

      // 验证迁移
      const result = await client.query("SELECT COUNT(*) as count FROM gists");
      console.log(`🔍 验证：数据库中现在有 ${result.rows[0].count} 个 gists`);
    } catch (error) {
      // 回滚事务
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ 迁移失败:", error);
    process.exit(1);
  }
}

migrateToNeon();
