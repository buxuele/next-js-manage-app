"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card bg-secondary border-0 shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 text-white mb-3">
                    <i className="bi bi-hdd-network me-2"></i>
                    我的端口中心
                  </h1>
                  <p className="text-muted">
                    使用 GitHub 账号登录来管理你的开发端口
                  </p>
                </div>

                <div className="d-grid">
                  <button
                    className="btn btn-light btn-lg"
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
                </div>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    登录即表示你同意我们的服务条款
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
