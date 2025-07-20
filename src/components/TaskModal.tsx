"use client";

import { useState, useEffect, useRef } from "react";
import { Task } from "@/lib/data";
import { detectFileType, validateTaskData } from "@/lib/utils";
import type { Modal } from "bootstrap";

interface TaskModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  taskToEdit: Task | null;
}

export default function TaskModal({
  show,
  onClose,
  onSave,
  taskToEdit,
}: TaskModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalInstance, setModalInstance] = useState<Modal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [description, setDescription] = useState("");
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (show && taskToEdit) {
      setDescription(taskToEdit.description);
      setFilename(taskToEdit.filename);
      setContent(taskToEdit.content);
    } else if (!show) {
      setDescription("");
      setFilename("");
      setContent("");
    }
  }, [show, taskToEdit]);

  useEffect(() => {
    if (!modalRef.current) return;

    // 只在客户端动态导入 bootstrap
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
    // 使用新的验证函数
    const validation = validateTaskData({ description, content });
    if (!validation.isValid) {
      alert(validation.errors.join("\n"));
      return;
    }

    // 如果没有提供文件名，根据内容推测一个
    let finalFilename = filename.trim();
    if (!finalFilename) {
      const detected = detectFileType(content);
      finalFilename = `untitled.${detected.extension}`;
    }

    setIsLoading(true);
    try {
      await onSave({
        id: taskToEdit?.id,
        description: description.trim(),
        filename: finalFilename,
        content: content.trim(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 唯一的改动在这里：移除了那个错误的 onHide={onClose} 属性
  return (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="taskModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="taskModalLabel">
              {taskToEdit ? "编辑任务" : "添加新的任务"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="taskFilename" className="form-label">
                文件名 (例如: script.py)
              </label>
              <input
                type="text"
                className="form-control"
                id="taskFilename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="script.py"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="taskDescription" className="form-label">
                描述 (这个任务是干嘛的？)
              </label>
              <input
                type="text"
                className="form-control"
                id="taskDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="taskContent" className="form-label">
                内容
              </label>
              <textarea
                className="form-control"
                id="taskContent"
                rows={15}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              关闭
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
