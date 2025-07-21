// 验证所有修复是否正确应用
const fs = require("fs");
const path = require("path");

console.log("🔍 验证修复状态...\n");

const checks = [
  {
    name: "三个点菜单修复",
    file: "src/components/ProjectCard.tsx",
    check: (content) => {
      return (
        content.includes("useRef") &&
        content.includes("bootstrap.Dropdown") &&
        content.includes('data-bs-toggle="dropdown"')
      );
    },
  },
  {
    name: "图片上传功能",
    file: "src/components/ProjectModal.tsx",
    check: (content) => {
      return (
        content.includes("imageFile") &&
        content.includes("handleImageChange") &&
        content.includes('type="file"')
      );
    },
  },
  {
    name: "图片上传API",
    file: "src/app/api/projects/[id]/upload-image/route.ts",
    check: (content) => {
      return (
        content.includes('formData.get("image")') &&
        content.includes("writeFile")
      );
    },
  },
  {
    name: "导航栏优化",
    file: "src/components/ProjectManager.tsx",
    check: (content) => {
      return (
        content.includes('fontSize: "2rem"') &&
        content.includes('fontWeight: "bold"') &&
        !content.includes("bi-grid-3x3-gap")
      );
    },
  },
  {
    name: "登录界面修复",
    file: "src/app/login/page.tsx",
    check: (content) => {
      return (
        content.includes('backgroundColor: "#fdfaf6"') &&
        content.includes("bg-white") &&
        content.includes("NEXT_PUBLIC_DEV_MODE")
      );
    },
  },
  {
    name: "开发模式支持",
    file: "src/lib/auth-config.ts",
    check: (content) => {
      return (
        content.includes("dev-login") &&
        content.includes("getOrCreateDevUser") &&
        content.includes("isDevelopment")
      );
    },
  },
  {
    name: "导入功能修复",
    file: "src/app/api/projects/import/route.ts",
    check: (content) => {
      return (
        content.includes("parseDateTime") &&
        content.includes("projects: allProjects")
      );
    },
  },
  {
    name: "打开目录API",
    file: "src/app/api/open-folder/[id]/route.ts",
    check: (content) => {
      return (
        content.includes("execAsync") &&
        content.includes("explorer") &&
        content.includes("xdg-open")
      );
    },
  },
];

let passedChecks = 0;
let totalChecks = checks.length;

checks.forEach((check) => {
  try {
    if (fs.existsSync(check.file)) {
      const content = fs.readFileSync(check.file, "utf8");
      if (check.check(content)) {
        console.log(`✅ ${check.name}`);
        passedChecks++;
      } else {
        console.log(`❌ ${check.name} - 检查失败`);
      }
    } else {
      console.log(`❌ ${check.name} - 文件不存在: ${check.file}`);
    }
  } catch (error) {
    console.log(`❌ ${check.name} - 检查出错: ${error.message}`);
  }
});

console.log(`\n📊 验证结果: ${passedChecks}/${totalChecks} 项检查通过`);

if (passedChecks === totalChecks) {
  console.log("🎉 所有修复都已正确应用！");
  console.log("\n📋 下一步操作:");
  console.log("1. 访问 http://localhost:3000/login");
  console.log("2. 使用开发模式登录");
  console.log("3. 测试所有功能");
  console.log("4. 访问 http://localhost:3000/test 进行API测试");
} else {
  console.log("⚠️  部分修复可能未正确应用，请检查上述失败项目");
}

// 检查环境配置
console.log("\n🔧 环境配置检查:");
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  console.log(`✅ .env.local 存在`);
  console.log(
    `${envContent.includes("DEV_MODE=true") ? "✅" : "❌"} 开发模式已启用`
  );
  console.log(
    `${
      envContent.includes("NEXT_PUBLIC_DEV_MODE=true") ? "✅" : "❌"
    } 前端开发模式标志已设置`
  );
} else {
  console.log("❌ .env.local 文件不存在");
}

// 检查uploads目录
if (fs.existsSync("public/uploads")) {
  console.log("✅ uploads 目录存在");
} else {
  console.log("❌ uploads 目录不存在");
}

console.log("\n🚀 准备就绪！现在可以开始测试所有功能。");
