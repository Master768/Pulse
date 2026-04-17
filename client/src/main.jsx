/**
 * FRONTEND ENTRY POINT
 * 
 * This is the first file executed when the website loads in the browser.
 * It "bootstraps" the React application into the static HTML 'root' element.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Import global CSS styles
import App from './App.jsx' // Import the main Application component

// 1. SELECT ROOT: Find the <div id="root"> in index.html
// 2. RENDER: Inject the React component tree into the DOM
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode is a wrapper that helps find common bugs during development */}
    <App />
  </StrictMode>,
)

