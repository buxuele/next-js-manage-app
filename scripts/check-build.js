// 检查构建状态
const { spawn } = require("child_process");

console.log("🔨 开始构建检查...\n");

const buildProcess = spawn("npm", ["run", "build"], {
  stdio: "pipe",
  shell: true,
});

let output = "";
let errorOutput = "";

buildProcess.stdout.on("data", (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);
});

buildProcess.stderr.on("data", (data) => {
  const text = data.toString();
  errorOutput += text;
  process.stderr.write(text);
});

buildProcess.on("close", (code) => {
  console.log(`\n📊 构建进程退出，代码: ${code}`);

  if (code === 0) {
    console.log("🎉 构建成功！所有ESLint错误已修复。");
    console.log("\n✅ 现在可以：");
    console.log("1. 运行 npm run dev 启动开发服务器");
    console.log("2. 访问 http://localhost:3000/login");
    console.log("3. 测试所有修复的功能");
  } else {
    console.log("❌ 构建失败，请检查上述错误信息");

    if (errorOutput.includes("ESLint")) {
      console.log("\n💡 提示: 仍有ESLint错误需要修复");
    }
  }
});

// 设置超时
setTimeout(() => {
  if (!buildProcess.killed) {
    console.log("\n⏰ 构建超时，终止进程...");
    buildProcess.kill();
  }
}, 60000); // 60秒超时
