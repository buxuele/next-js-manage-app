// 测试开发用户创建
const { Pool } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function testDevUser() {
  console.log("🔍 测试开发用户创建...\n");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const client = await pool.connect();

    // 检查开发用户是否存在
    const result = await client.query(
      "SELECT * FROM users WHERE github_id = $1",
      [999999]
    );

    if (result.rows.length > 0) {
      console.log("✅ 开发用户已存在:");
      console.log("   ID:", result.rows[0].id);
      console.log("   用户名:", result.rows[0].username);
      console.log("   邮箱:", result.rows[0].email);
    } else {
      console.log("❌ 开发用户不存在，尝试创建...");

      // 创建开发用户
      const devUserId = "00000000-0000-0000-0000-000000000001";
      const now = Date.now();

      const createResult = await client.query(
        `INSERT INTO users (id, github_id, username, email, avatar_url, name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (github_id) DO UPDATE SET 
           username = EXCLUDED.username,
           email = EXCLUDED.email,
           avatar_url = EXCLUDED.avatar_url,
           name = EXCLUDED.name,
           updated_at = EXCLUDED.updated_at
         RETURNING *`,
        [
          devUserId,
          999999,
          "developer",
          "dev@localhost.com",
          "/default-avatar.png",
          "开发用户",
          now,
          now,
        ]
      );

      if (createResult.rows.length > 0) {
        console.log("✅ 开发用户创建成功:");
        console.log("   ID:", createResult.rows[0].id);
        console.log("   用户名:", createResult.rows[0].username);
      } else {
        console.log("❌ 开发用户创建失败");
      }
    }

    client.release();
  } catch (error) {
    console.error("❌ 数据库操作失败:", error.message);

    if (error.message.includes('relation "users" does not exist')) {
      console.log("\n💡 提示: 用户表不存在，请先运行数据库初始化脚本");
    }
  }

  await pool.end();
}

testDevUser().catch(console.error);
