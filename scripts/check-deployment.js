#!/usr/bin/env node

/**
 * 部署配置检查脚本
 * 检查 NextAuth 和 GitHub OAuth 配置是否正确
 */

console.log("🔍 检查部署配置...\n");

// 检查必需的环境变量
const requiredEnvVars = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "DATABASE_URL",
];

console.log("📋 检查环境变量:");
let missingVars = [];

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(
      `✅ ${varName}: ${
        varName === "NEXTAUTH_SECRET" ||
        varName === "GITHUB_CLIENT_SECRET" ||
        varName === "DATABASE_URL"
          ? "[已设置]"
          : value
      }`
    );
  } else {
    console.log(`❌ ${varName}: 未设置`);
    missingVars.push(varName);
  }
});

console.log("\n🔗 检查 URL 配置:");
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  console.log(`✅ NEXTAUTH_URL: ${nextAuthUrl}`);
  console.log(`✅ 预期的回调 URL: ${nextAuthUrl}/api/auth/callback/github`);
} else {
  console.log("❌ NEXTAUTH_URL 未设置");
}

console.log("\n📝 GitHub OAuth 应用配置检查清单:");
console.log("□ 访问 https://github.com/settings/developers");
console.log("□ 找到你的 OAuth App");
console.log("□ 确认 Client ID 匹配");
console.log("□ 在 Authorization callback URL 中添加:");
if (nextAuthUrl) {
  console.log(`   ${nextAuthUrl}/api/auth/callback/github`);
} else {
  console.log("   [需要先设置 NEXTAUTH_URL]");
}

if (missingVars.length > 0) {
  console.log("\n❌ 发现问题:");
  console.log(`缺少环境变量: ${missingVars.join(", ")}`);
  console.log("\n🛠️  解决方案:");
  console.log("1. 在 Vercel 项目设置中添加缺少的环境变量");
  console.log("2. 重新部署项目");
  process.exit(1);
} else {
  console.log("\n✅ 所有环境变量都已设置！");
  console.log("\n🚀 如果仍有问题，请检查 GitHub OAuth 应用配置");
}
