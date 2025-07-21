import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByGithubId, createUser, getOrCreateDevUser } from "@/lib/auth";

// GitHub Profile 类型定义
interface GitHubProfile {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
  name: string;
}

// 开发模式检查
const isDevelopment =
  process.env.NODE_ENV === "development" && process.env.DEV_MODE === "true";

export const authOptions = {
  providers: [
    // 生产环境或非开发模式时使用GitHub登录
    ...(isDevelopment
      ? []
      : [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]),
    // 开发模式时使用开发用户登录
    ...(isDevelopment
      ? [
          CredentialsProvider({
            id: "dev-login",
            name: "开发模式登录",
            credentials: {},
            async authorize() {
              // 返回开发用户信息
              return {
                id: "dev-user-1",
                name: "开发用户",
                email: "dev@localhost.com",
                image: "/default-avatar.png",
                username: "developer",
              };
            },
          }),
        ]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // 开发模式登录
      if (account?.provider === "dev-login") {
        try {
          // 获取或创建开发用户
          const devUser = await getOrCreateDevUser();
          user.id = devUser.id;
          user.username = devUser.username;
          return true;
        } catch (error) {
          console.error("Error during dev login:", error);
          return false;
        }
      }

      // GitHub登录
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
