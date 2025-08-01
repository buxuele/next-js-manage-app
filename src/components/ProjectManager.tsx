"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Project } from "@/types/project";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import Link from "next/link";
import Image from "next/image";

interface ProjectManagerProps {
  initialProjects: Project[];
}

export default function ProjectManager({
  initialProjects,
}: ProjectManagerProps) {
  const { data: session } = useSession();
  const [projects, setProjects] = useState(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // 检查是否点击在用户菜单外部
      if (showUserMenu && !target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showUserMenu]);

  const handleOpenModal = (project: Project | null) => {
    setProjectToEdit(project);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProjectToEdit(null);
  };

  const handleSaveProject = async (
    projectData: Partial<Project> & { imageFile?: File }
  ): Promise<void> => {
    const isEditing = !!projectData.id;
    const url = isEditing ? `/api/projects/${projectData.id}` : "/api/projects";
    const method = isEditing ? "PUT" : "POST";

    try {
      // 先保存项目基本信息（不包含图片文件）
      const { imageFile, ...basicProjectData } = projectData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basicProjectData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "未知错误" }));
        throw new Error(
          errorData.error || `${isEditing ? "更新" : "创建"}失败`
        );
      }

      let savedProject = await response.json();

      // 如果有图片文件，上传图片
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append("image", imageFile);

          const imageResponse = await fetch(
            `/api/projects/${savedProject.id}/upload-image`,
            {
              method: "POST",
              body: formData,
            }
          );

          const imageResult = await imageResponse.json();
          if (imageResult.success) {
            // 更新项目的图片URL
            savedProject = { ...savedProject, image: imageResult.image_url };
          } else {
            console.warn("图片上传失败:", imageResult.error);
            alert("项目保存成功，但图片上传失败: " + imageResult.error);
          }
        } catch (imageError) {
          console.warn("图片上传失败:", imageError);
          alert("项目保存成功，但图片上传失败");
        }
      }

      if (isEditing) {
        setProjects((currentProjects) =>
          currentProjects.map((p) =>
            p.id === savedProject.id ? savedProject : p
          )
        );
      } else {
        setProjects((currentProjects) => [savedProject, ...currentProjects]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("保存失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : "保存失败，请重试";
      alert(errorMessage);
    }
  };

  const handleDeleteProject = (idToDelete: string) => {
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== idToDelete)
    );
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/projects/export");
      const result = await response.json();

      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        // 生成与Flask版本一致的文件名格式：projects_export_20250720_031028.json
        const now = new Date();
        const timestamp = now
          .toISOString()
          .replace(/[-:]/g, "")
          .replace("T", "_")
          .split(".")[0];
        link.download = `projects_export_${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("导出失败: " + result.error);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("导出失败，请稍后重试");
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // 处理不同的导入数据格式
      let projects = [];
      if (importData.projects && Array.isArray(importData.projects)) {
        // Flask导出格式：{ projects: [...], total_projects: 5, export_time: "..." }
        projects = importData.projects;
      } else if (Array.isArray(importData)) {
        // 直接的项目数组格式
        projects = importData;
      } else {
        throw new Error("无效的数据格式");
      }

      if (projects.length === 0) {
        alert("导入文件中没有找到项目数据");
        return;
      }

      // 询问用户是否替换现有数据
      const replaceExisting = confirm(
        `即将导入 ${projects.length} 个项目。\n\n点击"确定"替换所有现有项目\n点击"取消"仅添加新项目（跳过重复项目）`
      );

      const response = await fetch("/api/projects/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projects: projects,
          replace_existing: replaceExisting,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const {
          imported,
          total,
          errors,
          projects: importedProjects,
        } = result.data;
        let message = `导入完成！成功导入 ${imported}/${total} 个项目`;
        if (errors.length > 0) {
          message += `\n\n错误信息:\n${errors.join("\n")}`;
        }
        alert(message);

        // 立即更新项目列表，而不是刷新页面
        if (importedProjects && importedProjects.length > 0) {
          if (replaceExisting) {
            // 如果是替换模式，直接设置新的项目列表
            setProjects(importedProjects);
          } else {
            // 如果是添加模式，重新获取所有项目
            try {
              const refreshResponse = await fetch("/api/projects");
              if (refreshResponse.ok) {
                const refreshedProjects = await refreshResponse.json();
                setProjects(refreshedProjects);
              } else {
                // 如果获取失败，至少添加新导入的项目
                setProjects((currentProjects) => [
                  ...importedProjects,
                  ...currentProjects,
                ]);
              }
            } catch (refreshError) {
              console.error("刷新项目列表失败:", refreshError);
              // 如果获取失败，至少添加新导入的项目
              setProjects((currentProjects) => [
                ...importedProjects,
                ...currentProjects,
              ]);
            }
          }
        } else {
          // 如果没有返回项目数据，则刷新页面作为备选方案
          window.location.reload();
        }
      } else {
        alert("导入失败: " + result.error);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("导入失败，请检查文件格式是否正确");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="container-fluid main-container py-4"
      style={{ backgroundColor: "#fdfaf6", minHeight: "100vh" }}
    >
      {/* 顶部导航栏 - 单行布局 */}
      <nav
        className="navbar navbar-expand-lg navbar-light mb-4"
        style={{ backgroundColor: "#fdfaf6" }}
      >
        <div className="container-fluid">
          <Link
            className="navbar-brand text-dark"
            href="/"
            style={{ fontSize: "2rem", fontWeight: "bold" }}
          >
            Start
          </Link>

          <div className="d-flex align-items-center gap-3">
            {/* 添加按钮 */}
            <button
              className="btn btn-primary rounded-circle shadow-sm"
              style={{ width: "40px", height: "40px" }}
              onClick={() => handleOpenModal(null)}
              title="添加项目"
            >
              <i className="bi bi-plus-lg"></i>
            </button>

            {/* 用户菜单 - 使用React状态控制 */}
            {session && (
              <div className="position-relative user-menu-container">
                <button
                  type="button"
                  className="btn btn-outline-dark d-flex align-items-center gap-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="Avatar"
                      className="rounded-circle"
                      width={24}
                      height={24}
                    />
                  )}
                  <span className="text-dark">
                    {(session.user as any)?.username ||
                      session.user?.name ||
                      "用户"}
                  </span>
                  <i
                    className={`bi bi-chevron-${showUserMenu ? "up" : "down"}`}
                  ></i>
                </button>

                {showUserMenu && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg"
                    style={{ minWidth: "200px", zIndex: 1000 }}
                  >
                    <div className="py-1">
                      <button
                        className="dropdown-item px-3 py-2 border-0 bg-transparent w-100 text-start"
                        type="button"
                        onClick={() => {
                          handleExport();
                          setShowUserMenu(false);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bi bi-download me-2"></i>
                        导出数据
                      </button>
                      <button
                        className="dropdown-item px-3 py-2 border-0 bg-transparent w-100 text-start"
                        type="button"
                        onClick={() => {
                          handleImport();
                          setShowUserMenu(false);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bi bi-upload me-2"></i>
                        导入数据
                      </button>
                      <hr className="my-1" />
                      <button
                        className="dropdown-item px-3 py-2 border-0 bg-transparent w-100 text-start"
                        type="button"
                        onClick={() => {
                          signOut({ callbackUrl: "/login" });
                          setShowUserMenu(false);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </nav>

      {/* 项目网格 */}
      {projects.length === 0 ? (
        <div className="text-center text-muted mt-5">
          <p>还没有项目，快添加你的第一个项目吧！</p>
        </div>
      ) : (
        <div className="row g-5 row-cols-1 row-cols-md-2 row-cols-xl-4">
          {projects.map((project) => (
            <div key={project.id} className="col d-flex">
              <ProjectCard
                project={project}
                onDelete={handleDeleteProject}
                onEdit={handleOpenModal}
              />
            </div>
          ))}
        </div>
      )}

      {/* 底部探索发现区域 */}
      <div className="mt-5 pt-5">
        <h2 className="h4 text-dark mb-3">探索发现</h2>
        <div className="text-muted">
          <p>更多功能正在开发中...</p>
        </div>
      </div>

      <ProjectModal
        show={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
      />
    </div>
  );
}
