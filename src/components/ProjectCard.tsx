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

  // 根据项目ID生成颜色
  const getProjectColor = (id: string) => {
    const colors = [
      "#8B5CF6", // 紫色
      "#06B6D4", // 青色
      "#10B981", // 绿色
      "#F59E0B", // 黄色
      "#EF4444", // 红色
      "#3B82F6", // 蓝色
      "#F97316", // 橙色
      "#84CC16", // 青绿色
    ];
    const index = parseInt(id) % colors.length;
    return colors[index];
  };

  const isRunning = status?.isRunning || false;
  const projectUrl = `http://localhost:${project.port || 3000}`;
  const projectColor = getProjectColor(project.id);

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.3s ease",
        height: "280px",
        overflow: "hidden",
      }}
      className="project-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
      }}
    >
      {/* 项目图标和名称 */}
      <div className="p-4 text-center">
        <div className="mb-3">
          {project.icon ? (
            <Image
              src={project.icon}
              alt={`${project.name} icon`}
              width={60}
              height={60}
              className="rounded-circle"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "60px",
                height: "60px",
                background: projectColor,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                margin: "0 auto",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            >
              {getProjectInitial(project.name)}
            </div>
          )}
        </div>

        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "16px" }}>
          {project.name}
        </h6>

        <p
          className="text-muted small mb-3"
          style={{ fontSize: "12px", height: "36px", overflow: "hidden" }}
        >
          {project.description || "暂无描述"}
        </p>
      </div>

      {/* 底部按钮区域 */}
      <div className="mt-auto">
        <div className="row g-0">
          {/* 启动按钮 */}
          <div className="col-6">
            {isRunning ? (
              <button
                className="btn w-100 rounded-0"
                onClick={handleStop}
                disabled={loading.stop}
                style={{
                  background: "#DC3545",
                  color: "white",
                  fontSize: "12px",
                  padding: "12px 8px",
                  fontWeight: "500",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {loading.stop ? "停止中..." : "停止"}
              </button>
            ) : (
              <button
                className="btn w-100 rounded-0"
                onClick={handleStart}
                disabled={loading.start}
                style={{
                  background: "#28A745",
                  color: "white",
                  fontSize: "12px",
                  padding: "12px 8px",
                  fontWeight: "500",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {loading.start ? "启动中..." : "启动"}
              </button>
            )}
          </div>

          {/* 访问网址按钮 */}
          <div className="col-6">
            <button
              className="btn w-100 rounded-0"
              onClick={() => onOpenUrl(projectUrl)}
              disabled={!isRunning}
              style={{
                background: isRunning ? "#007BFF" : "#6C757D",
                color: "white",
                fontSize: "12px",
                padding: "12px 8px",
                fontWeight: "500",
                border: "none",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                borderLeft: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              访问网址
            </button>
          </div>
        </div>

        <div className="row g-0">
          {/* 打开目录按钮 */}
          <div className="col-6">
            <button
              className="btn w-100 rounded-0"
              onClick={handleOpenDirectory}
              disabled={loading.openDir}
              style={{
                background: "#17A2B8",
                color: "white",
                fontSize: "12px",
                padding: "12px 8px",
                fontWeight: "500",
                border: "none",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                borderBottomLeftRadius: "16px",
              }}
            >
              {loading.openDir ? "打开中..." : "打开目录"}
            </button>
          </div>

          {/* 删除按钮 */}
          <div className="col-6">
            <button
              className="btn w-100 rounded-0"
              onClick={handleDelete}
              disabled={loading.delete || isRunning}
              style={{
                background: isRunning ? "#6C757D" : "#FFC107",
                color: isRunning ? "white" : "#212529",
                fontSize: "12px",
                padding: "12px 8px",
                fontWeight: "500",
                border: "none",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                borderLeft: "1px solid rgba(255,255,255,0.1)",
                borderBottomRightRadius: "16px",
              }}
            >
              {loading.delete ? "删除中..." : "删除"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
