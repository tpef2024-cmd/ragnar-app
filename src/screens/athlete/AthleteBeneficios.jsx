// ── TAB: BENEFICIOS (atleta) ──────────────────────────────────────────────────
// Descuentos de comercios Ragneros. El atleta abre un descuento, obtiene su
// cupón (uno por descuento por mes, de uso único) y lo muestra/descarga como QR.
// El cupón vence a fin de mes; si el descuento sigue, el mes siguiente saca otro.
// Requiere la cuota del mes al día (lo valida la base de datos).
import { useState } from "react";
import { Y } from "../../lib/constants";
import { fechaCorta, fechaHora, diasHasta, mesActualAR, mesActualISO, finDeMes, nombreMes, venceCupon } from "../../lib/fechas";
import { useBeneficios } from "../../hooks/useBeneficios";
import CuponQR from "../../components/shared/CuponQR";
import LogoComercio from "../../components/shared/LogoComercio";
import SolicitudComercio from "./SolicitudComercio";

const etiqueta = { fontSize: 9, letterSpacing: 3, color: "#999", textTransform: "uppercase" };

function Vencimiento({ fecha }) {
  const dias = diasHasta(fecha);
  const urgente = dias <= 3;
  return (
    <span style={{ fontSize: 9, letterSpacing: 1, color: urgente ? "#f87171" : "#7a7a7a" }}>
      {dias === 0 ? "Vence hoy" : dias === 1 ? "Vence mañana" : `Hasta el ${fechaCorta(fecha)}`}
    </span>
  );
}

function EstadoChip({ cupon }) {
  if (!cupon) return null;
  const usado = cupon.status === "redeemed";
  return (
    <span className={usado ? "badge-no" : "badge-ok"} style={usado ? { color: "#999", borderColor: "#333", background: "#151515" } : {}}>
      {usado ? "Usado este mes" : "Tu cupón"}
    </span>
  );
}

