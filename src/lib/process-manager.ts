import { spawn, ChildProcess } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { ProjectStatus } from "@/types";

/**
 * 进程管理器 - 管理 Next.js 开发服务器进程
 */
class ProcessManager {
  private processes: Map<string, ChildProcess> = new Map();
  private processInfo: Map<string, ProjectStatus> = new Map();

  /**
   * 检查端口是否被占用
   */
  private async isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const net = require("net");
      const server = net.createServer();

      server.listen(port, () => {
        server.once("close", () => resolve(false));
        server.close();
      });

      server.on("error", () => resolve(true));
    });
  }

  /**
   * 验证项目目录是否为有效的 Next.js 项目
   */
  private async validateNextjsProject(projectPath: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(projectPath, "package.json");
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf-8")
      );

      // 检查是否有 Next.js 依赖和 dev 脚本
      const hasNextjs =
        packageJson.dependencies?.next || packageJson.devDependencies?.next;
      const hasDevScript = packageJson.scripts?.dev;

      return !!(hasNextjs && hasDevScript);
    } catch {
      return false;
    }
  }

  /**
   * 启动 Next.js 开发服务器
   */
  async startProject(
    projectId: string,
    projectPath: string,
    port: number = 3000
  ): Promise<ProjectStatus> {
    try {
      // 检查项目是否已在运行
      if (this.processes.has(projectId)) {
        throw new Error("Project is already running");
      }

      // 验证项目路径
      const isValidProject = await this.validateNextjsProject(projectPath);
      if (!isValidProject) {
        throw new Error("Invalid Next.js project or missing package.json");
      }

      // 检查端口是否被占用
      const portInUse = await this.isPortInUse(port);
      if (portInUse) {
        throw new Error(`Port ${port} is already in use`);
      }

      // 启动进程
      const childProcess = spawn(
        "npm",
        ["run", "dev", "--", "--port", port.toString()],
        {
          cwd: projectPath,
          stdio: ["ignore", "pipe", "pipe"],
          shell: true,
          detached: false,
        }
      );

      // 存储进程信息
      this.processes.set(projectId, childProcess);

      const status: ProjectStatus = {
        id: projectId,
        isRunning: true,
        port,
        pid: childProcess.pid,
        startTime: new Date(),
      };

      this.processInfo.set(projectId, status);

      // 监听进程事件
      childProcess.on("error", (error) => {
        console.error(`Process error for project ${projectId}:`, error);
        this.cleanupProcess(projectId);
      });

      childProcess.on("exit", (code, signal) => {
        console.log(`Process exited for project ${projectId}:`, {
          code,
          signal,
        });
        this.cleanupProcess(projectId);
      });

      // 监听输出以确认启动成功
      let startupResolved = false;
      const startupPromise = new Promise<ProjectStatus>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!startupResolved) {
            startupResolved = true;
            reject(new Error("Startup timeout"));
          }
        }, 30000); // 30秒超时

        childProcess.stdout?.on("data", (data) => {
          const output = data.toString();
          console.log(`[${projectId}] stdout:`, output);

          // 检查是否启动成功
          if (
            output.includes("Ready") ||
            output.includes("started server") ||
            output.includes(`localhost:${port}`)
          ) {
            if (!startupResolved) {
              startupResolved = true;
              clearTimeout(timeout);
              resolve(status);
            }
          }
        });

        childProcess.stderr?.on("data", (data) => {
          const output = data.toString();
          console.error(`[${projectId}] stderr:`, output);

          // 如果有严重错误，拒绝启动
          if (output.includes("Error:") && !startupResolved) {
            startupResolved = true;
            clearTimeout(timeout);
            reject(new Error(`Startup failed: ${output}`));
          }
        });
      });

      return await startupPromise;
    } catch (error) {
      // 清理失败的进程
      this.cleanupProcess(projectId);
      throw error;
    }
  }

  /**
   * 停止项目进程
   */
  async stopProject(projectId: string): Promise<boolean> {
    const childProcess = this.processes.get(projectId);

    if (!childProcess) {
      return false;
    }

    try {
      // 尝试优雅关闭
      childProcess.kill("SIGTERM");

      // 等待进程结束
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          // 强制杀死进程
          childProcess.kill("SIGKILL");
          resolve();
        }, 5000);

        childProcess.on("exit", () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      this.cleanupProcess(projectId);
      return true;
    } catch (error) {
      console.error(`Error stopping project ${projectId}:`, error);
      this.cleanupProcess(projectId);
      return false;
    }
  }

  /**
   * 获取项目状态
   */
  getProjectStatus(projectId: string): ProjectStatus | null {
    return this.processInfo.get(projectId) || null;
  }

  /**
   * 获取所有运行中的项目状态
   */
  getAllRunningProjects(): ProjectStatus[] {
    return Array.from(this.processInfo.values());
  }

  /**
   * 检查项目 URL 是否可访问
   */
  async checkProjectUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000), // 5秒超时
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 检查端口是否可访问
   */
  async checkPortAccessible(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const net = require("net");
      const socket = new net.Socket();

      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 3000);

      socket.connect(port, "localhost", () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });

      socket.on("error", () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  /**
   * 获取项目的完整状态信息
   */
  async getProjectFullStatus(
    projectId: string,
    projectPath: string,
    port: number = 3000
  ): Promise<
    ProjectStatus & { urlAccessible?: boolean; portAccessible?: boolean }
  > {
    const basicStatus = this.getProjectStatus(projectId);

    // 如果没有基础状态信息，创建一个默认的
    const status = basicStatus || {
      id: projectId,
      isRunning: false,
      port,
    };

    // 检查端口是否可访问
    const portAccessible = await this.checkPortAccessible(port);

    // 检查项目 URL 是否可访问
    const url = `http://localhost:${port}`;
    const urlAccessible = portAccessible
      ? await this.checkProjectUrl(url)
      : false;

    // 更新运行状态（基于端口和URL检查）
    const actuallyRunning = portAccessible && urlAccessible;

    return {
      ...status,
      isRunning: actuallyRunning,
      portAccessible,
      urlAccessible,
    };
  }

  /**
   * 批量检查所有项目状态
   */
  async checkAllProjectsStatus(
    projects: Array<{ id: string; path: string; port?: number }>
  ): Promise<
    Map<
      string,
      ProjectStatus & { urlAccessible?: boolean; portAccessible?: boolean }
    >
  > {
    const statusMap = new Map();

    // 并行检查所有项目状态
    const statusPromises = projects.map(async (project) => {
      const status = await this.getProjectFullStatus(
        project.id,
        project.path,
        project.port || 3000
      );
      return [project.id, status] as const;
    });

    const results = await Promise.all(statusPromises);

    for (const [id, status] of results) {
      statusMap.set(id, status);
    }

    return statusMap;
  }

  /**
   * 清理进程信息
   */
  private cleanupProcess(projectId: string): void {
    this.processes.delete(projectId);

    const status = this.processInfo.get(projectId);
    if (status) {
      status.isRunning = false;
      status.pid = undefined;
    }
  }
}

// 单例实例
export const processManager = new ProcessManager();
