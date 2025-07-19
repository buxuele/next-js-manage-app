"use client";

import { useState, useEffect, useMemo } from "react";
import { Gist } from "@/lib/data";
import { getLanguageFromFilename, formatTimestamp } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";
import hljs from "highlight.js";

interface GistCardProps {
  gist: Gist;
  onDelete: (id: string) => void;
  onEdit: (gist: Gist) => void; // 修改这里，传递整个 gist 对象
}

// 使用常量文件中的配置
const { PREVIEW_LINE_COUNT } = APP_CONFIG;

export default function GistCard({ gist, onDelete, onEdit }: GistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyText, setCopyText] = useState("复制");

  // 使用 useMemo 缓存计算结果
  const { isLong, displayContent, lineNumbers } =
    useMemo(() => {
      const lines = gist.content.split("\n");
      const isLong = lines.length > PREVIEW_LINE_COUNT;
      const displayLines = isExpanded
        ? lines
        : lines.slice(0, PREVIEW_LINE_COUNT);
      const displayContent = displayLines.join("\n");
      const lineNumbers = Array.from(
        { length: displayLines.length },
        (_, i) => i + 1
      ).join("\n");

      return { lines, isLong, displayLines, displayContent, lineNumbers };
    }, [gist.content, isExpanded]);

  useEffect(() => {
    const currentCard = document.getElementById(`gist-card-${gist.id}`);
    if (currentCard) {
      const codeBlock = currentCard.querySelector("pre code");
      if (codeBlock) {
        hljs.highlightElement(codeBlock as HTMLElement);
      }
    }
  }, [displayContent, gist.id]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gist.content);
      setCopyText("已复制!");
      setTimeout(() => setCopyText("复制"), 2000);
    } catch (err) {
      console.error("复制失败:", err);
      setCopyText("失败");
      setTimeout(() => setCopyText("复制"), 2000);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`确定要删除片段 "${gist.filename}" 吗？`)) {
      try {
        const response = await fetch(`/api/gists/${gist.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "删除失败" }));
          throw new Error(errorData.error || "删除失败");
        }
        onDelete(gist.id);
      } catch (error) {
        console.error("删除请求失败:", error);
        const errorMessage =
          error instanceof Error ? error.message : "删除失败，请重试";
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="card" id={`gist-card-${gist.id}`}>
      <div className="card-header">
        <div className="header-info">
          <div className="gist-filename">{gist.filename}</div>
          <div className="gist-description">{gist.description}</div>
          <div
            className="gist-timestamp text-muted"
            style={{ fontSize: "0.7em" }}
          >
            {formatTimestamp(gist.updated_at)}
          </div>
        </div>
        <div className="actions">
          <button
            onClick={() => onEdit(gist)}
            className="btn btn-sm btn-icon-text btn-edit"
            title="修改"
          >
            <i className="bi bi-pencil-square"></i>
            <span>修改</span>
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-sm btn-icon-text btn-delete"
            title="删除"
          >
            <i className="bi bi-trash"></i>
            <span>删除</span>
          </button>
          <button
            onClick={handleCopy}
            className="btn btn-sm btn-icon-text btn-copy"
            title="复制"
          >
            <i className="bi bi-clipboard"></i>
            <span>{copyText}</span>
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="code-container">
          <pre className="line-numbers">{lineNumbers}</pre>
          <pre>
            <code
              className={`language-${getLanguageFromFilename(gist.filename)}`}
            >
              {displayContent}
            </code>
          </pre>
        </div>
      </div>
      {isLong && (
        <div className="card-footer">
          <button
            className="btn btn-sm btn-toggle-expand"
            onClick={toggleExpand}
          >
            {isExpanded ? (
              <>
                <i className="bi bi-chevron-up"></i> 收起
              </>
            ) : (
              <>
                <i className="bi bi-chevron-down"></i> 显示更多
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
