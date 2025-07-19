"use client";

import { useState, useEffect } from "react";
import { ProjectConfig, ApiResponse } from "@/types";
import ProjectCard from "./ProjectCard";
import LoadingSpinner from "./LoadingSpinner";
import AddProjectModal from "./AddProjectModal";
import ToastContainer from "./Toast";
import { useToast } from "@/hooks/useToast";

export default function ProjectManager() {
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/projects");
      const data: ApiResponse<ProjectConfig[]> = await response.json();

      if (data.success && data.data) {
        setProjects(data.data);
      } else {
        setError(data.error || "Failed to fetch projects");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取项目列表
  useEffect(() => {
    fetchProjects();
  }, []);

  // 启动项目
  const handleStartProject = async (projectId: string) => {
    try {
      showInfo("启动中", "正在启动项目...");
      const response = await fetch(`/api/projects/${projectId}/start`, {
        method: "POST",
      });
      const data: ApiResponse = await response.json();

      if (!data.success) {
        showError("启动失败", data.error || "未知错误");
      } else {
        showSuccess("启动成功", "项目已成功启动");
        // 刷新项目列表
        await fetchProjects();
      }
    } catch (error) {
      console.error("Error starting project:", error);
      showError("启动失败", "启动项目时发生网络错误");
    }
  };

  // 停止项目
  const handleStopProject = async (projectId: string) => {
    try {
      showInfo("停止中", "正在停止项目...");
      const response = await fetch(`/api/projects/${projectId}/stop`, {
        method: "POST",
      });
      const data: ApiResponse = await response.json();

      if (!data.success) {
        showError("停止失败", data.error || "未知错误");
      } else {
        showSuccess("停止成功", "项目已成功停止");
        // 刷新项目列表
        await fetchProjects();
      }
    } catch (error) {
      console.error("Error stopping project:", error);
      showError("停止失败", "停止项目时发生网络错误");
    }
  };

  // 打开项目目录
  const handleOpenDirectory = async (projectId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/open-directory`,
        {
          method: "POST",
        }
      );
      const data: ApiResponse = await response.json();

      if (!data.success) {
        showError("打开目录失败", data.error || "未知错误");
      } else {
        showSuccess("目录已打开", "项目目录已在文件管理器中打开");
      }
    } catch (error) {
      console.error("Error opening directory:", error);
      showError("打开目录失败", "打开目录时发生网络错误");
    }
  };

  // 在浏览器中打开 URL
  const handleOpenUrl = (url: string) => {
    window.open(url, "_blank");
  };

  // 删除项目
  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const data: ApiResponse = await response.json();

      if (data.success) {
        // 从本地状态中移除项目
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        showSuccess("删除成功", "项目已成功删除");
      } else {
        showError("删除失败", data.error || "未知错误");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      showError("删除失败", "删除项目时发生网络错误");
    }
  };

  // 处理项目添加成功
  const handleProjectAdded = (newProject: ProjectConfig) => {
    setProjects((prev) => [...prev, newProject]);
  };

  // 导出项目配置
  const handleExportProjects = () => {
    try {
      const exportData = {
        version: "1.0",
        exportTime: new Date().toISOString(),
        projects: projects.map((project) => ({
          name: project.name,
          description: project.description,
          path: project.path,
          port: project.port,
          icon: project.icon,
        })),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `projects-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess("导出成功", `已导出 ${projects.length} 个项目配置`);
    } catch (error) {
      console.error("Error exporting projects:", error);
      showError("导出失败", "导出项目配置时发生错误");
    }
  };

  // 导入项目配置
  const handleImportProjects = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // 验证导入数据格式
        if (!importData.projects || !Array.isArray(importData.projects)) {
          showError("导入失败", "无效的文件格式");
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        // 逐个导入项目
        for (const projectData of importData.projects) {
          try {
            if (!projectData.name || !projectData.path) {
              errorCount++;
              continue;
            }

            const response = await fetch("/api/projects", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: projectData.name,
                description: projectData.description || "",
                path: projectData.path,
                port: projectData.port || 3000,
              }),
            });

            const data: ApiResponse = await response.json();
            if (data.success) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }

        // 刷新项目列表
        await fetchProjects();

        // 显示导入结果
        if (successCount > 0) {
          showSuccess(
            "导入完成",
            `成功导入 ${successCount} 个项目${
              errorCount > 0 ? `，失败 ${errorCount} 个` : ""
            }`
          );
        } else {
          showError("导入失败", "没有成功导入任何项目");
        }
      } catch (error) {
        console.error("Error importing projects:", error);
        showError("导入失败", "解析文件时发生错误");
      }
    };

    reader.readAsText(file);
    // 清空文件输入，允许重复选择同一文件
    event.target.value = "";
  };

  // 加载状态
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">加载失败</h4>
        <p>{error}</p>
        <hr />
        <button className="btn btn-outline-danger" onClick={fetchProjects}>
          重试
        </button>
      </div>
    );
  }

  // 空状态
  if (projects.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <svg
            width="64"
            height="64"
            fill="currentColor"
            className="text-muted"
            viewBox="0 0 16 16"
          >
            <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 14.5 0h-13zM1 1.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-13z" />
            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
          </svg>
        </div>
        <h4 className="text-muted">暂无项目</h4>
        <p className="text-muted">
          还没有添加任何开发项目。点击上方的&ldquo;添加项目&rdquo;按钮开始管理您的端口！
        </p>
      </div>
    );
  }

  // 项目列表
  return (
    <>
      {/* 头部工具栏 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">端口管理</h2>
          <p className="text-muted mb-0">管理您的开发端口和项目</p>
        </div>
        <div className="btn-group" role="group">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <svg
              width="16"
              height="16"
              fill="currentColor"
              className="me-2"
              viewBox="0 0 16 16"
            >
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            添加项目
          </button>
          <div className="btn-group" role="group">
            <button
              type="button"
              className="btn btn-outline-primary dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                className="me-1"
                viewBox="0 0 16 16"
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
              </svg>
              更多
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={handleExportProjects}
                  disabled={projects.length === 0}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                  </svg>
                  导出配置
                </button>
              </li>
              <li>
                <label className="dropdown-item" style={{ cursor: "pointer" }}>
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                  </svg>
                  导入配置
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportProjects}
                    style={{ display: "none" }}
                  />
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 项目网格 */}
      <div className="row g-4">
        {projects.map((project) => (
          <div key={project.id} className="col-12 col-md-6 col-lg-4">
            <ProjectCard
              project={project}
              onStart={handleStartProject}
              onStop={handleStopProject}
              onOpenDirectory={handleOpenDirectory}
              onOpenUrl={handleOpenUrl}
              onDelete={handleDeleteProject}
            />
          </div>
        ))}
      </div>

      {/* 添加项目模态框 */}
      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProjectAdded={handleProjectAdded}
      />

      {/* Toast 通知容器 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
