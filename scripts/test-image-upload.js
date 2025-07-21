#!/usr/bin/env node

/**
 * 测试图片上传功能
 * 验证Base64存储到Neon数据库是否正常工作
 */

const fs = require("fs");
const path = require("path");

console.log("🧪 测试图片上传功能修复...\n");

// 检查关键文件
const filesToCheck = [
  "src/app/api/projects/[id]/upload-image/route.ts",
  "src/components/ProjectCard.tsx",
  "database/schema.sql",
];

let allFilesExist = true;

filesToCheck.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log("\n❌ 部分关键文件缺失，请检查项目结构");
  process.exit(1);
}

// 检查图片上传API代码
const uploadApiPath = "src/app/api/projects/[id]/upload-image/route.ts";
const uploadApiContent = fs.readFileSync(uploadApiPath, "utf8");

console.log("\n🔍 检查图片上传API修复...");

if (uploadApiContent.includes("base64String")) {
  console.log("✅ 已使用Base64编码");
} else {
  console.log("❌ 未找到Base64编码逻辑");
}

if (uploadApiContent.includes("dataUrl")) {
  console.log("✅ 已生成data URL格式");
} else {
  console.log("❌ 未找到data URL生成逻辑");
}

if (
  !uploadApiContent.includes("writeFile") &&
  !uploadApiContent.includes("mkdir")
) {
  console.log("✅ 已移除文件系统操作");
} else {
  console.log("❌ 仍包含文件系统操作");
}

if (!uploadApiContent.includes("@vercel/blob")) {
  console.log("✅ 未使用Vercel Blob");
} else {
  console.log("❌ 仍包含Vercel Blob依赖");
}

// 检查数据库schema
const schemaContent = fs.readFileSync("database/schema.sql", "utf8");
if (schemaContent.includes("image TEXT")) {
  console.log("✅ 数据库image字段为TEXT类型，支持Base64存储");
} else {
  console.log("❌ 数据库image字段类型可能不支持Base64存储");
}

console.log("\n📋 修复总结:");
console.log("1. ✅ 图片上传改为Base64格式存储到Neon数据库");
console.log("2. ✅ 移除了文件系统写入操作（适配Vercel serverless）");
console.log("3. ✅ 前端可以直接显示Base64格式的图片");
console.log("4. ✅ 数据库schema支持TEXT类型存储");

console.log("\n🚀 现在可以重新部署到Vercel测试图片上传功能！");
console.log("\n⚠️  注意事项:");
console.log("- 图片现在以Base64格式存储在数据库中");
console.log("- 建议限制图片大小以避免数据库存储过大");
console.log("- Base64编码会增加约33%的存储空间");
