"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Task } from "@/lib/data";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import Link from "next/link";
import Image from "next/image";
import "highlight.js/styles/atom-one-dark.min.css";

interface TaskListProps {
  initialTasks: Task[];
}

export default function TaskList({ initialTasks }: TaskListProps) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState(initialTasks);
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleOpenModal = (task: Task | null) => {
    setTaskToEdit(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTaskToEdit(null);
  };

  const handleSaveTask = async (taskData: Partial<Task>): Promise<void> => {
    const isEditing = !!taskData.id;
    const url = isEditing ? `/api/tasks/${taskData.id}` : "/api/tasks";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "未知错误" }));
        throw new Error(
          errorData.error || `${isEditing ? "更新" : "创建"}失败`
        );
      }

      const savedTask = await response.json();

      if (isEditing) {
        setTasks((currentTasks) =>
          currentTasks.map((t) => (t.id === savedTask.id ? savedTask : t))
        );
      } else {
        setTasks((currentTasks) => [savedTask, ...currentTasks]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("保存失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : "保存失败，请重试";
      alert(errorMessage);
    }
  };

  const handleDeleteTask = (idToDelete: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== idToDelete)
    );
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary sticky-top mb-4">
        <div className="container-fluid px-4">
          <Link className="navbar-brand" href="/">
            <i className="bi bi-grid-1x2-fill"></i> 我的任务库
          </Link>

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-success"
              onClick={() => handleOpenModal(null)}
            >
              <i className="bi bi-plus-circle"></i> 添加
            </button>

            {session && (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
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
                  <span>
                    {(session.user as any)?.username || session.user?.name}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text">
                      <small className="text-muted">登录为</small>
                      <br />
                      <strong>
                        {(session.user as any)?.username || session.user?.name}
                      </strong>
                    </span>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      登出
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {tasks.length === 0 ? (
        <p className="text-center text-muted mt-5">
          空空如也，快添加你的第一个任务吧！
        </p>
      ) : (
        <div id="tasks-container">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
              onEdit={handleOpenModal}
            />
          ))}
        </div>
      )}

      <TaskModal
        show={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </>
  );
}
