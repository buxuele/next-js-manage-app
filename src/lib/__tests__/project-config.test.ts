/**
 * 项目配置管理测试
 * 这是一个基础的测试文件，用于验证项目配置的 CRUD 操作
 */

import { promises as fs } from "fs";
import path from "path";
import {
  readProjectsConfig,
  addProjectConfig,
  updateProjectConfig,
  deleteProjectConfig,
  getProjectConfig,
} from "../project-config";

// 测试用的临时配置文件路径
const TEST_CONFIG_PATH = path.join(process.cwd(), "data", "test-projects.json");

// 模拟项目数据
const mockProject = {
  name: "Test Project",
  description: "A test Next.js project",
  path: "/path/to/test/project",
  port: 3001,
};

describe("Project Configuration Management", () => {
  // 每个测试前清理测试文件
  beforeEach(async () => {
    try {
      await fs.unlink(TEST_CONFIG_PATH);
    } catch {
      // 文件不存在，忽略错误
    }
  });

  // 测试后清理
  afterAll(async () => {
    try {
      await fs.unlink(TEST_CONFIG_PATH);
    } catch {
      // 文件不存在，忽略错误
    }
  });

  test("should create default config file if not exists", async () => {
    const projects = await readProjectsConfig();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBe(0);
  });

  test("should add a new project", async () => {
    const newProject = await addProjectConfig(mockProject);

    expect(newProject.id).toBeDefined();
    expect(newProject.name).toBe(mockProject.name);
    expect(newProject.description).toBe(mockProject.description);
    expect(newProject.path).toBe(mockProject.path);
    expect(newProject.port).toBe(mockProject.port);
    expect(newProject.isRunning).toBe(false);
    expect(newProject.lastAccessed).toBeDefined();
  });

  test("should read projects from config", async () => {
    // 先添加一个项目
    await addProjectConfig(mockProject);

    // 然后读取
    const projects = await readProjectsConfig();
    expect(projects.length).toBe(1);
    expect(projects[0].name).toBe(mockProject.name);
  });

  test("should get project by id", async () => {
    // 添加项目
    const newProject = await addProjectConfig(mockProject);

    // 通过 ID 获取
    const foundProject = await getProjectConfig(newProject.id);
    expect(foundProject).not.toBeNull();
    expect(foundProject?.id).toBe(newProject.id);
    expect(foundProject?.name).toBe(mockProject.name);
  });

  test("should update project", async () => {
    // 添加项目
    const newProject = await addProjectConfig(mockProject);

    // 更新项目
    const updates = { name: "Updated Project Name", port: 3002 };
    const updatedProject = await updateProjectConfig(newProject.id, updates);

    expect(updatedProject).not.toBeNull();
    expect(updatedProject?.name).toBe(updates.name);
    expect(updatedProject?.port).toBe(updates.port);
    expect(updatedProject?.description).toBe(mockProject.description); // 未更新的字段保持不变
  });

  test("should delete project", async () => {
    // 添加项目
    const newProject = await addProjectConfig(mockProject);

    // 删除项目
    const deleted = await deleteProjectConfig(newProject.id);
    expect(deleted).toBe(true);

    // 验证项目已被删除
    const foundProject = await getProjectConfig(newProject.id);
    expect(foundProject).toBeNull();
  });

  test("should return false when deleting non-existent project", async () => {
    const deleted = await deleteProjectConfig("non-existent-id");
    expect(deleted).toBe(false);
  });

  test("should return null when getting non-existent project", async () => {
    const project = await getProjectConfig("non-existent-id");
    expect(project).toBeNull();
  });

  test("should return null when updating non-existent project", async () => {
    const updated = await updateProjectConfig("non-existent-id", {
      name: "New Name",
    });
    expect(updated).toBeNull();
  });
});

// 导出测试运行器（用于手动测试）
export async function runBasicTests() {
  console.log("🧪 开始运行基础测试...");

  try {
    // 测试 1: 添加项目
    console.log("📝 测试添加项目...");
    const newProject = await addProjectConfig({
      name: "Test Project",
      description: "测试项目",
      path: "D:\\test\\project",
      port: 3001,
    });
    console.log("✅ 项目添加成功:", newProject.id);

    // 测试 2: 读取项目
    console.log("📖 测试读取项目...");
    const projects = await readProjectsConfig();
    console.log("✅ 读取到项目数量:", projects.length);

    // 测试 3: 更新项目
    console.log("🔄 测试更新项目...");
    const updated = await updateProjectConfig(newProject.id, {
      name: "Updated Test Project",
    });
    console.log("✅ 项目更新成功:", updated?.name);

    // 测试 4: 删除项目
    console.log("🗑️ 测试删除项目...");
    const deleted = await deleteProjectConfig(newProject.id);
    console.log("✅ 项目删除成功:", deleted);

    console.log("🎉 所有基础测试通过！");
    return true;
  } catch (error) {
    console.error("❌ 测试失败:", error);
    return false;
  }
}
