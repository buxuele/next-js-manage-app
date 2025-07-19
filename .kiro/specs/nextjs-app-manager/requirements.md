# Requirements Document

## Introduction

这是一个 Next.js 应用管理器，用于查看和管理本地的多个 Next.js 项目。用户可以通过一个统一的界面查看所有项目的状态、快速访问项目目录、启动开发服务器，并通过浏览器访问运行中的应用。

## Requirements

### Requirement 1

**User Story:** 作为开发者，我想要在一个界面中查看所有本地 Next.js 项目，以便快速了解项目概况

#### Acceptance Criteria

1. WHEN 用户打开应用 THEN 系统 SHALL 显示所有已配置的 Next.js 项目列表
2. WHEN 显示项目列表 THEN 每个项目卡片 SHALL 包含项目名称、描述、路径信息
3. WHEN 显示项目卡片 THEN 系统 SHALL 显示项目的图标或缩略图
4. WHEN 项目正在运行 THEN 系统 SHALL 显示项目的运行状态和端口信息

### Requirement 2

**User Story:** 作为开发者，我想要快速打开项目目录，以便在文件管理器中查看项目文件

#### Acceptance Criteria

1. WHEN 用户点击"打开目录"按钮 THEN 系统 SHALL 在文件管理器中打开对应的项目目录
2. WHEN 项目路径不存在 THEN 系统 SHALL 显示错误提示信息
3. WHEN 打开目录操作失败 THEN 系统 SHALL 显示具体的错误信息

### Requirement 3

**User Story:** 作为开发者，我想要快速访问运行中的应用，以便在浏览器中查看应用效果

#### Acceptance Criteria

1. WHEN 用户点击"访问网址"按钮 AND 应用正在运行 THEN 系统 SHALL 在浏览器中打开应用 URL
2. WHEN 应用未运行 THEN "访问网址"按钮 SHALL 显示为禁用状态
3. WHEN 应用 URL 无法访问 THEN 系统 SHALL 显示连接错误提示

### Requirement 4

**User Story:** 作为开发者，我想要启动和停止 Next.js 开发服务器，以便控制应用的运行状态

#### Acceptance Criteria

1. WHEN 用户点击启动按钮 THEN 系统 SHALL 在对应目录中执行 npm run dev 命令
2. WHEN 应用成功启动 THEN 系统 SHALL 更新应用状态为运行中并显示端口信息
3. WHEN 用户点击停止按钮 THEN 系统 SHALL 终止对应的开发服务器进程
4. WHEN 应用启动失败 THEN 系统 SHALL 显示错误信息和失败原因

### Requirement 5

**User Story:** 作为开发者，我想要添加和管理项目配置，以便自定义要管理的 Next.js 项目列表

#### Acceptance Criteria

1. WHEN 用户点击添加项目按钮 THEN 系统 SHALL 显示项目配置表单
2. WHEN 用户填写项目信息并提交 THEN 系统 SHALL 验证路径有效性并保存配置
3. WHEN 用户删除项目配置 THEN 系统 SHALL 从列表中移除该项目
4. WHEN 项目配置无效 THEN 系统 SHALL 显示验证错误信息
