/**
 * 测试运行脚本
 * 用于运行项目管理功能的基础测试
 */

const { spawn } = require("child_process");
const path = require("path");

console.log("🧪 Next.js 项目管理器 - 基础测试");
console.log("=".repeat(50));

async function runTests() {
  try {
    // 检查 Next.js 应用是否在运行
    console.log("🔍 检查应用状态...");

    const isAppRunning = await checkAppRunning();
    if (!isAppRunning) {
      console.log("⚠️  应用未运行，某些测试可能会失败");
      console.log("💡 请先运行 'npm run dev' 启动应用");
    } else {
      console.log("✅ 应用正在运行");
    }

    // 运行配置管理测试
    console.log("\n📝 运行配置管理测试...");
    await runConfigTests();

    // 运行进程管理测试
    console.log("\n⚙️  运行进程管理测试...");
    await runProcessTests();

    if (isAppRunning) {
      // 运行 API 测试
      console.log("\n🌐 运行 API 测试...");
      await runApiTests();
    }

    console.log("\n🎉 所有测试完成！");
  } catch (error) {
    console.error("❌ 测试运行失败:", error);
    process.exit(1);
  }
}

async function checkAppRunning() {
  try {
    const response = await fetch("http://localhost:3000/api/projects");
    return response.ok;
  } catch {
    return false;
  }
}

async function runConfigTests() {
  try {
    // 动态导入测试模块
    const { runBasicTests } = await import(
      "../src/lib/__tests__/project-config.test.js"
    );
    await runBasicTests();
  } catch (error) {
    console.error("配置管理测试失败:", error.message);
  }
}

async function runProcessTests() {
  try {
    const { runProcessTests } = await import(
      "../src/lib/__tests__/process-manager.test.js"
    );
    await runProcessTests();
  } catch (error) {
    console.error("进程管理测试失败:", error.message);
  }
}

async function runApiTests() {
  try {
    const { runApiTests } = await import("../src/lib/__tests__/api-test.js");
    await runApiTests();
  } catch (error) {
    console.error("API 测试失败:", error.message);
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
