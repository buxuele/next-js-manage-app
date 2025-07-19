// 应用配置常量
export const APP_CONFIG = {
  PREVIEW_LINE_COUNT: 15,
  MAX_FILENAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 200,
  MAX_CONTENT_LENGTH: 50000,
} as const;

// 文件类型映射
export const FILE_TYPE_MAPPING = {
  js: "javascript",
  ts: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  py: "python",
  html: "html",
  css: "css",
  json: "json",
  md: "markdown",
  sql: "sql",
  sh: "bash",
  bat: "batch",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
} as const;

// 默认文件扩展名推测
export const CONTENT_TYPE_DETECTION = [
  {
    patterns: ["function", "const", "let", "var", "=>", "import", "export"],
    extension: "js",
    language: "javascript",
  },
  {
    patterns: ["def ", "import ", "from ", "class ", "if __name__"],
    extension: "py",
    language: "python",
  },
  {
    patterns: ["<html", "<div", "<span", "<!DOCTYPE"],
    extension: "html",
    language: "html",
  },
  {
    patterns: ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE TABLE"],
    extension: "sql",
    language: "sql",
  },
  {
    patterns: ["{", "}", '":', '":'],
    extension: "json",
    language: "json",
  },
] as const;
