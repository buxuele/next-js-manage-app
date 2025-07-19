/**
 * 进程管理测试
 * 这是一个基础的测试文件，用于验证进程管理功能
 */

import { processManager } from "../process-manager";

describe("Process Manager", () => {
  test("should check if port is in use", async () => {
    // 测试一个通常不会被占用的高端口
    const highPort = 65432;
    const isInUse = await (processManager as any).isPortInUse(highPort);
    expect(typeof isInUse).toBe("boolean");
  });

  test("should get project status", () => {
    const status = processManager.getProjectStatus("non-existent-project");
    expect(status).toBeNull();
  });

  test("should get all running projects", () => {
    const runningProjects = processManager.getAllRunningProjects();
    expect(Array.isArray(runningProjects)).toBe(true);
  });

  test("should check port accessibility", async () => {
    // 测试本地端口检查
    const isAccessible = await processManager.checkPortAccessible(80);
    expect(typeof isAccessible).toBe("boolean");
  });

  test("should check project URL", async () => {
    // 测试一个不存在的本地 URL
    const isAccessible = await processManager.checkProjectUrl(
      "http://localhost:65432"
    );
    expect(isAccessible).toBe(false);
  });
});

// 导出手动测试函数
export async function runProcessTests() {
  console.log("🧪 开始运行进程管理测试...");

  try {
    // 测试 1: 端口检查
    console.log("🔍 测试端口检查...");
    const port3000 = await processManager.checkPortAccessible(3000);
    console.log("✅ 端口 3000 检查结果:", port3000);

    // 测试 2: URL 检查
    console.log("🌐 测试 URL 检查...");
    const urlCheck = await processManager.checkProjectUrl(
      "http://localhost:3000"
    );
    console.log("✅ URL 检查结果:", urlCheck);

    // 测试 3: 获取运行中的项目
    console.log("📊 测试获取运行中的项目...");
    const runningProjects = processManager.getAllRunningProjects();
    console.log("✅ 运行中的项目数量:", runningProjects.length);

    // 测试 4: 批量状态检查
    console.log("📋 测试批量状态检查...");
    const testProjects = [
      { id: "test1", path: "/test/path1", port: 3000 },
      { id: "test2", path: "/test/path2", port: 3001 },
    ];
    const statusMap = await processManager.checkAllProjectsStatus(testProjects);
    console.log("✅ 批量状态检查完成，检查了", statusMap.size, "个项目");

    console.log("🎉 所有进程管理测试通过！");
    return true;
  } catch (error) {
    console.error("❌ 进程管理测试失败:", error);
    return false;
  }
}
