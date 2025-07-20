"use client";

import { useState, useEffect, useRef } from "react";
import { Project } from "@/types/project";
import type { Modal } from "bootstrap";

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

  useEffect(() => {
    if (show && projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setUrl(projectToEdit.url);
      setPath(projectToEdit.path);
    } else if (!show) {
      setName("");
      setDescription("");
      setUrl("");
      setPath("");
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
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h5 className="modal-title" id="projectModalLabel">
              {projectToEdit ? "编辑项目" : "添加新项目"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
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
                className="form-control bg-secondary text-white border-secondary"
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
                className="form-control bg-secondary text-white border-secondary"
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
                className="form-control bg-secondary text-white border-secondary"
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
                className="form-control bg-secondary text-white border-secondary"
                id="projectPath"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="D:\projects\my-project"
              />
              <div className="form-text text-muted">
                项目在本地的文件夹路径，用于&quot;打开目录&quot;功能
              </div>
            </div>
          </div>
          <div className="modal-footer border-secondary">
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
