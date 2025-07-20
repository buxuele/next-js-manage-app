import { Pool } from "@neondatabase/serverless";

export interface Task {
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
 * 从 Neon 数据库加载指定用户的 tasks
 */
export async function loadTasks(userId?: string): Promise<Task[]> {
  try {
    console.log("Loading tasks from Neon database...");

    const client = await pool.connect();
    let result;

    if (userId) {
      // 加载特定用户的 tasks
      result = await client.query(
        "SELECT * FROM tasks WHERE user_id = $1 ORDER BY updated_at DESC",
        [userId]
      );
    } else {
      // 加载所有 tasks（用于管理员或兼容性）
      result = await client.query(
        "SELECT * FROM tasks ORDER BY updated_at DESC"
      );
    }

    client.release();

    const tasks: Task[] = result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      description: row.description,
      filename: row.filename,
      content: row.content,
      created_at: parseInt(row.created_at),
      updated_at: parseInt(row.updated_at),
    }));

    console.log(`Successfully loaded ${tasks.length} tasks from Neon`);
    return tasks;
  } catch (error) {
    console.error("Error loading tasks from Neon:", error);
    return [];
  }
}

/**
 * 保存单个 task 到 Neon 数据库
 */
export async function saveTask(task: Task): Promise<Task> {
  try {
    const client = await pool.connect();

    // 使用 UPSERT (INSERT ... ON CONFLICT)
    const result = await client.query(
      `
      INSERT INTO tasks (id, user_id, description, filename, content, created_at, updated_at)
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
        task.id,
        task.user_id,
        task.description,
        task.filename,
        task.content,
        task.created_at,
        task.updated_at,
      ]
    );

    client.release();

    const savedTask: Task = {
      id: result.rows[0].id,
      user_id: result.rows[0].user_id,
      description: result.rows[0].description,
      filename: result.rows[0].filename,
      content: result.rows[0].content,
      created_at: parseInt(result.rows[0].created_at),
      updated_at: parseInt(result.rows[0].updated_at),
    };

    console.log("Successfully saved task to Neon");
    return savedTask;
  } catch (error) {
    console.error("Error saving task to Neon:", error);
    throw new Error("Failed to save task to database");
  }
}

/**
 * 批量保存 tasks（为了兼容现有接口）
 */
export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    const client = await pool.connect();

    // 开始事务
    await client.query("BEGIN");

    try {
      // 清空现有数据
      await client.query("DELETE FROM tasks");

      // 批量插入新数据
      for (const task of tasks) {
        await client.query(
          `
          INSERT INTO tasks (id, user_id, description, filename, content, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
          [
            task.id,
            task.user_id,
            task.description,
            task.filename,
            task.content,
            task.created_at,
            task.updated_at,
          ]
        );
      }

      // 提交事务
      await client.query("COMMIT");
      console.log(`Successfully saved ${tasks.length} tasks to Neon`);
    } catch (error) {
      // 回滚事务
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error batch saving tasks to Neon:", error);
    throw new Error("Failed to save tasks to database");
  }
}

/**
 * 获取单个 task
 */
export async function getTask(id: string): Promise<Task | null> {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM tasks WHERE id = $1", [
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
    console.error("Error getting task from Neon:", error);
    return null;
  }
}

/**
 * 删除单个 task
 */
// --- 修改为 (处理可能的 null) ---
export async function deleteTask(id: string): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM tasks WHERE id = $1", [id]);
    client.release();

    console.log("Successfully deleted task from Neon");
    // 如果 result.rowCount 是 null，则我们视其为 0。
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error deleting task from Neon:", error);
    return false;
  }
}

/**
 * 获取 tasks 统计信息
 */
export async function getTaskStats(): Promise<{
  total: number;
  lastUpdated: number | null;
}> {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        MAX(updated_at) as last_updated
      FROM tasks
    `);
    client.release();

    return {
      total: parseInt(result.rows[0].total),
      lastUpdated: result.rows[0].last_updated
        ? parseInt(result.rows[0].last_updated)
        : null,
    };
  } catch (error) {
    console.error("Error getting task stats from Neon:", error);
    return { total: 0, lastUpdated: null };
  }
}
