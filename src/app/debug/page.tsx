import { headers } from "next/headers";

export default async function DebugPage() {
  const headersList = await headers();

  // 获取环境变量（只显示非敏感信息）
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? "已设置" : "未设置",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET
      ? "已设置"
      : "未设置",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "已设置" : "未设置",
    DATABASE_URL: process.env.DATABASE_URL ? "已设置" : "未设置",
  };

  return (
    <div className="container mt-4">
      <h1>部署调试信息</h1>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>环境变量状态</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm">
                <tbody>
                  {Object.entries(envInfo).map(([key, value]) => (
                    <tr key={key}>
                      <td>
                        <code>{key}</code>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            value === "未设置" ? "bg-danger" : "bg-success"
                          }`}
                        >
                          {value}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>请求头信息</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td>
                      <code>host</code>
                    </td>
                    <td>{headersList.get("host")}</td>
                  </tr>
                  <tr>
                    <td>
                      <code>x-forwarded-proto</code>
                    </td>
                    <td>{headersList.get("x-forwarded-proto")}</td>
                  </tr>
                  <tr>
                    <td>
                      <code>user-agent</code>
                    </td>
                    <td className="text-truncate" style={{ maxWidth: "200px" }}>
                      {headersList.get("user-agent")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>API 端点测试</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2 d-md-block">
                <a
                  href="/api/auth/session"
                  className="btn btn-outline-primary btn-sm"
                  target="_blank"
                >
                  测试 Session API
                </a>
                <a
                  href="/api/auth/providers"
                  className="btn btn-outline-primary btn-sm"
                  target="_blank"
                >
                  测试 Providers API
                </a>
                <a
                  href="/api/auth/csrf"
                  className="btn btn-outline-primary btn-sm"
                  target="_blank"
                >
                  测试 CSRF API
                </a>
                <a
                  href="/api/gists"
                  className="btn btn-outline-primary btn-sm"
                  target="_blank"
                >
                  测试 Gists API
                </a>
                <a
                  href="/api/debug/database"
                  className="btn btn-outline-info btn-sm"
                  target="_blank"
                >
                  测试数据库连接
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-4">
        <h6>调试步骤：</h6>
        <ol>
          <li>检查上面的环境变量是否都已设置</li>
          <li>点击 API 端点测试按钮，查看是否返回正确响应</li>
          <li>如果有错误，检查 Vercel 函数日志</li>
          <li>确保数据库表已正确创建</li>
        </ol>
      </div>
    </div>
  );
}
