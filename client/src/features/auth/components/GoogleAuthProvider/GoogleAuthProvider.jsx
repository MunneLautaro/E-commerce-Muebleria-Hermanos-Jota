import { GoogleOAuthProvider } from "@react-oauth/google"

export const GoogleAuthProvider = ({ children }) => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    {children}
  </GoogleOAuthProvider>
)
