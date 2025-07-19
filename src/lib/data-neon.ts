import { Pool } from "@neondatabase/serverless";

export interface Gist {
  id: string;
  user_id: string;
  description: string;
  filename: string;
  content: string;
  created_at: number;
  updated_at: number;
}

// Neon 数据库连接池
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * 从 Neon 数据库加载指定用户的 gists
 */
export async function loadGists(userId?: string): Promise<Gist[]> {
  try {
    console.log("Loading gists from Neon database...");

    const client = await pool.connect();
    let result;

    if (userId) {
      // 加载特定用户的 gists
      result = await client.query(
        "SELECT * FROM gists WHERE user_id = $1 ORDER BY updated_at DESC",
        [userId]
      );
    } else {
      // 加载所有 gists（用于管理员或兼容性）
      result = await client.query(
        "SELECT * FROM gists ORDER BY updated_at DESC"
      );
    }

    client.release();

    const gists: Gist[] = result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      description: row.description,
      filename: row.filename,
      content: row.content,
      created_at: parseInt(row.created_at),
      updated_at: parseInt(row.updated_at),
    }));

    console.log(`Successfully loaded ${gists.length} gists from Neon`);
    return gists;
  } catch (error) {
    console.error("Error loading gists from Neon:", error);
    return [];
  }
}

/**
 * 保存单个 gist 到 Neon 数据库
 */
export async function saveGist(gist: Gist): Promise<Gist> {
  try {
    const client = await pool.connect();

    // 使用 UPSERT (INSERT ... ON CONFLICT)
    const result = await client.query(
      `
      INSERT INTO gists (id, user_id, description, filename, content, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) 
      DO UPDATE SET 
        description = EXCLUDED.description,
        filename = EXCLUDED.filename,
        content = EXCLUDED.content,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `,
      [
        gist.id,
        gist.user_id,
        gist.description,
        gist.filename,
        gist.content,
        gist.created_at,
        gist.updated_at,
      ]
    );

    client.release();

    const savedGist: Gist = {
      id: result.rows[0].id,
      user_id: result.rows[0].user_id,
      description: result.rows[0].description,
      filename: result.rows[0].filename,
      content: result.rows[0].content,
      created_at: parseInt(result.rows[0].created_at),
      updated_at: parseInt(result.rows[0].updated_at),
    };

    console.log("Successfully saved gist to Neon");
    return savedGist;
  } catch (error) {
    console.error("Error saving gist to Neon:", error);
    throw new Error("Failed to save gist to database");
  }
}

/**
 * 批量保存 gists（为了兼容现有接口）
 */
export async function saveGists(gists: Gist[]): Promise<void> {
  try {
    const client = await pool.connect();

    // 开始事务
    await client.query("BEGIN");

    try {
      // 清空现有数据
      await client.query("DELETE FROM gists");

      // 批量插入新数据
      for (const gist of gists) {
        await client.query(
          `
          INSERT INTO gists (id, user_id, description, filename, content, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            gist.id,
            gist.user_id,
            gist.description,
            gist.filename,
            gist.content,
            gist.created_at,
            gist.updated_at,
          ]
        );
      }

      // 提交事务
      await client.query("COMMIT");
      console.log(`Successfully saved ${gists.length} gists to Neon`);
    } catch (error) {
      // 回滚事务
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error batch saving gists to Neon:", error);
    throw new Error("Failed to save gists to database");
  }
}

/**
 * 获取单个 gist
 */
export async function getGist(id: string): Promise<Gist | null> {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM gists WHERE id = $1", [
      id,
    ]);
    client.release();

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      description: row.description,
      filename: row.filename,
      content: row.content,
      created_at: parseInt(row.created_at),
      updated_at: parseInt(row.updated_at),
    };
  } catch (error) {
    console.error("Error getting gist from Neon:", error);
    return null;
  }
}

/**
 * 删除单个 gist
 */
// --- 修改为 (处理可能的 null) ---
export async function deleteGist(id: string): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM gists WHERE id = $1", [id]);
    client.release();

    console.log("Successfully deleted gist from Neon");
    // 如果 result.rowCount 是 null，则我们视其为 0。
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error deleting gist from Neon:", error);
    return false;
  }
}

/**
 * 获取 gists 统计信息
 */
export async function getGistStats(): Promise<{
  total: number;
  lastUpdated: number | null;
}> {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        MAX(updated_at) as last_updated
      FROM gists
    `);
    client.release();

    return {
      total: parseInt(result.rows[0].total),
      lastUpdated: result.rows[0].last_updated
        ? parseInt(result.rows[0].last_updated)
        : null,
    };
  } catch (error) {
    console.error("Error getting gist stats from Neon:", error);
    return { total: 0, lastUpdated: null };
  }
}
