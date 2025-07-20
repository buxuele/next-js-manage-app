import type { Metadata } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";
import "../styles/flask-style.css";

export const metadata: Metadata = {
  title: "我的任务中心",
  description: "基于 Next.js 的任务管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-bs-theme="light">
      <head>
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
        <SessionProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </SessionProvider>

        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          async
        ></script>
      </body>
    </html>
  );
}
