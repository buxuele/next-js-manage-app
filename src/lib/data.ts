import fs from "fs/promises";
import path from "path";

// 定义 Task 的数据结构类型，这就是 TypeScript 的好处
export interface Task {
  id: string;
  user_id: string;
  description: string;
  filename: string;
  content: string;
  created_at: number;
  updated_at: number;
}

// 找到 tasks.json 文件的绝对路径
// process.cwd() 指向项目根目录
const dataFilePath = path.join(process.cwd(), "tasks.json");

/**
 * 从 tasks.json 文件加载数据
 */
// --- 让这个函数开口说话 ---
export async function loadTasks(): Promise<Task[]> {
  // 日志1：告诉我们它到底在找哪个路径的文件
  console.log("Attempting to load tasks from:", dataFilePath);

  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    if (!fileContent) {
      // 日志2：告诉我们文件是空的
      console.log("tasks.json is empty.");
      return [];
    }
    const tasks: Task[] = JSON.parse(fileContent);
    // 日志3：告诉我们成功加载了多少条数据
    console.log(`Successfully loaded ${tasks.length} tasks.`);
    return tasks;
  } catch (error) {
    // 日志4：如果出错了，把错误信息打印出来！
    console.error("!!! Critical Error loading tasks.json:", error);
    return [];
  }
}

/**
 * 将数据保存到 tasks.json 文件
 * @param tasks 要保存的 Task 数组
 */
export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    // 将 tasks 数组转换成格式化的 JSON 字符串
    const data = JSON.stringify(tasks, null, 4); // null, 4 用于美化输出，类似 Python 的 indent=4
    // 异步写入文件
    await fs.writeFile(dataFilePath, data, "utf-8");
    console.log(`Successfully saved ${tasks.length} tasks.`);
  } catch (error) {
    console.error("!!! Critical Error saving tasks:", error);
    throw new Error("Failed to save tasks to file");
  }
}
