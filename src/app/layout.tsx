import type { Metadata } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SessionProvider } from "@/components/SessionProvider";
import Navigation from "@/components/Navigation";
import "./globals.css";
import "../styles/flask-style.css";

export const metadata: Metadata = {
  title: "我的端口中心",
  description: "基于 Next.js 的端口管理工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-bs-theme="dark">
      <head>
        {/* 保留这些全局的 CDN 链接 */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body>
        {/* 
          导航栏 <nav> 已经从这里移除！
          因为导航栏的“添加”按钮和 Gist 列表的状态紧密相关，
          所以它被移动到了 GistList.tsx 组件内部，由它自己管理。
          这里只负责提供一个最外层的壳子。
        */}

        {/* {children} 会渲染我们具体的页面，比如带有导航栏的 GistList */}
        <SessionProvider>
          <ErrorBoundary>
            <Navigation />
            {children}
          </ErrorBoundary>
        </SessionProvider>

        {/* Bootstrap 的 JS 脚本依然保留在这里 */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          async
        ></script>
      </body>
    </html>
  );
}
