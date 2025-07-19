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

  const isRunning = status?.isRunning || false;
  const projectUrl = `http://localhost:${project.port || 3000}`;

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        {/* 项目头部信息 */}
        <div className="d-flex align-items-start mb-3">
          {project.icon && (
            <Image
              src={project.icon}
              alt={`${project.name} icon`}
              width={48}
              height={48}
              className="me-3"
              style={{ objectFit: "cover" }}
            />
          )}
          <div className="flex-grow-1">
            <h5 className="card-title mb-1">{project.name}</h5>
            <p className="card-text text-muted small mb-2">
              {project.description}
            </p>
          </div>
          {/* 运行状态指示器 */}
          <div className="ms-2">
            <span
              className={`badge ${isRunning ? "bg-success" : "bg-secondary"}`}
            >
              {isRunning ? "运行中" : "已停止"}
            </span>
          </div>
        </div>

        {/* 项目详细信息 */}
        <div className="mb-3">
          <small className="text-muted d-block">
            <strong>路径:</strong> {project.path}
          </small>
          <small className="text-muted d-block">
            <strong>端口:</strong> {project.port || 3000}
          </small>
          {status?.startTime && (
            <small className="text-muted d-block">
              <strong>启动时间:</strong>{" "}
              {new Date(status.startTime).toLocaleString()}
            </small>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="mt-auto">
          <div className="row g-2">
            {/* 启动/停止按钮 */}
            <div className="col-6">
              {isRunning ? (
                <button
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={handleStop}
                  disabled={loading.stop}
                >
                  {loading.stop ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      停止中...
                    </>
                  ) : (
                    "停止"
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-outline-success btn-sm w-100"
                  onClick={handleStart}
                  disabled={loading.start}
                >
                  {loading.start ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      启动中...
                    </>
                  ) : (
                    "启动"
                  )}
                </button>
              )}
            </div>

            {/* 访问网址按钮 */}
            <div className="col-6">
              <button
                className="btn btn-outline-primary btn-sm w-100"
                onClick={() => onOpenUrl(projectUrl)}
                disabled={!isRunning}
                title={isRunning ? "在浏览器中打开" : "项目未运行"}
              >
                访问网址
              </button>
            </div>

            {/* 打开目录按钮 */}
            <div className="col-6">
              <button
                className="btn btn-outline-info btn-sm w-100"
                onClick={handleOpenDirectory}
                disabled={loading.openDir}
              >
                {loading.openDir ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    打开中...
                  </>
                ) : (
                  "打开目录"
                )}
              </button>
            </div>

            {/* 删除按钮 */}
            <div className="col-6">
              <button
                className="btn btn-outline-danger btn-sm w-100"
                onClick={handleDelete}
                disabled={loading.delete || isRunning}
                title={isRunning ? "请先停止项目" : "删除项目"}
              >
                {loading.delete ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    删除中...
                  </>
                ) : (
                  "删除"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
