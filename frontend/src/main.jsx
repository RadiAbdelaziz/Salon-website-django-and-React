import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initializeDOMSafety } from "./utils/domUtils.js";
import {
  logExtensionConflicts,
  preventExtensionInjection,
} from "./utils/extensionDetector.js";
import { initializeImageSafety } from "./utils/imageUtils.js";
import { CartProvider } from "./contexts/CartContext.jsx";

// Initialize DOM safety measures to prevent browser extension conflicts
initializeDOMSafety();

// Initialize image safety measures
initializeImageSafety();

// Detect and log extension conflicts
logExtensionConflicts();

// Prevent extension injection
preventExtensionInjection();

createRoot(document.getElementById("root")).render(
  <CartProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </CartProvider>
);
