import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ToastProvider from './components/ui/ToastProvider'
import { setupGoogleSingletonGuard } from './utils/googleAuthSingleton'

setupGoogleSingletonGuard();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '991251497498-8dbtgph18m00uif6lplihkf6li1cr0t9.apps.googleusercontent.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ToastProvider />
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
