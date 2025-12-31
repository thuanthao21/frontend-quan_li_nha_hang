import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext' // Import Context
import { CartProvider } from './context/CartContext' // Import Context

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> // Có thể bỏ StrictMode nếu WebSocket bị connect 2 lần ở localhost
    <AuthProvider>
        <CartProvider>
            <App />
        </CartProvider>
    </AuthProvider>
  // </React.StrictMode>,
)