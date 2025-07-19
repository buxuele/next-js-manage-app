// 验证 Next.js 15 修复的脚本
const fs = require("fs");

console.log("🔍 验证 Next.js 15 类型修复...");

// 检查关键文件是否包含正确的类型定义
const checks = [
  {
    file: "src/app/api/gists/[gist_id]/route.ts",
    pattern: "params: Promise<{ gist_id: string }>",
    description: "API 路由参数类型",
  },
  {
    file: "src/app/gist/[gist_id]/page.tsx",
    pattern: "params: Promise<{ gist_id: string }>",
    description: "页面组件参数类型",
  },
  {
    file: "src/app/api/gists/[gist_id]/route.ts",
    pattern: "await params",
    description: "API 路由参数解构",
  },
  {
    file: "src/app/gist/[gist_id]/page.tsx",
    pattern: "await params",
    description: "页面组件参数解构",
  },
];

let allChecksPass = true;

checks.forEach((check) => {
  if (fs.existsSync(check.file)) {
    const content = fs.readFileSync(check.file, "utf-8");
    if (content.includes(check.pattern)) {
      console.log(`✅ ${check.description} - 已修复`);
    } else {
      console.log(`❌ ${check.description} - 未找到正确的类型定义`);
      allChecksPass = false;
    }
  } else {
    console.log(`❌ ${check.file} - 文件不存在`);
    allChecksPass = false;
  }
});

if (allChecksPass) {
  console.log("\n🎉 所有 Next.js 15 类型修复验证通过！");
  console.log("现在可以成功部署到 Vercel 了！");
} else {
  console.log("\n❌ 发现问题，请检查修复。");
  process.exit(1);
}
