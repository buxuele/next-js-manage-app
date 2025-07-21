#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 确保所有修复都已正确应用
 */

const fs = require("fs");

console.log("🔍 部署前检查...\n");

// 检查图片上传API
const uploadApiContent = fs.readFileSync(
  "src/app/api/projects/[id]/upload-image/route.ts",
  "utf8"
);

const checks = [
  {
    name: "移除文件系统操作",
    test:
      !uploadApiContent.includes("writeFile") &&
      !uploadApiContent.includes("mkdir"),
    critical: true,
  },
  {
    name: "移除Vercel Blob依赖",
    test: !uploadApiContent.includes("@vercel/blob"),
    critical: true,
  },
  {
    name: "使用Base64编码",
    test:
      uploadApiContent.includes("base64String") &&
      uploadApiContent.includes('toString("base64")'),
    critical: true,
  },
  {
    name: "生成data URL",
    test: uploadApiContent.includes("data:${mimeType};base64,${base64String}"),
    critical: true,
  },
  {
    name: "更新数据库",
    test: uploadApiContent.includes("UPDATE projects SET image = $1"),
    critical: true,
  },
];

let allPassed = true;

checks.forEach((check) => {
  if (check.test) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name}`);
    if (check.critical) {
      allPassed = false;
    }
  }
});

console.log("\n📋 修复摘要:");
console.log("- 图片上传现在将图片转换为Base64格式");
console.log("- Base64数据直接存储在Neon数据库中");
console.log("- 移除了所有文件系统操作，适配Vercel serverless环境");
console.log("- 前端可以直接显示Base64格式的图片");

if (allPassed) {
  console.log("\n🚀 所有检查通过！可以安全部署到Vercel");
  console.log("\n部署后测试步骤:");
  console.log("1. 登录应用");
  console.log("2. 创建或编辑一个项目");
  console.log("3. 上传一张图片");
  console.log("4. 保存项目并检查图片是否正确显示");
} else {
  console.log("\n❌ 部分检查未通过，请修复后再部署");
  process.exit(1);
}
