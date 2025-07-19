"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/projects">
          <i className="bi bi-hdd-network me-2"></i>
          我的端口中心
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
                className={`nav-link ${
                  pathname === "/projects" ? "active" : ""
                }`}
                href="/projects"
              >
                <i className="bi bi-hdd-network me-1"></i>
                端口管理
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
                    <button className="dropdown-item" onClick={handleSignOut}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      退出登录
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
