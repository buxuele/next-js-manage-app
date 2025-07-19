# 导入导出功能说明

## 🎯 功能概述

为端口管理应用添加了项目配置的导入导出功能，方便用户备份、迁移和分享项目配置。

## ✨ 新增功能

### 1. 界面更新

- **按钮组设计**: 将原来的单个"添加项目"按钮改为按钮组
- **下拉菜单**: 在"添加项目"按钮旁边添加了"更多"下拉菜单
- **图标支持**: 使用 Bootstrap Icons 提供直观的导入导出图标

### 2. 导出功能

- **一键导出**: 点击"导出配置"即可下载 JSON 文件
- **智能命名**: 文件名包含导出日期，格式：`projects-export-YYYY-MM-DD.json`
- **完整信息**: 导出包含项目名称、描述、路径、端口等完整配置
- **状态反馈**: 显示导出成功消息和项目数量

### 3. 导入功能

- **文件选择**: 通过隐藏的文件输入框选择 JSON 文件
- **格式验证**: 自动验证导入文件的格式和必需字段
- **批量导入**: 支持一次导入多个项目配置
- **错误处理**: 跳过无效配置，继续导入有效项目
- **结果反馈**: 显示导入成功和失败的项目数量

## 🔧 技术实现

### 导出实现

```typescript
const handleExportProjects = () => {
  const exportData = {
    version: "1.0",
    exportTime: new Date().toISOString(),
    projects: projects.map((project) => ({
      name: project.name,
      description: project.description,
      path: project.path,
      port: project.port,
      icon: project.icon,
    })),
  };

  // 创建下载链接
  const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  // ... 下载逻辑
};
```

### 导入实现

```typescript
const handleImportProjects = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    const importData = JSON.parse(e.target?.result as string);

    // 逐个导入项目
    for (const projectData of importData.projects) {
      await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(projectData),
      });
    }
  };
};
```

## 📋 JSON 格式规范

### 导出格式

```json
{
  "version": "1.0",
  "exportTime": "2024-01-20T10:30:00.000Z",
  "projects": [
    {
      "name": "项目名称",
      "description": "项目描述",
      "path": "项目路径",
      "port": 3000,
      "icon": "图标路径"
    }
  ]
}
```

### 字段说明

- `version`: 格式版本号（用于未来兼容性）
- `exportTime`: 导出时间戳
- `projects`: 项目配置数组
  - `name` (必需): 项目名称
  - `path` (必需): 项目路径
  - `description` (可选): 项目描述
  - `port` (可选): 端口号，默认 3000
  - `icon` (可选): 图标路径

## 🎨 用户体验优化

### 1. 智能状态管理

- **导出按钮**: 只在有项目时才可用
- **文件重选**: 支持重复选择同一文件导入
- **加载反馈**: 导入过程中显示适当的加载状态

### 2. 错误处理

- **格式验证**: 检查 JSON 格式和必需字段
- **部分失败**: 即使部分项目导入失败，也会继续处理其他项目
- **友好提示**: 清晰的成功/失败消息

### 3. 界面集成

- **Bootstrap 样式**: 与现有界面风格保持一致
- **响应式设计**: 在不同屏幕尺寸下都能正常使用
- **图标语义**: 使用直观的上传/下载图标

## 🚀 使用场景

1. **配置备份**: 定期导出项目配置作为备份
2. **环境迁移**: 在不同开发环境间迁移项目配置
3. **团队协作**: 分享项目配置给团队成员
4. **批量设置**: 快速设置多个相似项目

## 📝 后续优化建议

1. **配置模板**: 提供常用项目类型的配置模板
2. **选择性导出**: 允许用户选择特定项目进行导出
3. **导入预览**: 导入前显示将要导入的项目列表
4. **版本兼容**: 支持不同版本格式的向后兼容
