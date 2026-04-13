# my-app folder
### `.env.local`

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=

# Google OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# NextAuth Configuration
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Frontend URL
FRONTEND_URL=
```

---

### Description of Variables

* **NEXT_PUBLIC_BACKEND_URL**
  URL of your backend API (accessible from the frontend)

* **GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET**
  Credentials from Google Cloud Console for OAuth authentication

* **NEXTAUTH_SECRET**
  Secret key used by NextAuth for encryption (generate a random string)

* **NEXTAUTH_URL**
  Base URL of your application (e.g., `http://localhost:3000`)

* **FRONTEND_URL**
  URL where your frontend is hosted


### Example

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=some-random-secret
NEXTAUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

# backend folder

###  Environment Variables

Create a `.env` file in the root directory and add the following:

```env
DATABASE_URL=
FRONTEND_URL=
SECRET_KEY=
ALGORITHM=HS256
```

### Description of Variables

* **DATABASE_URL**  
  Connection string used by the backend to connect to the database

* **FRONTEND_URL**  
  URL of your frontend application (used for CORS and redirects)

* **SECRET_KEY**  
  Secret key used for signing and securing tokens (keep it private) it should same as next auth secreate

* **ALGORITHM**  
  Algorithm used for token signing (default: `HS256`)
