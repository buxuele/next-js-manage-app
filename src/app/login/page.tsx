"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 检查是否为开发模式
const isDevelopment =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_MODE === "true";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已经登录
    getSession().then((session) => {
      if (session) {
        router.push("/projects");
      }
    });
  }, [router]);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/projects" });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("dev-login", { callbackUrl: "/projects" });
    } catch (error) {
      console.error("Dev login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#fdfaf6" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card bg-white border-0 shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 text-dark mb-3">
                    <i className="bi bi-grid-3x3-gap me-2"></i>
                    我的项目
                  </h1>
                  <p className="text-secondary">
                    {isDevelopment ? "开发模式登录" : "使用 GitHub 账号登录"}
                  </p>
                </div>

                <div className="d-grid gap-2">
                  {isDevelopment ? (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleDevLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          登录中...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-code-slash me-2"></i>
                          开发模式登录
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-dark btn-lg"
                      onClick={handleGitHubLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          登录中...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-github me-2"></i>
                          使用 GitHub 登录
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isDevelopment && (
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      当前为开发模式，无需GitHub认证
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
