import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({user, account, token}) {
      return true
    },

    async jwt({token, user, account}) {
      // Add user info to the token
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        
        try {
          const payload = {
            name: user.name,
            email: user.email,
          }
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/add_user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.ok) {
              token.DBID = data.user_id;
            }
          }
        } catch (e) {
          console.error("Failed to add/fetch user from DB:", e);
        }
      }
      // Get access token from account object (not user)
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },

    async session({session, token}) {
      // Add token info to the session
      session.user.id = token.id
      session.user.name = token.name
      session.user.DBID = token.DBID
      session.user.email = token.email
      session.accessToken = token.accessToken
      return session
    },
  },
}

export default NextAuth(authOptions)