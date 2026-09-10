import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NuxtAuthHandler } from "#auth";
import { config } from "dotenv";
import { sequelize } from "~~/server/plugins/sequelize.server";
import SequelizeAdapter from "@auth/sequelize-adapter";
import { DataTypes, UUIDV4 } from "sequelize";
import bcrypt from "bcryptjs";
import { User } from "~~/server/models/User";

config();
export default NuxtAuthHandler({
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    // @ts-expect-error Use .default here for it to work during SSR.
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        try {
          // Validasi input
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Cari user berdasarkan email
          const user = await User.findOne({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }

          // Verifikasi password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          // Return user object (tanpa password)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    // Gunakan JWT untuk credentials provider
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: SequelizeAdapter(sequelize, {
    synchronize: false,
    models: {
      User: sequelize.define(
        "users",
        {
          id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          name: DataTypes.STRING,
          email: DataTypes.STRING,
          emailVerified: {
            type: DataTypes.DATE,
            field: "email_verified",
          },
          image: DataTypes.STRING,
        },
        {
          underscored: true,
          timestamps: true,
        },
      ),
      Account: sequelize.define(
        "accounts",
        {
          id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          type: DataTypes.STRING,
          provider: DataTypes.STRING,
          providerAccountId: {
            type: DataTypes.STRING,
            field: "provider_account_id",
          },
          refresh_token: DataTypes.TEXT,
          access_token: DataTypes.TEXT,
          expires_at: DataTypes.INTEGER,
          token_type: DataTypes.STRING,
          scope: DataTypes.STRING,
          id_token: DataTypes.TEXT,
          session_state: DataTypes.STRING,
          userId: {
            type: DataTypes.STRING,
            field: "user_id",
          },
        },
        {
          underscored: true,
          timestamps: true,
        },
      ),
      Session: sequelize.define(
        "sessions",
        {
          id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          expires: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          sessionToken: {
            type: DataTypes.STRING,
            field: "session_token",
            unique: true,
          },
          userId: {
            type: DataTypes.STRING,
            field: "user_id",
          },
        },
        {
          underscored: true,
          timestamps: true,
          hooks: {
            beforeCreate: (session: any) => {
              if (session.expires) {
                const expiresDate =
                  session.expires instanceof Date
                    ? session.expires
                    : new Date(session.expires);

                if (isNaN(expiresDate.getTime())) {
                  session.expires = new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                  );
                } else {
                  session.expires = expiresDate;
                }
              } else {
                session.expires = new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000,
                );
              }
            },
            beforeUpdate: (session: any) => {
              if (session.expires) {
                const expiresDate =
                  session.expires instanceof Date
                    ? session.expires
                    : new Date(session.expires);

                if (isNaN(expiresDate.getTime())) {
                  session.expires = new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                  );
                } else {
                  session.expires = expiresDate;
                }
              }
            },
          },
        },
      ),
      VerificationToken: sequelize.define(
        "verification_tokens",
        {
          identifier: {
            type: DataTypes.STRING,
            primaryKey: true,
          },
          token: DataTypes.STRING,
          expires: DataTypes.DATE,
        },
        {
          underscored: true,
          timestamps: true,
        },
      ),
    },
  }) as any,

  events: {
    async signIn(message) {
      /* on successful sign in */
    },
    async signOut(message) {
      /* on signout */
    },
    async createUser(message) {
      /* user created */
    },
    async updateUser(message) {
      /* user updated - e.g. their email was verified */
    },
    async linkAccount(message) {
      /* account (e.g. GitHub) linked to a user */
    },
    async session(message) {
      /* session is active */
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/login",
    newUser: "/",
  },

  callbacks: {
    /* on before signin */
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    /* on redirect to another url */
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    /* on session retrival */
    async session({ session, token }) {
      if (session?.user && token.sub) {
        const dbUser = await User.findByPk(token.sub);

        if (dbUser) {
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.image = dbUser.image;
          (session.user as any).role = dbUser.role;
          (session.user as any).verificationStatus = dbUser.verificationStatus;
        }
      }

      return session;
    },
    /* on JWT token creation or mutation */
    async jwt({ token, user, account, profile, isNewUser }) {
      // Saat user pertama kali login (user object tersedia)
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // Fetch full user data from database to get role and verificationStatus
        const dbUser = await User.findOne({
          where: { email: user.email },
        });

        if (dbUser) {
          (token as any).role = dbUser.role;
          (token as any).verificationStatus = dbUser.verificationStatus;
        }
      }
      return token;
    },
  },
});
