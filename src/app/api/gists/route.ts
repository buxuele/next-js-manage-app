
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { getToken } from "next-auth/jwt";

// 强制 Vercel 使用 Node.js 运行时
export const runtime = "nodejs";

// 获取 GitHub Gists
async function getGitHubGists(accessToken: string) {
  try {
    const response = await fetch("https://api.github.com/gists", {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "next-js-project-manager",
      },
    });

    if (!response.ok) {
      console.error("GitHub API 错误:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("错误详情:", errorText);
      return {
        success: false,
        error: `GitHub API Error: ${response.status} ${response.statusText}`,
        details: errorText,
      };
    }

    const gists = await response.json();
    return { success: true, data: gists };
  } catch (error) {
    console.error("请求 Gists 失败:", error);
    return {
      success: false,
      error: "Failed to fetch Gists",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.accessToken) {
    return NextResponse.json(
      { error: "Access Token not found" },
      { status: 401 }
    );
  }

  const result = await getGitHubGists(token.accessToken as string);

  if (result.success) {
    return NextResponse.json(result.data);
  } else {
    return NextResponse.json(
      { error: result.error, details: result.details },
      { status: 500 }
    );
  }
}
