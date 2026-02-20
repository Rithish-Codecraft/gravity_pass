import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'

// Replace with your actual Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  // </GoogleOAuthProvider>
)
