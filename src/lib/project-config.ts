import { promises as fs } from "fs";
import path from "path";
import { ProjectConfig } from "@/types";

const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "projects.json");

/**
 * 项目配置数据结构
 */
interface ProjectsData {
  projects: ProjectConfig[];
}

/**
 * 默认配置数据
 */
const DEFAULT_CONFIG: ProjectsData = {
  projects: [],
};

/**
 * 确保配置目录和文件存在
 */
async function ensureConfigFile(): Promise<void> {
  try {
    const configDir = path.dirname(CONFIG_FILE_PATH);

    // 确保目录存在
    await fs.mkdir(configDir, { recursive: true });

    // 检查文件是否存在
    try {
      await fs.access(CONFIG_FILE_PATH);
    } catch {
      // 文件不存在，创建默认配置
      await fs.writeFile(
        CONFIG_FILE_PATH,
        JSON.stringify(DEFAULT_CONFIG, null, 2)
      );
    }
  } catch (error) {
    console.error("Error ensuring config file:", error);
    throw new Error("Failed to initialize project configuration file");
  }
}

/**
 * 读取项目配置
 */
export async function readProjectsConfig(): Promise<ProjectConfig[]> {
  try {
    await ensureConfigFile();

    const data = await fs.readFile(CONFIG_FILE_PATH, "utf-8");
    const config: ProjectsData = JSON.parse(data);

    return config.projects || [];
  } catch (error) {
    console.error("Error reading projects config:", error);
    throw new Error("Failed to read project configuration");
  }
}

/**
 * 写入项目配置
 */
export async function writeProjectsConfig(
  projects: ProjectConfig[]
): Promise<void> {
  try {
    await ensureConfigFile();

    const config: ProjectsData = { projects };
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Error writing projects config:", error);
    throw new Error("Failed to write project configuration");
  }
}

/**
 * 添加项目配置
 */
export async function addProjectConfig(
  project: Omit<ProjectConfig, "id">
): Promise<ProjectConfig> {
  try {
    const projects = await readProjectsConfig();

    // 生成唯一 ID
    const id = `project_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newProject: ProjectConfig = {
      ...project,
      id,
      isRunning: false,
      lastAccessed: new Date(),
    };

    projects.push(newProject);
    await writeProjectsConfig(projects);

    return newProject;
  } catch (error) {
    console.error("Error adding project config:", error);
    throw new Error("Failed to add project configuration");
  }
}

/**
 * 更新项目配置
 */
export async function updateProjectConfig(
  id: string,
  updates: Partial<ProjectConfig>
): Promise<ProjectConfig | null> {
  try {
    const projects = await readProjectsConfig();
    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    projects[index] = { ...projects[index], ...updates };
    await writeProjectsConfig(projects);

    return projects[index];
  } catch (error) {
    console.error("Error updating project config:", error);
    throw new Error("Failed to update project configuration");
  }
}

/**
 * 删除项目配置
 */
export async function deleteProjectConfig(id: string): Promise<boolean> {
  try {
    const projects = await readProjectsConfig();
    const filteredProjects = projects.filter((p) => p.id !== id);

    if (filteredProjects.length === projects.length) {
      return false; // 项目不存在
    }

    await writeProjectsConfig(filteredProjects);
    return true;
  } catch (error) {
    console.error("Error deleting project config:", error);
    throw new Error("Failed to delete project configuration");
  }
}

/**
 * 根据 ID 获取项目配置
 */
export async function getProjectConfig(
  id: string
): Promise<ProjectConfig | null> {
  try {
    const projects = await readProjectsConfig();
    return projects.find((p) => p.id === id) || null;
  } catch (error) {
    console.error("Error getting project config:", error);
    throw new Error("Failed to get project configuration");
  }
}
