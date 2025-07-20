// 数据存储适配器 - 根据环境自动选择存储方案
import { Task } from "./data";

// 根据环境变量决定使用哪种数据存储
const getDataProvider = async () => {
  // 优先使用 Neon 数据库（如果有 DATABASE_URL 配置）
  if (process.env.DATABASE_URL) {
    console.log("Using Neon PostgreSQL database");
    const { loadTasks, saveTasks, getTask, deleteTask } = await import(
      "./data-neon"
    );
    return { loadTasks, saveTasks, getTask, deleteTask };
  }

  // 默认使用本地文件存储（开发环境）
  console.log("Using local file storage");
  const { loadTasks, saveTasks } = await import("./data");

  // 为本地存储添加缺失的方法
  const loadTasksWithUserId = async (userId?: string): Promise<Task[]> => {
    const allTasks = await loadTasks();
    if (userId) {
      return allTasks.filter((t) => t.user_id === userId);
    }
    return allTasks;
  };

  const getTask = async (id: string): Promise<Task | null> => {
    const tasks = await loadTasks();
    return tasks.find((t) => t.id === id) || null;
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const tasks = await loadTasks();
    const filteredTasks = tasks.filter((t) => t.id !== id);

    if (tasks.length === filteredTasks.length) {
      return false;
    }

    await saveTasks(filteredTasks);
    return true;
  };

  return { loadTasks: loadTasksWithUserId, saveTasks, getTask, deleteTask };
};

// 导出统一的接口
export const loadTasks = async (userId?: string): Promise<Task[]> => {
  const provider = await getDataProvider();
  return provider.loadTasks(userId);
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  const provider = await getDataProvider();
  return provider.saveTasks(tasks);
};

export const getTask = async (id: string): Promise<Task | null> => {
  const provider = await getDataProvider();
  return provider.getTask(id);
};

export const deleteTask = async (id: string): Promise<boolean> => {
  const provider = await getDataProvider();
  return provider.deleteTask(id);
};

// 保存单个 task（新增或更新）
export const saveTask = async (taskData: Partial<Task>): Promise<Task> => {
  // 如果使用 Neon 数据库，直接调用 Neon 的 saveTask
  if (process.env.DATABASE_URL) {
    const { saveTask: neonSaveTask } = await import("./data-neon");

    if (taskData.id) {
      // 更新现有 task
      const updatedTask = {
        ...taskData,
        updated_at: Date.now(),
      } as Task;
      return neonSaveTask(updatedTask);
    } else {
      // 创建新 task
      const { randomUUID } = await import("crypto");
      const newTask: Task = {
        id: randomUUID(),
        user_id: taskData.user_id || "",
        description: taskData.description || "",
        filename: taskData.filename || "untitled.txt",
        content: taskData.content || "",
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      return neonSaveTask(newTask);
    }
  }

  // 本地文件存储的逻辑（兼容性）
  const tasks = await loadTasks();

  if (taskData.id) {
    // 更新现有 task
    const index = tasks.findIndex((t) => t.id === taskData.id);
    if (index === -1) {
      throw new Error("Task not found");
    }

    const updatedTask = {
      ...tasks[index],
      ...taskData,
      updated_at: Date.now(),
    } as Task;

    tasks[index] = updatedTask;
    await saveTasks(tasks);
    return updatedTask;
  } else {
    // 创建新 task
    const { randomUUID } = await import("crypto");
    const newTask: Task = {
      id: randomUUID(),
      user_id: taskData.user_id || "",
      description: taskData.description || "",
      filename: taskData.filename || "untitled.txt",
      content: taskData.content || "",
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    tasks.unshift(newTask);
    await saveTasks(tasks);
    return newTask;
  }
};
