/**
 * API 端点测试工具
 * 用于测试项目管理相关的 API 端点
 */

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  status?: number;
  error?: string;
  data?: any;
}

class ApiTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(
    endpoint: string,
    method: string = "GET",
    body?: any
  ): Promise<TestResult> {
    const url = `${this.baseUrl}${endpoint}`;
    const result: TestResult = {
      endpoint,
      method,
      success: false,
    };

    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body && method !== "GET") {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      result.status = response.status;

      if (response.ok) {
        result.data = await response.json();
        result.success = true;
      } else {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : "Unknown error";
    }

    this.results.push(result);
    return result;
  }

  async testGetProjects() {
    console.log("📋 测试获取项目列表...");
    const result = await this.makeRequest("/api/projects", "GET");

    if (result.success) {
      console.log(
        "✅ 获取项目列表成功:",
        result.data?.data?.length || 0,
        "个项目"
      );
    } else {
      console.log("❌ 获取项目列表失败:", result.error);
    }

    return result;
  }

  async testAddProject() {
    console.log("➕ 测试添加项目...");
    const testProject = {
      name: "API Test Project",
      description: "通过 API 测试添加的项目",
      path: "D:\\test\\api-project",
      port: 3005,
    };

    const result = await this.makeRequest("/api/projects", "POST", testProject);

    if (result.success) {
      console.log("✅ 添加项目成功:", result.data?.data?.id);
      return result.data?.data;
    } else {
      console.log("❌ 添加项目失败:", result.error);
      return null;
    }
  }

  async testGetProjectStatus(projectId: string) {
    console.log("📊 测试获取项目状态...");
    const result = await this.makeRequest(
      `/api/projects/${projectId}/status`,
      "GET"
    );

    if (result.success) {
      console.log(
        "✅ 获取项目状态成功:",
        result.data?.data?.isRunning ? "运行中" : "已停止"
      );
    } else {
      console.log("❌ 获取项目状态失败:", result.error);
    }

    return result;
  }

  async testDeleteProject(projectId: string) {
    console.log("🗑️ 测试删除项目...");
    const result = await this.makeRequest(
      `/api/projects/${projectId}`,
      "DELETE"
    );

    if (result.success) {
      console.log("✅ 删除项目成功");
    } else {
      console.log("❌ 删除项目失败:", result.error);
    }

    return result;
  }

  async runFullTest() {
    console.log("🧪 开始运行完整的 API 测试...");
    this.results = [];

    try {
      // 1. 测试获取项目列表
      await this.testGetProjects();

      // 2. 测试添加项目
      const newProject = await this.testAddProject();

      if (newProject) {
        // 3. 测试获取项目状态
        await this.testGetProjectStatus(newProject.id);

        // 4. 测试删除项目
        await this.testDeleteProject(newProject.id);
      }

      // 5. 输出测试结果摘要
      this.printSummary();

      return this.results;
    } catch (error) {
      console.error("❌ API 测试过程中发生错误:", error);
      return this.results;
    }
  }

  private printSummary() {
    console.log("\n📊 测试结果摘要:");
    console.log("=".repeat(50));

    const successful = this.results.filter((r) => r.success).length;
    const total = this.results.length;

    console.log(`总测试数: ${total}`);
    console.log(`成功: ${successful}`);
    console.log(`失败: ${total - successful}`);
    console.log(`成功率: ${((successful / total) * 100).toFixed(1)}%`);

    console.log("\n详细结果:");
    this.results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      console.log(
        `${index + 1}. ${status} ${result.method} ${result.endpoint}`
      );
      if (!result.success && result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });
  }
}

// 导出测试函数
export async function runApiTests(baseUrl?: string) {
  const tester = new ApiTester(baseUrl);
  return await tester.runFullTest();
}

// 导出测试类
export { ApiTester };
