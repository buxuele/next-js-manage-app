"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // 动态加载 Bootstrap JavaScript
    const loadBootstrap = async () => {
      if (typeof window !== "undefined" && !window.bootstrap) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
        script.async = true;
        script.onload = () => {
          console.log("Bootstrap JavaScript 加载完成");
        };
        document.head.appendChild(script);
      }
    };

    loadBootstrap();
  }, []);

  return null;
}
