// TypeScript 类型检查脚本
const { execSync } = require("child_process");

console.log("🔍 检查 TypeScript 类型...");

try {
  // 运行 TypeScript 编译器进行类型检查
  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("✅ TypeScript 类型检查通过！");
} catch (error) {
  console.log("❌ TypeScript 类型检查失败");
  process.exit(1);
}
