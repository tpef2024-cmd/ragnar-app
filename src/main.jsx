import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Home from "./screens/Home.jsx";
import Tienda from "./screens/store/Tienda.jsx";
import Promociones from "./screens/store/Promociones.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Home público — presentación del gimnasio y accesos a Tienda / App */}
        <Route path="/" element={<Home />} />

        {/* Tienda pública — no requiere login */}
        <Route path="/tienda" element={<Tienda />} />

        {/* Promociones — banner + productos destacados, no requiere login */}
        <Route path="/promociones" element={<Promociones />} />

        {/* App de atletas/coach — todo lo que ya existía sigue viviendo acá
            adentro, con su propia navegación interna por estado (no por URL) */}
        <Route path="/app/*" element={<App />} />

        {/* Cualquier otra ruta no reconocida vuelve al home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
