"use client";

import { useState, useEffect, useRef } from "react";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 根据项目名称生成颜色
  const getProjectColor = (name: string) => {
    const colors = [
      "#007bff", // 蓝色
      "#28a745", // 绿色
      "#dc3545", // 红色
      "#ffc107", // 黄色
      "#6f42c1", // 紫色
      "#fd7e14", // 橙色
      "#20c997", // 青色
      "#e83e8c", // 粉色
    ];

    // 根据项目名称的字符码生成一个稳定的颜色索引
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // 点击外部关闭dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDropdown]);

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

  const handleCopy = async (
    text: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const btn = event.currentTarget;
    try {
      await navigator.clipboard.writeText(text);
      const originalContent = btn.innerHTML;
      btn.innerHTML = "已复制";
      btn.classList.add("btn-success");
      btn.classList.remove("btn-outline-secondary");
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.classList.remove("btn-success");
        btn.classList.add("btn-outline-secondary");
      }, 2000);
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
      const response = await fetch(`/api/open-folder/${project.id}`);
      const result = await response.json();
      if (!result.success) {
        alert(`打开目录失败: ${result.message}`);
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
      style={{
        backgroundColor: "#e9ecef",
        border: "2px solid #495057",
        borderRadius: "1rem",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        transform: "scale(1.05)",
        marginBottom: "1rem",
      }}
    >
      <div
        className="card-body d-flex flex-column"
        style={{ backgroundColor: "#e9ecef" }}
      >
        {/* 卡片操作下拉菜单 - 右上角 */}
        <div
          ref={dropdownRef}
          className="position-absolute"
          style={{ top: "1rem", right: "1rem" }}
        >
          <button
            className="btn btn-sm btn-outline-secondary"
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-expanded={showDropdown}
          >
            <i className="bi bi-three-dots"></i>
          </button>

          {showDropdown && (
            <div
              className="position-absolute end-0 mt-1 bg-white border rounded shadow-lg"
              style={{
                minWidth: "150px",
                zIndex: 1000,
                top: "100%",
              }}
            >
              <div className="py-1">
                <button
                  className="dropdown-item px-3 py-2 border-0 bg-transparent w-100 text-start d-flex align-items-center"
                  type="button"
                  onClick={() => {
                    onEdit(project);
                    setShowDropdown(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-pencil me-2"></i>编辑
                </button>
                <button
                  className="dropdown-item px-3 py-2 border-0 bg-transparent w-100 text-start d-flex align-items-center text-danger"
                  type="button"
                  onClick={() => {
                    handleDelete();
                    setShowDropdown(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-trash me-2"></i>删除
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 项目标题 */}
        <h5
          className="card-title text-dark mb-3 fw-600"
          style={{ color: "#495057" }}
        >
          {project.name}
        </h5>

        {/* 项目图片或图标 */}
        <div className="d-flex align-items-center mb-3">
          <div className="project-icon me-3" style={{ flexShrink: 0 }}>
            {project.image ? (
              <Image
                src={project.image}
                alt={project.name}
                width={100}
                height={100}
                className="rounded"
                style={{
                  objectFit: "cover",
                  border: "2px solid #dee2e6",
                  borderRadius: "12px",
                }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: getProjectColor(project.name),
                  fontSize: "3rem",
                  borderRadius: "12px",
                  flexShrink: 0,
                }}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            {project.description && (
              <p
                className="card-text text-dark mb-2"
                style={{ color: "#495057" }}
              >
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* 项目信息 */}
        <div className="mt-auto">
          {/* 项目路径 */}
          {project.path && (
            <div
              className="d-flex align-items-center mb-2"
              style={{ fontSize: "0.85rem", fontWeight: 500, color: "#495057" }}
            >
              <span
                title={project.path}
                style={{ wordBreak: "break-all", marginRight: "0.5rem" }}
              >
                <i className="bi bi-folder me-1"></i>
                {truncatePath(project.path)}
              </span>
              <button
                className="btn btn-sm btn-outline-secondary ms-auto"
                onClick={(e) => handleCopy(project.path, e)}
                title="复制路径"
              >
                <i className="bi bi-clipboard"></i>
              </button>
            </div>
          )}

          {/* 项目URL */}
          <div
            className="d-flex align-items-center mb-3"
            style={{ fontSize: "0.85rem", fontWeight: 500, color: "#495057" }}
          >
            {getStatusIndicator()}
            <span
              title={project.url}
              style={{
                wordBreak: "break-all",
                marginRight: "0.5rem",
                marginLeft: "8px",
              }}
            >
              <i className="bi bi-globe me-1"></i>
              {project.url}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary ms-auto"
              onClick={(e) => handleCopy(project.url, e)}
              title="复制URL"
            >
              <i className="bi bi-clipboard"></i>
            </button>
          </div>

          {/* 操作按钮 */}
          <div className="d-flex gap-2">
            {project.path && (
              <button
                className="btn btn-sm btn-outline-secondary flex-fill"
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
