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
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [project.id, fetchStatus]);

  // 处理启动项目
  const handleStart = async () => {
    setLoading((prev) => ({ ...prev, start: true }));
    try {
      await onStart(project.id);
      await fetchStatus();
    } finally {
      setLoading((prev) => ({ ...prev, start: false }));
    }
  };

  // 处理停止项目
  const handleStop = async () => {
    setLoading((prev) => ({ ...prev, stop: true }));
    try {
      await onStop(project.id);
      await fetchStatus();
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

  // 根据项目ID生成颜色
  const getProjectColor = (id: string) => {
    const colors = [
      "#28a745", // 绿色
      "#17a2b8", // 青色
      "#fd7e14", // 橙色
      "#6f42c1", // 紫色
      "#dc3545", // 红色
    ];
    const index = parseInt(id) % colors.length;
    return colors[index];
  };

  const isRunning = status?.isRunning || false;
  const projectUrl = `http://localhost:${project.port || 3000}`;
  const projectColor = getProjectColor(project.id);

  return (
    <div
      className="card h-100"
      style={{
        border: "1px solid #e9ecef",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      }}
    >
      <div className="card-body d-flex flex-column">
        {/* 状态指示器 */}
        <div className="d-flex align-items-center mb-2">
          <span
            className="badge me-2"
            style={{
              backgroundColor: isRunning ? "#28a745" : "#6c757d",
              fontSize: "10px",
            }}
          >
            {isRunning ? "运行中" : "已停止"}
          </span>
          <small className="text-muted">
            {project.path && (
              <>
                <i className="bi bi-folder me-1"></i>
                {project.path.length > 30
                  ? `...${project.path.slice(-30)}`
                  : project.path}
              </>
            )}
          </small>
        </div>

        {/* 项目图标和信息 */}
        <div className="d-flex align-items-center mb-3">
          <div className="me-3">
            {project.icon ? (
              <Image
                src={project.icon}
                alt={`${project.name} icon`}
                width={40}
                height={40}
                className="rounded"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: projectColor,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {getProjectInitial(project.name)}
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <h6
              className="card-title mb-1"
              style={{ fontSize: "14px", fontWeight: "600" }}
            >
              {project.name}
            </h6>
            <p
              className="card-text text-muted mb-0"
              style={{ fontSize: "12px" }}
            >
              {project.description || "暂无描述"}
            </p>
            <small className="text-muted">
              <i className="bi bi-link-45deg me-1"></i>
              {projectUrl}
            </small>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-auto">
          <div className="row g-1">
            <div className="col-6">
              {isRunning ? (
                <button
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={handleStop}
                  disabled={loading.stop}
                  style={{ fontSize: "11px" }}
                >
                  {loading.stop ? "停止中..." : "停止"}
                </button>
              ) : (
                <button
                  className="btn btn-success btn-sm w-100"
                  onClick={handleStart}
                  disabled={loading.start}
                  style={{ fontSize: "11px" }}
                >
                  {loading.start ? "启动中..." : "启动"}
                </button>
              )}
            </div>
            <div className="col-6">
              <button
                className="btn btn-primary btn-sm w-100"
                onClick={() => onOpenUrl(projectUrl)}
                disabled={!isRunning}
                style={{ fontSize: "11px" }}
              >
                访问网址
              </button>
            </div>
          </div>
          <div className="row g-1 mt-1">
            <div className="col-6">
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={handleOpenDirectory}
                disabled={loading.openDir}
                style={{ fontSize: "11px" }}
              >
                {loading.openDir ? "打开中..." : "打开目录"}
              </button>
            </div>
            <div className="col-6">
              <button
                className="btn btn-outline-warning btn-sm w-100"
                onClick={handleDelete}
                disabled={loading.delete || isRunning}
                style={{ fontSize: "11px" }}
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
