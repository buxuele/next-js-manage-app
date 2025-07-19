// 数据存储适配器 - 根据环境自动选择存储方案
import { Gist } from "./data";

// 根据环境变量决定使用哪种数据存储
const getDataProvider = async () => {
  // 优先使用 Neon 数据库（如果有 DATABASE_URL 配置）
  if (process.env.DATABASE_URL) {
    console.log("Using Neon PostgreSQL database");
    const { loadGists, saveGists, getGist, deleteGist } = await import(
      "./data-neon"
    );
    return { loadGists, saveGists, getGist, deleteGist };
  }

  // 默认使用本地文件存储（开发环境）
  console.log("Using local file storage");
  const { loadGists, saveGists } = await import("./data");

  // 为本地存储添加缺失的方法
  const loadGistsWithUserId = async (userId?: string): Promise<Gist[]> => {
    const allGists = await loadGists();
    if (userId) {
      return allGists.filter((g) => g.user_id === userId);
    }
    return allGists;
  };

  const getGist = async (id: string): Promise<Gist | null> => {
    const gists = await loadGists();
    return gists.find((g) => g.id === id) || null;
  };

  const deleteGist = async (id: string): Promise<boolean> => {
    const gists = await loadGists();
    const filteredGists = gists.filter((g) => g.id !== id);

    if (gists.length === filteredGists.length) {
      return false;
    }

    await saveGists(filteredGists);
    return true;
  };

  return { loadGists: loadGistsWithUserId, saveGists, getGist, deleteGist };
};

// 导出统一的接口
export const loadGists = async (userId?: string): Promise<Gist[]> => {
  const provider = await getDataProvider();
  return provider.loadGists(userId);
};

export const saveGists = async (gists: Gist[]): Promise<void> => {
  const provider = await getDataProvider();
  return provider.saveGists(gists);
};

export const getGist = async (id: string): Promise<Gist | null> => {
  const provider = await getDataProvider();
  return provider.getGist(id);
};

export const deleteGist = async (id: string): Promise<boolean> => {
  const provider = await getDataProvider();
  return provider.deleteGist(id);
};

// 保存单个 gist（新增或更新）
export const saveGist = async (gistData: Partial<Gist>): Promise<Gist> => {
  // 如果使用 Neon 数据库，直接调用 Neon 的 saveGist
  if (process.env.DATABASE_URL) {
    const { saveGist: neonSaveGist } = await import("./data-neon");

    if (gistData.id) {
      // 更新现有 gist
      const updatedGist = {
        ...gistData,
        updated_at: Date.now(),
      } as Gist;
      return neonSaveGist(updatedGist);
    } else {
      // 创建新 gist
      const { randomUUID } = await import("crypto");
      const newGist: Gist = {
        id: randomUUID(),
        user_id: gistData.user_id || "",
        description: gistData.description || "",
        filename: gistData.filename || "untitled.txt",
        content: gistData.content || "",
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      return neonSaveGist(newGist);
    }
  }

  // 本地文件存储的逻辑（兼容性）
  const gists = await loadGists();

  if (gistData.id) {
    // 更新现有 gist
    const index = gists.findIndex((g) => g.id === gistData.id);
    if (index === -1) {
      throw new Error("Gist not found");
    }

    const updatedGist = {
      ...gists[index],
      ...gistData,
      updated_at: Date.now(),
    } as Gist;

    gists[index] = updatedGist;
    await saveGists(gists);
    return updatedGist;
  } else {
    // 创建新 gist
    const { randomUUID } = await import("crypto");
    const newGist: Gist = {
      id: randomUUID(),
      user_id: gistData.user_id || "",
      description: gistData.description || "",
      filename: gistData.filename || "untitled.txt",
      content: gistData.content || "",
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    gists.unshift(newGist);
    await saveGists(gists);
    return newGist;
  }
};