export default function AthleteBeneficios({ usuario, perfil, comercio, onComercioSolicitado }) {
  const { descuentos, cupones, cuotaAlDia, cargando, obtenerCupon, cuponDe } = useBeneficios(usuario, true);
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  // El detalle puede venir de un descuento vigente o de un cupón viejo
  const seleccionado =
    descuentos.find((d) => d.id === seleccionadoId) ||
    cupones.find((c) => c.discount_id === seleccionadoId)?.discounts ||
    null;

  const abrir = (id) => {
    setError("");
    setSeleccionadoId(id);
  };

  const handleObtener = async () => {
    setProcesando(true);
    setError("");
    const r = await obtenerCupon(seleccionado.id);
    if (!r?.ok) setError(r?.motivo || "No se pudo generar el cupón");
    setProcesando(false);
  };

  // ── DETALLE ──────────────────────────────────────────────────────────────
  if (seleccionado) {
    const com = seleccionado.businesses;
    const cupon = cuponDe(seleccionado.id);
    const esMio = com?.owner_id === usuario?.id;
    const vencido = !descuentos.some((d) => d.id === seleccionado.id);
    const finMes = finDeMes(mesActualISO());
    // Día en que vencería un cupón sacado hoy
    const venceHoy = seleccionado.valid_until < finMes ? seleccionado.valid_until : finMes;
    // ¿El descuento sigue el mes que viene? (para avisar que podrá sacar otro)
    const sigueElMesQueViene = seleccionado.valid_until > finMes;

    return (
      <div style={{ maxWidth: 560 }}>
        <button className="btn-salir" style={{ marginBottom: 16 }} onClick={() => setSeleccionadoId(null)}>
          ← Volver
        </button>

        {com?.cover_url && (
          <div
            style={{
              height: 140,
              borderRadius: 2,
              marginBottom: -28,
              background: `#151515 url("${com.cover_url}") center/cover no-repeat`,
              border: "1px solid #222",
            }}
          />
        )}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, padding: com?.cover_url ? "0 14px" : 0, marginBottom: 16 }}>
          <LogoComercio comercio={com} size={64} />
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 2, lineHeight: 1, color: "#fff" }}>{com?.name}</div>
            {com?.category && <div style={{ ...etiqueta, color: Y, marginTop: 4 }}>{com.category}</div>}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, lineHeight: 1, color: Y }}>{seleccionado.percentage}%</div>
            <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.4 }}>{seleccionado.title}</div>
          </div>
          {seleccionado.conditions && (
            <div style={{ fontSize: 11, color: "#b3b3b3", lineHeight: 1.7, marginTop: 10 }}>{seleccionado.conditions}</div>
          )}
          <div style={{ marginTop: 10 }}>
            <Vencimiento fecha={seleccionado.valid_until} />
          </div>
        </div>

        {(com?.description || com?.address || com?.phone || com?.instagram || com?.website) && (
          <div className="card" style={{ marginBottom: 12, fontSize: 11, color: "#b3b3b3", lineHeight: 1.9 }}>
            {com.description && <div style={{ marginBottom: 8, color: "#ddd" }}>{com.description}</div>}
            {com.address && <div>📍 {com.address}</div>}
            {com.phone && <div>📞 {com.phone}</div>}
            {com.instagram && (
              <div>
                📸{" "}
                <a
                  href={`https://instagram.com/${com.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: Y }}
                >
                  @{com.instagram.replace(/^@/, "")}
                </a>
              </div>
            )}
            {com.website && (
              <div>
                🌐{" "}
                <a href={/^https?:\/\//.test(com.website) ? com.website : `https://${com.website}`} target="_blank" rel="noreferrer" style={{ color: Y }}>
                  {com.website}
                </a>
              </div>
            )}
          </div>
        )}

        {cupon ? (
          <>
            <CuponQR cupon={cupon} descuento={seleccionado} comercio={com} nombreAtleta={perfil?.full_name} vencido={vencido} />
            {cupon.status === "redeemed" && sigueElMesQueViene && (
              <div style={{ fontSize: 10, color: "#b3b3b3", letterSpacing: 1, lineHeight: 1.6, textAlign: "center", marginTop: 10 }}>
                Este descuento sigue vigente: desde el 1° del mes que viene podés obtener un cupón nuevo.
              </div>
            )}
          </>
        ) : vencido ? (
          <div className="card" style={{ fontSize: 10, color: "#7a7a7a", textAlign: "center", letterSpacing: 1 }}>
            Este descuento ya no está vigente.
          </div>
        ) : esMio ? (
          <div className="card" style={{ fontSize: 10, color: "#7a7a7a", textAlign: "center", letterSpacing: 1 }}>
            Este es tu comercio — no podés obtener cupones propios.
          </div>
        ) : (
          <>
            {cuotaAlDia === false && (
              <div style={{ fontSize: 10, color: "#f87171", letterSpacing: 1, lineHeight: 1.6, marginBottom: 10 }}>
                Para obtener cupones necesitás tener la cuota de {mesActualAR()} al día.
              </div>
            )}
            {error && <div style={{ fontSize: 10, color: "#f87171", letterSpacing: 1, lineHeight: 1.6, marginBottom: 10 }}>{error}</div>}
            <button className="btn-y" onClick={handleObtener} disabled={procesando || cuotaAlDia === false}>
              {procesando ? <span className="spin">◌</span> : "OBTENER CUPÓN"}
            </button>
            <div style={{ fontSize: 9, color: "#666", letterSpacing: 1, textAlign: "center", marginTop: 8 }}>
              Un cupón por mes · se usa una sola vez · vence el {fechaCorta(venceHoy)}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── LISTA ────────────────────────────────────────────────────────────────
  const idsVigentes = new Set(descuentos.map((d) => d.id));
  const mes = mesActualISO();
  // Anteriores: los de meses pasados, los ya usados y los de descuentos terminados
  const historial = cupones.filter(
    (c) => c.period !== mes || c.status === "redeemed" || !idsVigentes.has(c.discount_id),
  );

  return (
    <div>
      {cuotaAlDia === false && (
        <div className="card" style={{ borderColor: "#991b1b", background: "#1a0b0b", marginBottom: 16 }}>
          <div style={{ ...etiqueta, color: "#f87171", marginBottom: 6 }}>Cuota pendiente</div>
          <div style={{ fontSize: 11, color: "#ddd", lineHeight: 1.7 }}>
            Los cupones Ragneros son para atletas con la cuota al día. Cuando el coach registre tu pago de {mesActualAR()} se habilitan
            automáticamente.
          </div>
        </div>
      )}

      <div style={{ ...etiqueta, marginBottom: 10 }}>Descuentos Ragneros</div>

      {cargando ? (
        <div style={{ textAlign: "center", padding: 32, color: "#555" }}>
          <span className="spin">◌</span>
        </div>
      ) : descuentos.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "#555", fontSize: 10, letterSpacing: 2 }}>
          TODAVÍA NO HAY DESCUENTOS VIGENTES
        </div>
      ) : (
        <div className="grid-beneficios">
          {descuentos.map((d) => (
            <div key={d.id} className="card card-beneficio" onClick={() => abrir(d.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <LogoComercio comercio={d.businesses} size={40} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {d.businesses.name}
                  </div>
                  {d.businesses.category && <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1 }}>{d.businesses.category}</div>}
                </div>
                <EstadoChip cupon={cuponDe(d.id)} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, lineHeight: 1, color: Y }}>{d.percentage}%</div>
                <div style={{ fontSize: 11, color: "#ddd", lineHeight: 1.4 }}>{d.title}</div>
              </div>
              <div style={{ marginTop: 8 }}>
                <Vencimiento fecha={d.valid_until} />
              </div>
            </div>
          ))}
        </div>
      )}

      {historial.length > 0 && (
        <>
          <div style={{ ...etiqueta, margin: "24px 0 10px" }}>Mis cupones anteriores</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {historial.map((c) => (
              <div
                key={c.id}
                className="card"
                style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.6, cursor: "pointer" }}
                onClick={() => abrir(c.discount_id)}
              >
                <LogoComercio comercio={c.discounts?.businesses} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#ddd" }}>
                    {c.discounts?.percentage}% · {c.discounts?.businesses?.name}
                  </div>
                  <div style={{ fontSize: 9, color: "#7a7a7a", letterSpacing: 1 }}>
                    {c.short_code} · {nombreMes(c.period)} · {c.status === "redeemed" ? "usado" : "venció"} el{" "}
                    {c.status === "redeemed" ? fechaHora(c.redeemed_at).slice(0, 10) : fechaCorta(venceCupon(c, c.discounts))}
                  </div>
                </div>
                <span style={{ fontSize: 9, color: "#999", letterSpacing: 1 }}>{c.status === "redeemed" ? "UTILIZADO" : "VENCIDO"}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <SolicitudComercio comercio={comercio} onSolicitado={onComercioSolicitado} />
    </div>
  );
}
