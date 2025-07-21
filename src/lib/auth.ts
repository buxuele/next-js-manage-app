// 用户认证相关的数据模型和函数
import { Pool } from "@neondatabase/serverless";

export interface User {
  id: string;
  github_id: number;
  username: string;
  email?: string;
  avatar_url?: string;
  name?: string;
  created_at: number;
  updated_at: number;
}

// 数据库连接池
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * 根据 GitHub ID 查找用户
 */
export async function findUserByGithubId(
  githubId: number
): Promise<User | null> {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM users WHERE github_id = $1",
      [githubId]
    );
    client.release();

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      github_id: parseInt(row.github_id),
      username: row.username,
      email: row.email,
      avatar_url: row.avatar_url,
      name: row.name,
      created_at: parseInt(row.created_at),
      updated_at: parseInt(row.updated_at),
    };
  } catch (error) {
    console.error("Error finding user by GitHub ID:", error);
    return null;
  }
}

/**
 * 根据用户 ID 查找用户
 */
export async function findUserById(userId: string): Promise<User | null> {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    client.release();

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      github_id: parseInt(row.github_id),
      username: row.username,
      email: row.email,
      avatar_url: row.avatar_url,
      name: row.name,
      created_at: parseInt(row.created_at),
      updated_at: parseInt(row.updated_at),
    };
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}

/**
 * 创建新用户
 */
export async function createUser(userData: {
  github_id: number;
  username: string;
  email?: string;
  avatar_url?: string;
  name?: string;
}): Promise<User> {
  try {
    const client = await pool.connect();
    const now = Date.now();

    const result = await client.query(
      `
      INSERT INTO users (github_id, username, email, avatar_url, name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        userData.github_id,
        userData.username,
        userData.email || null,
        userData.avatar_url || null,
        userData.name || null,
        now,
        now,
      ]
    );

    client.release();

    const row = result.rows[0];
    return {
      id: row.id,
      github_id: parseInt(row.github_id),
      username: row.username,
      email: row.email,
      avatar_url: row.avatar_url,
      name: row.name,
      created_at: parseInt(row.created_at),
      updated_at: parseInt(row.updated_at),
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

/**
 * 更新用户信息
 */
export async function updateUser(
  userId: string,
  userData: {
    username?: string;
    email?: string;
    avatar_url?: string;
    name?: string;
  }
): Promise<User> {
  try {
    const client = await pool.connect();
    const now = Date.now();

    const result = await client.query(
      `
      UPDATE users 
      SET username = COALESCE($2, username),
          email = COALESCE($3, email),
          avatar_url = COALESCE($4, avatar_url),
          name = COALESCE($5, name),
          updated_at = $6
      WHERE id = $1
      RETURNING *
    `,
      [
        userId,
        userData.username || null,
        userData.email || null,
        userData.avatar_url || null,
        userData.name || null,
        now,
      ]
    );

    client.release();

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const row = result.rows[0];
    return {
      id: row.id,
      github_id: parseInt(row.github_id),
      username: row.username,
      email: row.email,
      avatar_url: row.avatar_url,
      name: row.name,
      created_at: parseInt(row.created_at),
      updated_at: parseInt(row.updated_at),
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

/**
 * 获取或创建开发用户（仅在开发模式下使用）
 */
export async function getOrCreateDevUser(): Promise<User> {
  // 使用固定的UUID作为开发用户ID
  const devUserId = "00000000-0000-0000-0000-000000000001";
  const devGithubId = 999999;

  try {
    // 先尝试通过GitHub ID查找开发用户
    let devUser = await findUserByGithubId(devGithubId);

    if (!devUser) {
      // 如果不存在，创建开发用户
      const client = await pool.connect();
      const now = Date.now();

      const result = await client.query(
        `
        INSERT INTO users (id, github_id, username, email, avatar_url, name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (github_id) DO UPDATE SET 
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          avatar_url = EXCLUDED.avatar_url,
          name = EXCLUDED.name,
          updated_at = EXCLUDED.updated_at
        RETURNING *
      `,
        [
          devUserId,
          devGithubId,
          "developer",
          "dev@localhost.com",
          "/default-avatar.png",
          "开发用户",
          now,
          now,
        ]
      );

      client.release();

      const row = result.rows[0];
      devUser = {
        id: row.id,
        github_id: parseInt(row.github_id),
        username: row.username,
        email: row.email,
        avatar_url: row.avatar_url,
        name: row.name,
        created_at: parseInt(row.created_at),
        updated_at: parseInt(row.updated_at),
      };
    }

    return devUser;
  } catch (error) {
    console.error("Error getting or creating dev user:", error);
    throw new Error("Failed to get or create dev user");
  }
}
