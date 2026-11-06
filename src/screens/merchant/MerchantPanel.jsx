// ── PANTALLA: PANEL COMERCIO RAGNERO ──────────────────────────────────────────
// Lo usan tanto los usuarios "merchant" (solo comercio) como los atletas que
// además tienen un comercio aprobado (ven estas tabs junto a las de atleta).
import { lazy, Suspense } from "react";
import { useComercio } from "../../hooks/useComercio";
import ComercioCanjes from "./ComercioCanjes";
import ComercioPerfil from "./ComercioPerfil";

// El escáner usa html5-qrcode (~370 KB). Se carga recién al abrir la tab
// Escanear, así los atletas no descargan esa librería nunca.
const ComercioEscanear = lazy(() => import("./ComercioEscanear"));

export default function MerchantPanel({ tab, usuario }) {
  const { negocio, descuentos, canjes, cargarCanjes, guardarPerfil, subirImagen, validarCupon, canjearCupon } = useComercio(usuario, true);

  if (tab === "canjes") return <ComercioCanjes canjes={canjes} onRecargar={cargarCanjes} />;
  if (tab === "mi_comercio")
    return <ComercioPerfil negocio={negocio} descuentos={descuentos} guardarPerfil={guardarPerfil} subirImagen={subirImagen} />;
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
          <span className="spin">◌</span>
        </div>
      }
    >
      <ComercioEscanear negocio={negocio} validarCupon={validarCupon} canjearCupon={canjearCupon} />
    </Suspense>
  );
}
