import GitHubProvider from "next-auth/providers/github";
import { findUserByGithubId, createUser } from "@/lib/auth";

// GitHub Profile 类型定义
interface GitHubProfile {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
  name: string;
}

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "github" && profile) {
        try {
          // 类型断言为 GitHub Profile
          const githubProfile = profile as GitHubProfile;

          // 检查用户是否已存在
          let existingUser = await findUserByGithubId(githubProfile.id);

          if (!existingUser) {
            // 创建新用户
            existingUser = await createUser({
              github_id: githubProfile.id,
              username: githubProfile.login,
              email: githubProfile.email || "",
              avatar_url: githubProfile.avatar_url || "",
              name: githubProfile.name || "",
            });
          }

          // 将数据库用户信息添加到 user 对象
          user.id = existingUser.id;
          user.username = existingUser.username;

          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      // 将用户信息添加到 JWT token
      if (user) {
        token.userId = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }: any) {
      // 将用户信息添加到 session
      if (token) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
};
