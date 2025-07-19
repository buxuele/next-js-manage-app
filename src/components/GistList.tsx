"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Gist } from "@/lib/data";
import GistCard from "./GistCard";
import GistModal from "./GistModal";
import Link from "next/link";
import Image from "next/image";
import "highlight.js/styles/atom-one-dark.min.css";

interface GistListProps {
  initialGists: Gist[];
}

export default function GistList({ initialGists }: GistListProps) {
  const { data: session } = useSession();
  const [gists, setGists] = useState(initialGists);
  const [showModal, setShowModal] = useState(false);
  const [gistToEdit, setGistToEdit] = useState<Gist | null>(null);

  const handleOpenModal = (gist: Gist | null) => {
    setGistToEdit(gist);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setGistToEdit(null);
  };

  const handleSaveGist = async (gistData: Partial<Gist>): Promise<void> => {
    const isEditing = !!gistData.id;
    const url = isEditing ? `/api/gists/${gistData.id}` : "/api/gists";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gistData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "未知错误" }));
        throw new Error(
          errorData.error || `${isEditing ? "更新" : "创建"}失败`
        );
      }

      const savedGist = await response.json();

      if (isEditing) {
        setGists((currentGists) =>
          currentGists.map((g) => (g.id === savedGist.id ? savedGist : g))
        );
      } else {
        setGists((currentGists) => [savedGist, ...currentGists]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("保存失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : "保存失败，请重试";
      alert(errorMessage);
    }
  };

  const handleDeleteGist = (idToDelete: string) => {
    setGists((currentGists) =>
      currentGists.filter((gist) => gist.id !== idToDelete)
    );
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary sticky-top mb-4">
        <div className="container-fluid px-4">
          <Link className="navbar-brand" href="/">
            <i className="bi bi-grid-1x2-fill"></i> 我的知识库
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

      {gists.length === 0 ? (
        <p className="text-center text-muted mt-5">
          空空如也，快添加你的第一个知识片段吧！
        </p>
      ) : (
        <div id="gists-container">
          {gists.map((gist) => (
            <GistCard
              key={gist.id}
              gist={gist}
              onDelete={handleDeleteGist}
              onEdit={handleOpenModal}
            />
          ))}
        </div>
      )}

      <GistModal
        show={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveGist}
        gistToEdit={gistToEdit}
      />
    </>
  );
}
