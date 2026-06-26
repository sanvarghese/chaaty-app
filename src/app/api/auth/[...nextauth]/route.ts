import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export const runtime = "nodejs";   // ← Add this line

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session }) {
      await dbConnect();
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        session.user.id = user._id.toString();
      }
      return session;
    },
    async signIn({ profile }) {
      await dbConnect();
      const user = await User.findOne({ email: profile?.email });
      if (!user) {
        await User.create({
          email: profile?.email,
          name: profile?.name,
          image: profile?.picture,
        });
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };