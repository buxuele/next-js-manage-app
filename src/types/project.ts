/**
 * Next.js 项目配置接口
 */
export interface ProjectConfig {
  /** 项目唯一标识符 */
  id: string;
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string;
  /** 项目本地路径 */
  path: string;
  /** 开发服务器端口 */
  port?: number;
  /** 是否正在运行 */
  isRunning: boolean;
  /** 访问 URL */
  url?: string;
  /** 项目图标路径 */
  icon?: string;
  /** 最后访问时间 */
  lastAccessed?: Date;
}

/**
 * 项目运行状态
 */
export interface ProjectStatus {
  /** 项目 ID */
  id: string;
  /** 是否正在运行 */
  isRunning: boolean;
  /** 运行端口 */
  port?: number;
  /** 进程 ID */
  pid?: number;
  /** 启动时间 */
  startTime?: Date;
}

/**
 * API 响应基础接口
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 错误代码 */
  code?: string;
}

/**
 * 项目操作类型
 */
export type ProjectAction = "start" | "stop" | "open-directory" | "open-url";

/**
 * 项目配置表单数据
 */
export interface ProjectFormData {
  name: string;
  description: string;
  path: string;
  port?: number;
}
