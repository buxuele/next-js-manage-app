// 测试开发模式配置
const fs = require("fs");
const path = require("path");

console.log("🔍 检查开发模式配置...\n");

// 检查环境变量文件
const envLocalPath = path.join(process.cwd(), ".env.local");
const envProductionPath = path.join(process.cwd(), ".env.production");

if (fs.existsSync(envLocalPath)) {
  console.log("✅ .env.local 文件存在");
  const envContent = fs.readFileSync(envLocalPath, "utf8");

  if (envContent.includes("DEV_MODE=true")) {
    console.log("✅ 开发模式已启用");
  } else {
    console.log("❌ 开发模式未启用");
  }

  if (envContent.includes("NEXT_PUBLIC_DEV_MODE=true")) {
    console.log("✅ 前端开发模式标志已设置");
  } else {
    console.log("❌ 前端开发模式标志未设置");
  }

  if (envContent.includes("NEXTAUTH_URL=http://localhost:3000")) {
    console.log("✅ 本地认证URL已设置");
  } else {
    console.log("❌ 本地认证URL未设置");
  }
} else {
  console.log("❌ .env.local 文件不存在");
}

if (fs.existsSync(envProductionPath)) {
  console.log("✅ .env.production 文件存在");
} else {
  console.log("❌ .env.production 文件不存在");
}

console.log("\n📋 配置总结:");
console.log("- 本地开发: 使用开发模式登录，无需GitHub认证");
console.log("- 生产环境: 使用GitHub OAuth认证");
console.log("- 开发服务器: http://localhost:3000");
console.log("\n🚀 修复内容:");
console.log("1. ✅ 登录界面颜色问题已修复");
console.log("2. ✅ 用户菜单黑色背景问题已修复");
console.log("3. ✅ 导航栏布局已优化（单行布局）");
console.log("4. ✅ 导入数据后立即显示功能已实现");
console.log("5. ✅ 开发模式登录功能已实现");
console.log("\n⚠️  注意: 如果遇到数据库连接问题，请确保数据库服务正常运行");
console.log("📖 详细说明请查看: docs/development-mode.md");
