import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App.jsx";
import Home from "./screens/Home.jsx";
import Tienda from "./screens/store/Tienda.jsx";
import Promociones from "./screens/store/Promociones.jsx";
import CarritoProvider from "./components/store/CarritoProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* Carrito compartido entre /tienda y /promociones */}
      <CarritoProvider>
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
      </CarritoProvider>
    </BrowserRouter>
    <Analytics />
  </StrictMode>,
);
