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
      // Insert the user in the database if they don't exist
      const {email, name} = user
      console.log('signin callback is called')
      const payload = {
        name: name,
        email: email,
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/add_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${account?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to add user to database');
      }

      const data = await res.json()
      user.DBIB = data.user_id

      return true

    },

    async jwt({token, user, account}) {
      // Add user info to the token
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.DBID = user.DBIB
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