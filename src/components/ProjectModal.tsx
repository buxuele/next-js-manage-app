"use client";

import { useState, useEffect, useRef } from "react";
import { Project } from "@/types/project";
import type { Modal } from "bootstrap";
import Image from "next/image";

interface ProjectModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => Promise<void>;
  projectToEdit: Project | null;
}

export default function ProjectModal({
  show,
  onClose,
  onSave,
  projectToEdit,
}: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalInstance, setModalInstance] = useState<Modal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [path, setPath] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (show && projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setUrl(projectToEdit.url);
      setPath(projectToEdit.path);
      setImagePreview(projectToEdit.image || null);
    } else if (!show) {
      setName("");
      setDescription("");
      setUrl("");
      setPath("");
      setImageFile(null);
      setImagePreview(null);
    }
  }, [show, projectToEdit]);

  useEffect(() => {
    if (!modalRef.current) return;

    import("bootstrap").then((bootstrap) => {
      const modal = bootstrap.Modal.getOrCreateInstance(modalRef.current!);
      setModalInstance(modal);
    });
  }, []);

  useEffect(() => {
    if (modalInstance) {
      if (show) {
        modalInstance.show();
      } else {
        modalInstance.hide();
      }
    }
  }, [show, modalInstance]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith("image/")) {
        alert("请选择图片文件");
        return;
      }

      // 检查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("图片文件不能超过5MB");
        return;
      }

      setImageFile(file);

      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !url.trim()) {
      alert("项目名称和URL是必填项");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        id: projectToEdit?.id,
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
        path: path.trim(),
        imageFile: imageFile, // 传递图片文件
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="projectModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div
          className="modal-content"
          style={{ backgroundColor: "#fdfaf6", color: "#495057" }}
        >
          <div className="modal-header">
            <h5 className="modal-title" id="projectModalLabel">
              {projectToEdit ? "编辑项目" : "添加新项目"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="projectName" className="form-label">
                项目名称 <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="projectName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入项目名称"
                required
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入项目描述（可选）"
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="projectUrl" className="form-label">
                项目URL <span className="text-danger">*</span>
              </label>
              <input
                type="url"
                className="form-control"
                id="projectUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:3000"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="projectPath" className="form-label">
                项目路径
              </label>
              <input
                type="text"
                className="form-control"
                id="projectPath"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="D:\projects\my-project"
              />
              <div className="form-text text-muted">
                项目在本地的文件夹路径，用于&quot;打开目录&quot;功能
              </div>
            </div>

            {/* 图片上传 */}
            <div className="mb-3">
              <label htmlFor="projectImage" className="form-label">
                项目图片
              </label>
              <input
                type="file"
                className="form-control"
                id="projectImage"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="form-text text-muted">
                支持 JPG、PNG、GIF 格式，文件大小不超过
                5MB。如果不上传图片，将自动生成字母图标。
              </div>

              {/* 图片预览 */}
              {imagePreview && (
                <div className="mt-3">
                  <div className="d-flex align-items-center gap-3">
                    <Image
                      src={imagePreview}
                      alt="预览"
                      width={80}
                      height={80}
                      style={{
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "2px solid #dee2e6",
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleRemoveImage}
                    >
                      <i className="bi bi-trash me-1"></i>
                      移除图片
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
