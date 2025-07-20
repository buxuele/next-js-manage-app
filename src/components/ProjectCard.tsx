"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ProjectConfig, ProjectStatus } from "@/types";

interface ProjectCardProps {
  project: ProjectConfig;
  onStart: (projectId: string) => Promise<void>;
  onStop: (projectId: string) => Promise<void>;
  onOpenDirectory: (projectId: string) => Promise<void>;
  onOpenUrl: (url: string) => void;
  onDelete: (projectId: string) => Promise<void>;
}

export default function ProjectCard({
  project,
  onStart,
  onStop,
  onOpenDirectory,
  onOpenUrl,
  onDelete,
}: ProjectCardProps) {
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState<{
    start: boolean;
    stop: boolean;
    openDir: boolean;
    delete: boolean;
  }>({
    start: false,
    stop: false,
    openDir: false,
    delete: false,
  });

  // 获取项目状态
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/status`);
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error("Error fetching project status:", error);
    }
  }, [project.id]);

  // 组件挂载时获取状态
  useEffect(() => {
    fetchStatus();
    // 每30秒刷新一次状态
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [project.id, fetchStatus]);

  // 处理启动项目
  const handleStart = async () => {
    setLoading((prev) => ({ ...prev, start: true }));
    try {
      await onStart(project.id);
      await fetchStatus(); // 刷新状态
    } finally {
      setLoading((prev) => ({ ...prev, start: false }));
    }
  };

  // 处理停止项目
  const handleStop = async () => {
    setLoading((prev) => ({ ...prev, stop: true }));
    try {
      await onStop(project.id);
      await fetchStatus(); // 刷新状态
    } finally {
      setLoading((prev) => ({ ...prev, stop: false }));
    }
  };

  // 处理打开目录
  const handleOpenDirectory = async () => {
    setLoading((prev) => ({ ...prev, openDir: true }));
    try {
      await onOpenDirectory(project.id);
    } finally {
      setLoading((prev) => ({ ...prev, openDir: false }));
    }
  };

  // 处理删除项目
  const handleDelete = async () => {
    if (confirm(`确定要删除项目 "${project.name}" 吗？`)) {
      setLoading((prev) => ({ ...prev, delete: true }));
      try {
        await onDelete(project.id);
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    }
  };

  // 生成项目名称的首字母作为占位符
  const getProjectInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const isRunning = status?.isRunning || false;
  const projectUrl = `http://localhost:${project.port || 3000}`;

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #ffecd2 0%, #fcb69f 100%)",
        border: "2px solid #e67e22",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        height: "100%",
      }}
      className="project-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
      }}
    >
      <div className="p-3 d-flex flex-column h-100">
        {/* 项目图标和状态 */}
        <div className="d-flex align-items-center mb-3">
          <div className="me-3">
            {project.icon ? (
              <Image
                src={project.icon}
                alt={`${project.name} icon`}
                width={48}
                height={48}
                className="rounded"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "bold",
                  border: "2px solid #fff",
                }}
              >
                {getProjectInitial(project.name)}
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <h6 className="mb-1 fw-bold text-dark">{project.name}</h6>
              <span
                className={`badge ${isRunning ? "bg-success" : "bg-secondary"}`}
                style={{ fontSize: "10px" }}
              >
                {isRunning ? "运行中" : "已停止"}
              </span>
            </div>
          </div>
        </div>

        {/* 项目描述 */}
        <div className="mb-3">
          <p
            className="text-muted small mb-2"
            style={{ fontSize: "12px", lineHeight: "1.4" }}
          >
            {project.description || "暂无描述"}
          </p>
          <div className="small text-muted">
            <div style={{ fontSize: "11px" }}>
              <strong>路径:</strong>{" "}
              {project.path.length > 30
                ? `...${project.path.slice(-30)}`
                : project.path}
            </div>
            <div style={{ fontSize: "11px" }}>
              <strong>端口:</strong> {project.port || 3000}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-auto">
          <div className="row g-1 mb-2">
            {/* 启动/停止按钮 */}
            <div className="col-6">
              {isRunning ? (
                <button
                  className="btn btn-danger btn-sm w-100"
                  onClick={handleStop}
                  disabled={loading.stop}
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  {loading.stop ? "停止中..." : "停止"}
                </button>
              ) : (
                <button
                  className="btn btn-success btn-sm w-100"
                  onClick={handleStart}
                  disabled={loading.start}
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  {loading.start ? "启动中..." : "启动"}
                </button>
              )}
            </div>

            {/* 访问网址按钮 */}
            <div className="col-6">
              <button
                className="btn btn-primary btn-sm w-100"
                onClick={() => onOpenUrl(projectUrl)}
                disabled={!isRunning}
                title={isRunning ? "在浏览器中打开" : "项目未运行"}
                style={{ fontSize: "11px", padding: "4px 8px" }}
              >
                访问网址
              </button>
            </div>
          </div>

          <div className="row g-1">
            {/* 打开目录按钮 */}
            <div className="col-6">
              <button
                className="btn btn-info btn-sm w-100"
                onClick={handleOpenDirectory}
                disabled={loading.openDir}
                style={{ fontSize: "11px", padding: "4px 8px" }}
              >
                {loading.openDir ? "打开中..." : "打开目录"}
              </button>
            </div>

            {/* 删除按钮 */}
            <div className="col-6">
              <button
                className="btn btn-warning btn-sm w-100"
                onClick={handleDelete}
                disabled={loading.delete || isRunning}
                title={isRunning ? "请先停止项目" : "删除项目"}
                style={{ fontSize: "11px", padding: "4px 8px" }}
              >
                {loading.delete ? "删除中..." : "删除"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
