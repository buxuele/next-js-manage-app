"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ProjectErrorBoundary extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Project management error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">
              <i className="bi bi-exclamation-triangle me-2"></i>
              项目管理出现错误
            </h4>
            <p>
              很抱歉，项目管理功能遇到了一个错误。请尝试刷新页面或联系管理员。
            </p>
            <hr />
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-danger"
                onClick={() => window.location.reload()}
              >
                刷新页面
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => this.setState({ hasError: false })}
              >
                重试
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-3">
                <summary>错误详情（开发模式）</summary>
                <pre className="mt-2 p-2 bg-dark text-light rounded">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
