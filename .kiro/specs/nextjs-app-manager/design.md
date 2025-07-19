# Design Document

## Overview

Next.js 应用管理器是一个基于 Next.js 的 Web 应用，用于管理和监控本地的多个 Next.js 项目。应用采用现代化的卡片式界面设计，提供项目概览、快速访问和状态管理功能。

## Architecture

### 技术栈

- **前端框架**: Next.js 15 + React 19 + TypeScript
- **样式**: Bootstrap 5 (已有依赖)
- **数据存储**: 本地 JSON 文件 (简单快速)
- **进程管理**: Node.js child_process
- **状态管理**: React useState + useEffect

### 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端界面      │    │   API Routes    │    │   文件系统      │
│  (React组件)    │◄──►│  (Next.js API)  │◄──►│  (项目配置)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   进程管理      │
                       │ (child_process) │
                       └─────────────────┘
```

## Components and Interfaces

### 1. 核心组件结构

#### ProjectCard 组件

```typescript
interface ProjectCardProps {
  project: ProjectConfig;
  onOpenDirectory: (path: string) => void;
  onOpenUrl: (url: string) => void;
  onToggleServer: (id: string) => void;
}
```

#### ProjectManager 组件 (主页面)

```typescript
interface ProjectManagerState {
  projects: ProjectConfig[];
  loading: boolean;
  error: string | null;
}
```

### 2. 数据模型

#### ProjectConfig 接口

```typescript
interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  path: string;
  port?: number;
  isRunning: boolean;
  url?: string;
  icon?: string;
  lastAccessed?: Date;
}
```

### 3. API 端点设计

#### GET /api/projects

- 返回所有项目配置
- 检查项目运行状态

#### POST /api/projects

- 添加新项目配置
- 验证路径有效性

#### PUT /api/projects/[id]

- 更新项目配置

#### DELETE /api/projects/[id]

- 删除项目配置

#### POST /api/projects/[id]/start

- 启动项目开发服务器

#### POST /api/projects/[id]/stop

- 停止项目开发服务器

#### POST /api/projects/[id]/open-directory

- 在文件管理器中打开项目目录

## Data Models

### 配置文件结构 (projects.json)

```json
{
  "projects": [
    {
      "id": "unique-id",
      "name": "项目名称",
      "description": "项目描述",
      "path": "C:\\path\\to\\project",
      "port": 3000,
      "isRunning": false,
      "url": "http://localhost:3000",
      "icon": "/icons/project-icon.png",
      "lastAccessed": "2025-01-19T10:00:00Z"
    }
  ]
}
```

### 进程管理状态

```typescript
interface ProcessState {
  [projectId: string]: {
    process: ChildProcess | null;
    port: number;
    startTime: Date;
  };
}
```

## Error Handling

### 1. 前端错误处理

- 使用 React Error Boundary 捕获组件错误
- Toast 通知显示操作结果
- 加载状态和错误状态的 UI 反馈

### 2. API 错误处理

- 统一的错误响应格式
- 详细的错误信息和错误码
- 日志记录关键操作

### 3. 进程管理错误

- 端口冲突检测
- 进程启动失败处理
- 进程意外终止监控

## Testing Strategy

### 1. 单元测试

- 组件渲染测试
- API 端点功能测试
- 工具函数测试

### 2. 集成测试

- 项目配置 CRUD 操作
- 进程启动/停止流程
- 文件系统操作

### 3. 端到端测试

- 完整的用户操作流程
- 跨浏览器兼容性测试

## UI/UX 设计要点

### 1. 卡片式布局

- 响应式网格布局
- 清晰的视觉层次
- 一致的交互模式

### 2. 状态指示

- 运行状态的视觉反馈
- 加载状态动画
- 错误状态提示

### 3. 快速操作

- 一键打开目录
- 一键访问应用
- 快速启动/停止服务

## 性能考虑

### 1. 状态检查优化

- 定期轮询项目状态
- 避免频繁的文件系统操作
- 缓存项目信息

### 2. 进程管理优化

- 进程池管理
- 资源清理机制
- 内存使用监控
