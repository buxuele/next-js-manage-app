// 检查TypeScript类型
const { spawn } = require("child_process");

console.log("🔍 检查TypeScript类型...\n");

const tscProcess = spawn("npx", ["tsc", "--noEmit"], {
  stdio: "pipe",
  shell: true,
});

let output = "";
let errorOutput = "";

tscProcess.stdout.on("data", (data) => {
  const text = data.toString();
  output += text;
  console.log(text);
});

tscProcess.stderr.on("data", (data) => {
  const text = data.toString();
  errorOutput += text;
  console.error(text);
});

tscProcess.on("close", (code) => {
  console.log(`\n📊 类型检查完成，退出代码: ${code}`);

  if (code === 0) {
    console.log("✅ 所有类型检查通过！");
  } else {
    console.log("❌ 发现类型错误，请检查上述输出");
  }
});

// 设置超时
setTimeout(() => {
  if (!tscProcess.killed) {
    console.log("\n⏰ 类型检查超时，终止进程...");
    tscProcess.kill();
  }
}, 30000); // 30秒超时
