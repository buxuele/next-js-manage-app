# Implementation Plan

- [x] 1. 创建核心数据类型和接口

  - 定义 ProjectConfig 接口和相关类型
  - 创建项目配置的 TypeScript 类型定义
  - _Requirements: 1.1, 1.3_

- [x] 2. 实现项目配置管理功能

- [x] 2.1 创建项目配置文件操作工具

  - 实现读取和写入 projects.json 的工具函数
  - 添加文件不存在时的默认配置创建
  - _Requirements: 5.2, 5.3_

- [x] 2.2 实现项目配置 API 端点

  - 创建 GET /api/projects 获取项目列表
  - 创建 POST /api/projects 添加新项目
  - 创建 DELETE /api/projects/[id] 删除项目
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. 实现进程管理功能

- [x] 3.1 创建 Next.js 服务器启动/停止 API

  - 实现 POST /api/projects/[id]/start 启动开发服务器
  - 实现 POST /api/projects/[id]/stop 停止开发服务器
  - 添加端口检测和进程状态管理
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 3.2 实现项目状态检查功能

  - 创建检查项目运行状态的工具函数
  - 实现端口占用检测
  - 添加项目 URL 可访问性检查
  - _Requirements: 1.4, 4.2_

- [x] 4. 实现文件系统操作功能

- [x] 4.1 创建打开目录 API

  - 实现 POST /api/projects/[id]/open-directory
  - 添加路径验证和错误处理
  - 支持 Windows 文件管理器打开
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. 创建项目卡片组件
- [x] 5.1 实现 ProjectCard 组件

  - 创建项目信息显示的卡片组件
  - 添加项目图标、名称、描述、路径显示
  - 实现运行状态指示器
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5.2 添加项目操作按钮

  - 实现"打开目录"按钮功能
  - 实现"访问网址"按钮功能
  - 添加启动/停止服务器按钮
  - 根据项目状态控制按钮可用性
  - _Requirements: 2.1, 3.1, 3.2, 4.1_

- [x] 6. 创建主页面组件
- [x] 6.1 实现 ProjectManager 主组件

  - 创建项目列表的网格布局
  - 实现项目数据的获取和状态管理
  - 添加加载状态和错误处理
  - _Requirements: 1.1, 1.2_

- [x] 6.2 添加项目管理功能

  - 实现添加新项目的表单和逻辑
  - 添加删除项目的确认对话框
  - 实现项目列表的实时更新
  - _Requirements: 5.1, 5.3, 5.4_

- [x] 7. 实现样式和用户体验
- [x] 7.1 应用 Bootstrap 样式

  - 使用 Bootstrap 卡片组件样式化项目卡片
  - 实现响应式网格布局
  - 添加按钮和状态指示器样式
  - _Requirements: 1.2, 1.3_

- [x] 7.2 添加交互反馈

  - 实现操作成功/失败的 Toast 通知
  - 添加按钮点击的加载状态
  - 实现错误信息的友好显示
  - _Requirements: 2.3, 3.2, 4.4, 5.4_

- [x] 8. 集成和测试
- [x] 8.1 连接前端和后端功能

  - 将 ProjectCard 组件连接到 API 端点
  - 实现前端状态与后端数据的同步
  - 添加错误边界和异常处理
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 8.2 创建基础测试
  - 编写 API 端点的基本测试
  - 测试项目配置的 CRUD 操作
  - 验证进程启动/停止功能
  - _Requirements: 4.1, 4.2, 4.3, 5.2_
