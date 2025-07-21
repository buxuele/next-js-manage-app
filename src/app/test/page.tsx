"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function TestPage() {
  const { data: session } = useSession();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults((prev) => [...prev, result]);
  };

  const testAPI = async (
    endpoint: string,
    method: string = "GET",
    body?: any
  ) => {
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, options);
      const data = await response.json();

      addResult(
        `✅ ${method} ${endpoint}: ${response.status} - ${JSON.stringify(
          data
        ).substring(0, 100)}...`
      );
    } catch (error) {
      addResult(`❌ ${method} ${endpoint}: Error - ${error}`);
    }
  };

  const runTests = async () => {
    setTestResults([]);
    addResult("🚀 开始测试API端点...");

    // 测试项目API
    await testAPI("/api/projects");

    // 测试导出API
    await testAPI("/api/projects/export");

    // 测试认证状态
    addResult(`🔐 认证状态: ${session ? "已登录" : "未登录"}`);
    if (session) {
      addResult(`👤 用户信息: ${session.user?.name || session.user?.email}`);
    }
  };

  return (
    <div className="container py-4">
      <h1>功能测试页面</h1>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>API测试</h5>
            </div>
            <div className="card-body">
              <button className="btn btn-primary mb-3" onClick={runTests}>
                运行API测试
              </button>

              <div
                className="test-results"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="mb-1"
                    style={{ fontSize: "0.9em", fontFamily: "monospace" }}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>功能检查清单</h5>
            </div>
            <div className="card-body">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="login"
                />
                <label className="form-check-label" htmlFor="login">
                  开发模式登录
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="dropdown"
                />
                <label className="form-check-label" htmlFor="dropdown">
                  项目卡片三个点菜单
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="upload"
                />
                <label className="form-check-label" htmlFor="upload">
                  图片上传功能
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="import"
                />
                <label className="form-check-label" htmlFor="import">
                  数据导入功能
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="navbar"
                />
                <label className="form-check-label" htmlFor="navbar">
                  导航栏布局优化
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="colors"
                />
                <label className="form-check-label" htmlFor="colors">
                  界面颜色修复
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="alert alert-info">
          <h6>测试说明：</h6>
          <ul className="mb-0">
            <li>点击&quot;运行API测试&quot;检查后端API是否正常</li>
            <li>手动测试各项功能并勾选完成的项目</li>
            <li>如果发现问题，请查看浏览器控制台的错误信息</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
