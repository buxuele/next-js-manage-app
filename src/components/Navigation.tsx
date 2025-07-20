"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useRef } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/tasks/export");
      const result = await response.json();

      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `tasks-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
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

      const response = await fetch("/api/tasks/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(importData),
      });

      const result = await response.json();

      if (result.success) {
        const { imported, total, errors } = result.data;
        let message = `导入完成！成功导入 ${imported}/${total} 个任务`;
        if (errors.length > 0) {
          message += `\n\n错误信息:\n${errors.join("\n")}`;
        }
        alert(message);
        window.location.reload(); // 刷新页面以显示新导入的任务
      } else {
        alert("导入失败: " + result.error);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("导入失败，请检查文件格式是否正确");
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/tasks">
          <i className="bi bi-list-task me-2"></i>
          我的任务中心
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link
                className={`nav-link ${pathname === "/tasks" ? "active" : ""}`}
                href="/tasks"
              >
                <i className="bi bi-list-task me-1"></i>
                任务管理
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav">
            {session?.user && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <Image
                    src={session.user.image || "/default-avatar.png"}
                    alt="用户头像"
                    className="rounded-circle me-2"
                    width={32}
                    height={32}
                    style={{ objectFit: "cover" }}
                  />
                  {session.user.name || session.user.email}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button className="dropdown-item" onClick={handleExport}>
                      <i className="bi bi-download me-2"></i>
                      导出数据
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleImport}>
                      <i className="bi bi-upload me-2"></i>
                      导入数据
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleSignOut}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      退出登录
                    </button>
                  </li>
                </ul>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
