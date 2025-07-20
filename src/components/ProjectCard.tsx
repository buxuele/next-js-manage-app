"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import Image from "next/image";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onEdit: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onDelete,
  onEdit,
}: ProjectCardProps) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  // 检测项目在线状态
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await fetch(project.url, {
          method: "HEAD",
          mode: "no-cors",
        });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    if (project.url) {
      checkStatus();
    }
  }, [project.url]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以在这里添加成功提示的逻辑
    } catch (err) {
      console.error("复制失败:", err);
      alert("复制失败，请重试");
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`确定要删除项目 "${project.name}" 吗？`)) {
      try {
        const response = await fetch(`/api/projects/${project.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "删除失败" }));
          throw new Error(errorData.error || "删除失败");
        }
        onDelete(project.id);
      } catch (error) {
        console.error("删除请求失败:", error);
        const errorMessage =
          error instanceof Error ? error.message : "删除失败，请重试";
        alert(errorMessage);
      }
    }
  };

  const handleOpenFolder = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/open-folder`, {
        method: "POST",
      });
      const result = await response.json();
      if (!result.success) {
        alert(`打开目录失败: ${result.error}`);
      }
    } catch (error) {
      console.error("打开目录失败:", error);
      alert("打开目录失败，请重试");
    }
  };

  const getStatusIndicator = () => {
    if (isOnline === null) {
      return <span className="status-indicator status-checking"></span>;
    }
    return (
      <span
        className={`status-indicator ${
          isOnline ? "status-online" : "status-offline"
        }`}
      ></span>
    );
  };

  const truncatePath = (path: string, maxLength = 30) => {
    if (!path || path.length <= maxLength) return path;
    const separator = path.includes("/") ? "/" : "\\";
    const parts = path.split(separator);
    if (parts.length <= 2) return path;
    const head = parts[0];
    const tail = parts[parts.length - 1];
    return `${head}${separator}...${separator}${tail}`;
  };

  return (
    <div
      className="card project-card h-100"
      style={{ backgroundColor: "#2c2c2c", border: "1px solid #444" }}
    >
      <div className="card-body d-flex flex-column">
        {/* 项目标题和状态 */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            {getStatusIndicator()}
            <h5 className="card-title text-white mb-0 ms-2">{project.name}</h5>
          </div>
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-three-dots"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => onEdit(project)}
                >
                  <i className="bi bi-pencil me-2"></i>编辑
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleDelete}
                >
                  <i className="bi bi-trash me-2"></i>删除
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* 项目图片或图标 */}
        <div className="d-flex align-items-center mb-3">
          <div className="project-icon me-3">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.name}
                width={80}
                height={80}
                className="rounded"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center rounded text-white fw-bold"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#007bff",
                  fontSize: "2rem",
                }}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <p className="text-muted small mb-1">{project.description}</p>
          </div>
        </div>

        {/* 项目信息 */}
        <div className="mt-auto">
          {/* 项目路径 */}
          {project.path && (
            <div className="d-flex align-items-center justify-content-between mb-2">
              <small className="text-muted" title={project.path}>
                <i className="bi bi-folder me-1"></i>
                {truncatePath(project.path)}
              </small>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleCopy(project.path)}
                title="复制路径"
              >
                <i className="bi bi-clipboard"></i>
              </button>
            </div>
          )}

          {/* 项目URL */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <small className="text-muted" title={project.url}>
              <i className="bi bi-globe me-1"></i>
              {project.url}
            </small>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleCopy(project.url)}
              title="复制URL"
            >
              <i className="bi bi-clipboard"></i>
            </button>
          </div>

          {/* 操作按钮 */}
          <div className="d-flex gap-2">
            {project.path && (
              <button
                className="btn btn-sm btn-outline-light flex-fill"
                onClick={handleOpenFolder}
                title="打开目录"
              >
                <i className="bi bi-folder-open me-1"></i>
                打开目录
              </button>
            )}
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-dark flex-fill"
              title="访问网址"
            >
              <i className="bi bi-box-arrow-up-right me-1"></i>
              访问网址
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
