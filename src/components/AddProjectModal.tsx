"use client";

import { useState } from "react";
import { ProjectFormData, ApiResponse, ProjectConfig } from "@/types";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: (project: ProjectConfig) => void;
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onProjectAdded,
}: AddProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    path: "",
    port: 3000,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      path: "",
      port: 3000,
    });
    setError(null);
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<ProjectConfig> = await response.json();

      if (data.success && data.data) {
        onProjectAdded(data.data);
        resetForm();
        onClose();
      } else {
        setError(data.error || "Failed to add project");
      }
    } catch (err) {
      console.error("Error adding project:", err);
      setError("Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  // 处理关闭
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // 选择目录
  const handleSelectDirectory = () => {
    // 创建一个隐藏的文件输入元素来选择目录
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.style.display = "none";

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        // 获取第一个文件的路径，然后提取目录路径
        const firstFile = files[0];
        const fullPath =
          (firstFile as any).webkitRelativePath || firstFile.name;
        const directoryPath = fullPath.split("/")[0];

        // 在实际应用中，这里需要获取完整的系统路径
        // 由于浏览器安全限制，我们只能获取相对路径
        setFormData((prev) => ({
          ...prev,
          path: directoryPath,
          name: prev.name || directoryPath,
        }));
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">添加新项目</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="projectName" className="form-label">
                  项目名称 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="projectName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  disabled={loading}
                  placeholder="输入项目名称"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="projectDescription" className="form-label">
                  项目描述
                </label>
                <textarea
                  className="form-control"
                  id="projectDescription"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={loading}
                  placeholder="输入项目描述（可选）"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="projectPath" className="form-label">
                  项目路径 <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="projectPath"
                    value={formData.path}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, path: e.target.value }))
                    }
                    required
                    disabled={loading}
                    placeholder="输入项目完整路径，如: D:\projects\my-nextjs-app"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleSelectDirectory}
                    disabled={loading}
                    title="选择目录（注意：由于浏览器限制，可能需要手动输入完整路径）"
                  >
                    选择
                  </button>
                </div>
                <div className="form-text">
                  请输入 Next.js 项目的完整系统路径
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="projectPort" className="form-label">
                  开发服务器端口
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="projectPort"
                  value={formData.port || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      port: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  min={1000}
                  max={65535}
                  disabled={loading}
                  placeholder="3000"
                />
                <div className="form-text">
                  默认端口为 3000，如果冲突会自动寻找可用端口
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  loading || !formData.name.trim() || !formData.path.trim()
                }
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    添加中...
                  </>
                ) : (
                  "添加项目"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
