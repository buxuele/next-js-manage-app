#!/usr/bin/env node

/**
 * 检查 Vercel 部署状态的脚本
 * 用于诊断部署后的问题
 */

const https = require("https");
const http = require("http");

const DEPLOYMENT_URL = "https://next-js-manage-app.vercel.app";

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https:") ? https : http;

    const req = protocol.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          "User-Agent": "Deployment-Checker/1.0",
          ...options.headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        });
      }
    );

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function checkEndpoint(name, url, expectedStatus = 200) {
  console.log(`🔍 检查 ${name}...`);

  try {
    const response = await makeRequest(url);

    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: 状态 ${response.status} - 正常`);
      return true;
    } else {
      console.log(`❌ ${name}: 状态 ${response.status} - 异常`);
      if (response.status >= 400) {
        console.log(`   错误内容: ${response.data.substring(0, 200)}...`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: 请求失败 - ${error.message}`);
    return false;
  }
}

async function checkDeployment() {
  console.log("🚀 开始检查 Vercel 部署状态...\n");

  const checks = [
    {
      name: "主页",
      url: DEPLOYMENT_URL,
      expectedStatus: 200,
    },
    {
      name: "NextAuth Session API",
      url: `${DEPLOYMENT_URL}/api/auth/session`,
      expectedStatus: 200,
    },
    {
      name: "NextAuth Providers API",
      url: `${DEPLOYMENT_URL}/api/auth/providers`,
      expectedStatus: 200,
    },
    {
      name: "NextAuth CSRF API",
      url: `${DEPLOYMENT_URL}/api/auth/csrf`,
      expectedStatus: 200,
    },
    {
      name: "登录页面",
      url: `${DEPLOYMENT_URL}/login`,
      expectedStatus: 200,
    },
    {
      name: "项目管理页面",
      url: `${DEPLOYMENT_URL}/projects`,
      expectedStatus: 200,
    },
    {
      name: "Gists API",
      url: `${DEPLOYMENT_URL}/api/gists`,
      expectedStatus: 200,
    },
  ];

  let passedChecks = 0;

  for (const check of checks) {
    const passed = await checkEndpoint(
      check.name,
      check.url,
      check.expectedStatus
    );
    if (passed) passedChecks++;
    console.log(""); // 空行分隔
  }

  console.log("📊 检查结果汇总:");
  console.log(`✅ 通过: ${passedChecks}/${checks.length}`);
  console.log(`❌ 失败: ${checks.length - passedChecks}/${checks.length}`);

  if (passedChecks === checks.length) {
    console.log("\n🎉 所有检查都通过了！部署状态良好。");
  } else {
    console.log("\n⚠️  部分检查失败，请检查以下问题:");
    console.log("1. 确保所有环境变量都已在 Vercel 控制台设置");
    console.log("2. 确保数据库表已正确创建");
    console.log("3. 确保 GitHub OAuth 应用配置正确");
    console.log("4. 检查 Vercel 函数日志获取详细错误信息");
  }

  return passedChecks === checks.length;
}

// 如果直接运行此脚本
if (require.main === module) {
  checkDeployment().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { checkDeployment };
