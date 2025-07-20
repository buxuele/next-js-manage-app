import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";

export default async function HomePage() {
  // 检查用户是否已登录
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 重定向到项目管理页面
  redirect("/projects");
}
