import { Pool } from "@neondatabase/serverless";
import { ProjectConfig, ProjectFormData } from "@/types";

// 数据库连接池
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * 读取用户的所有项目配置
 */
export async function readProjectsConfig(
  userId?: string
): Promise<ProjectConfig[]> {
  try {
    console.log("Loading projects from Neon database...");

    const client = await pool.connect();
    let result;

    if (userId) {
      // 加载特定用户的项目
      result = await client.query(
        "SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC",
        [userId]
      );
    } else {
      // 加载所有项目（用于管理员或兼容性）
      result = await client.query(
        "SELECT * FROM projects ORDER BY updated_at DESC"
      );
    }

    client.release();

    const projects: ProjectConfig[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description || "",
      path: row.path,
      port: row.port || 3000,
      isRunning: row.is_running || false,
      url: row.port ? `http://localhost:${row.port}` : undefined,
      icon: row.icon || undefined,
      lastAccessed: row.last_accessed ? new Date(row.last_accessed) : undefined,
    }));

    console.log(`Successfully loaded ${projects.length} projects from Neon`);
    return projects;
  } catch (error) {
    console.error("!!! Critical Error loading projects from Neon:", error);
    return [];
  }
}

/**
 * 添加新的项目配置
 */
export async function addProjectConfig(
  projectData: ProjectFormData,
  userId: string
): Promise<ProjectConfig> {
  try {
    const client = await pool.connect();
    const now = Date.now();

    const result = await client.query(
      `
      INSERT INTO projects (user_id, name, description, path, port, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        userId,
        projectData.name,
        projectData.description || "",
        projectData.path,
        projectData.port || 3000,
        now,
        now,
      ]
    );

    client.release();

    const row = result.rows[0];
    const newProject: ProjectConfig = {
      id: row.id,
      name: row.name,
      description: row.description || "",
      path: row.path,
      port: row.port || 3000,
      isRunning: row.is_running || false,
      url: row.port ? `http://localhost:${row.port}` : undefined,
      icon: row.icon || undefined,
      lastAccessed: row.last_accessed ? new Date(row.last_accessed) : undefined,
    };

    console.log("Successfully added project:", newProject.id);
    return newProject;
  } catch (error) {
    console.error("Error adding project:", error);
    throw new Error("Failed to add project");
  }
}

/**
 * 更新项目配置
 */
export async function updateProjectConfig(
  projectId: string,
  updates: Partial<
    ProjectFormData & { isRunning?: boolean; lastAccessed?: Date }
  >
): Promise<ProjectConfig | null> {
  try {
    const client = await pool.connect();
    const now = Date.now();

    // 构建动态更新查询
    const updateFields: string[] = [];
    const values: any[] = [projectId];
    let paramIndex = 2;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.path !== undefined) {
      updateFields.push(`path = $${paramIndex++}`);
      values.push(updates.path);
    }
    if (updates.port !== undefined) {
      updateFields.push(`port = $${paramIndex++}`);
      values.push(updates.port);
    }
    if (updates.isRunning !== undefined) {
      updateFields.push(`is_running = $${paramIndex++}`);
      values.push(updates.isRunning);
    }
    if (updates.lastAccessed !== undefined) {
      updateFields.push(`last_accessed = $${paramIndex++}`);
      values.push(updates.lastAccessed.getTime());
    }

    // 总是更新 updated_at
    updateFields.push(`updated_at = $${paramIndex++}`);
    values.push(now);

    if (updateFields.length === 1) {
      // 只有 updated_at，没有实际更新
      return null;
    }

    const query = `
      UPDATE projects 
      SET ${updateFields.join(", ")}
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(query, values);
    client.release();

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const updatedProject: ProjectConfig = {
      id: row.id,
      name: row.name,
      description: row.description || "",
      path: row.path,
      port: row.port || 3000,
      isRunning: row.is_running || false,
      url: row.port ? `http://localhost:${row.port}` : undefined,
      icon: row.icon || undefined,
      lastAccessed: row.last_accessed ? new Date(row.last_accessed) : undefined,
    };

    console.log("Successfully updated project:", updatedProject.id);
    return updatedProject;
  } catch (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }
}

/**
 * 删除项目配置
 */
export async function deleteProjectConfig(projectId: string): Promise<boolean> {
  try {
    const client = await pool.connect();

    const result = await client.query("DELETE FROM projects WHERE id = $1", [
      projectId,
    ]);

    client.release();

    const deleted = result.rowCount > 0;
    if (deleted) {
      console.log("Successfully deleted project:", projectId);
    }

    return deleted;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }
}

/**
 * 根据ID获取单个项目配置
 */
export async function getProjectConfig(
  projectId: string
): Promise<ProjectConfig | null> {
  try {
    const client = await pool.connect();

    const result = await client.query("SELECT * FROM projects WHERE id = $1", [
      projectId,
    ]);

    client.release();

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const project: ProjectConfig = {
      id: row.id,
      name: row.name,
      description: row.description || "",
      path: row.path,
      port: row.port || 3000,
      isRunning: row.is_running || false,
      url: row.port ? `http://localhost:${row.port}` : undefined,
      icon: row.icon || undefined,
      lastAccessed: row.last_accessed ? new Date(row.last_accessed) : undefined,
    };

    return project;
  } catch (error) {
    console.error("Error getting project:", error);
    return null;
  }
}

/**
 * 记录端口使用日志
 */
export async function logPortUsage(
  projectId: string,
  userId: string,
  port: number,
  action: "start" | "stop" | "restart",
  pid?: number,
  startTime?: Date,
  endTime?: Date
): Promise<void> {
  try {
    const client = await pool.connect();
    const now = Date.now();

    let duration: number | null = null;
    if (startTime && endTime) {
      duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    }

    await client.query(
      `
      INSERT INTO port_usage_logs (project_id, user_id, port, action, pid, start_time, end_time, duration, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        projectId,
        userId,
        port,
        action,
        pid || null,
        startTime ? startTime.getTime() : null,
        endTime ? endTime.getTime() : null,
        duration,
        now,
      ]
    );

    client.release();
    console.log(
      `Logged port usage: ${action} on port ${port} for project ${projectId}`
    );
  } catch (error) {
    console.error("Error logging port usage:", error);
    // 不抛出错误，因为日志记录失败不应该影响主要功能
  }
}
