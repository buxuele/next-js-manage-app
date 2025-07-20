import { CONTENT_TYPE_DETECTION, FILE_TYPE_MAPPING } from "./constants";

/**
 * 根据内容推测文件类型和扩展名
 */
export function detectFileType(content: string): {
  extension: string;
  language: string;
} {
  const lowerContent = content.toLowerCase();

  for (const detection of CONTENT_TYPE_DETECTION) {
    if (
      detection.patterns.some((pattern) =>
        lowerContent.includes(pattern.toLowerCase())
      )
    ) {
      return {
        extension: detection.extension,
        language: detection.language,
      };
    }
  }

  return { extension: "txt", language: "plaintext" };
}

/**
 * 根据文件名获取语言类型
 */
export function getLanguageFromFilename(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) return "plaintext";

  return (
    FILE_TYPE_MAPPING[extension as keyof typeof FILE_TYPE_MAPPING] ||
    "plaintext"
  );
}

/**
 * 格式化时间戳为可读格式
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return diffInMinutes <= 1 ? "刚刚" : `${diffInMinutes}分钟前`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}小时前`;
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
}

/**
 * 截断文本到指定长度
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * 验证项目数据
 */
interface ProjectValidationData {
  name?: unknown;
  url?: unknown;
  description?: unknown;
  path?: unknown;
}

export function validateProjectData(data: ProjectValidationData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证项目名称
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("项目名称不能为空");
  }

  // 验证项目URL
  if (!data.url || typeof data.url !== "string" || !data.url.trim()) {
    errors.push("项目URL不能为空");
  } else if (typeof data.url === "string") {
    try {
      new URL(data.url);
    } catch {
      errors.push("项目URL格式不正确");
    }
  }

  // 验证长度限制
  if (typeof data.name === "string" && data.name.length > 100) {
    errors.push("项目名称长度不能超过100个字符");
  }

  if (typeof data.description === "string" && data.description.length > 500) {
    errors.push("项目描述长度不能超过500个字符");
  }

  if (typeof data.path === "string" && data.path.length > 500) {
    errors.push("项目路径长度不能超过500个字符");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
