// 复制Flask项目中的图片到Next.js项目
const fs = require("fs");
const path = require("path");

console.log("📸 复制Flask项目图片到Next.js项目...\n");

// Flask项目路径
const flaskUploadsPath =
  "C:\\Users\\Administrator\\Work\\flask_port_app\\static\\uploads";
// Next.js项目路径
const nextUploadsPath = path.join(process.cwd(), "public", "uploads");

// 需要复制的图片文件
const imagesToCopy = [
  "4_9a0bb795_shark.jpg",
  "5_3fb644cb_SAAM-1967.59.931_1.jpg",
  "6_8c9204cc_Kopiec_9.jpg",
];

// 确保目标目录存在
if (!fs.existsSync(nextUploadsPath)) {
  fs.mkdirSync(nextUploadsPath, { recursive: true });
  console.log("✅ 创建uploads目录");
}

// 复制图片文件
imagesToCopy.forEach((filename) => {
  const sourcePath = path.join(flaskUploadsPath, filename);
  const targetPath = path.join(nextUploadsPath, filename);

  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ 复制成功: ${filename}`);
    } else {
      console.log(`❌ 源文件不存在: ${filename}`);
    }
  } catch (error) {
    console.log(`❌ 复制失败: ${filename} - ${error.message}`);
  }
});

console.log("\n📋 图片复制完成！");
console.log("现在图片应该可以正常显示了。");
