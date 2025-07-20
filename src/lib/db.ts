import { Pool } from "@neondatabase/serverless";

// Neon 数据库连接池
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * 执行数据库查询
 * @param text SQL查询语句
 * @param params 查询参数
 * @returns 查询结果
 */
export async function query(text: string, params?: any[]): Promise<any[]> {
  try {
    const client = await pool.connect();
    const result = await client.query(text, params);
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * 执行事务
 * @param callback 事务回调函数
 * @returns 事务结果
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
