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
 * 验证task数据
 */

// --- 修改为 ---

// 在函数上方定义一个输入类型
interface TaskValidationData {
  description?: unknown;
  content?: unknown;
}

export function validateTaskData(data: TaskValidationData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 为了安全，我们先检查类型再使用
  if (
    !data.description ||
    typeof data.description !== "string" ||
    !data.description.trim()
  ) {
    errors.push("描述不能为空");
  }

  if (
    !data.content ||
    typeof data.content !== "string" ||
    !data.content.trim()
  ) {
    errors.push("内容不能为空");
  }

  // 只有在确定是字符串后才检查长度
  if (typeof data.description === "string" && data.description.length > 200) {
    errors.push("描述长度不能超过200个字符");
  }

  if (typeof data.content === "string" && data.content.length > 50000) {
    errors.push("内容长度不能超过50000个字符");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
