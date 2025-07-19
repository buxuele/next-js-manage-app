import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import GistList from "@/components/GistList";
import { loadGists } from "@/lib/data-adapter";
import { authOptions } from "@/lib/auth-config";

// Next.js 15 页面组件类型
interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // 检查用户是否已登录
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 在 Next.js 15 中，searchParams 也是 Promise
  const resolvedSearchParams = searchParams ? await searchParams : {};
  console.log("Search params:", resolvedSearchParams); // 可以用于将来的搜索功能

  // 1. 加载当前用户的 gists
  const gists = await loadGists((session as any).user?.id);

  // 2. 确保最新的在最前面
  const sortedGists = [...gists].sort((a, b) => b.updated_at - a.updated_at);

  return (
    <main className="container-fluid mt-4 px-4">
      {/* 3. 把排序后的完整列表传递给 GistList 组件 */}
      <GistList initialGists={sortedGists} />
    </main>
  );
}
