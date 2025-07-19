"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Gist } from '@/lib/data';

interface GistDetailClientViewProps {
  gist: Gist;
  lineNumbers: string;
  highlightedCodeHTML: string;
}

export function GistDetailClientView({ gist, lineNumbers, highlightedCodeHTML }: GistDetailClientViewProps) {
  const [copyText, setCopyText] = useState("复制");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gist.content);
      setCopyText("已复制!");
      setTimeout(() => setCopyText("复制"), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      setCopyText("失败");
      setTimeout(() => setCopyText("复制"), 2000);
    }
  };
  
  return (
    <>
      <nav className="navbar navbar-expand navbar-dark bg-dark fixed-top" style={{borderBottom: '1px solid #444'}}>
        <div className="container" style={{maxWidth: '1200px'}}>
          <Link className="navbar-brand" href="/">
            <i className="bi bi-arrow-left-circle"></i> 返回主页
          </Link>
          <div className="d-flex align-items-center">
            <span className="navbar-text me-3" title={gist.description}>
              <strong>{gist.filename}</strong>
            </span>
            <button className="btn btn-outline-success btn-sm" onClick={handleCopy}>
              <i className="bi bi-clipboard"></i> {copyText}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mt-5 pt-3" style={{maxWidth: '1200px'}}>
        <div className="card">
          <div className="card-body">
            <div className="code-container">
              <pre className="line-numbers">{lineNumbers}</pre>
              {/* 使用 dangerouslySetInnerHTML 来渲染已经高亮好的 HTML */}
              <pre><code dangerouslySetInnerHTML={{ __html: highlightedCodeHTML }} /></pre>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}