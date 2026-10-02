// ── PROVIDER: CARRITO DE LA TIENDA ────────────────────────────────────────────
// Mantiene los productos que el visitante va sumando en /tienda y
// /promociones (el mismo carrito en las dos páginas). Se guarda en el
// navegador (localStorage) para que no se pierda al recargar o al volver más
// tarde — es solo una comodidad: si el navegador no lo permite, el carrito
// funciona igual mientras la página esté abierta.
//
// No toca la base de datos ni el stock: el pedido se confirma por WhatsApp
// con el gimnasio, igual que antes.
import { useState, useEffect, useMemo, useCallback } from "react";
import { CarritoContext } from "../../lib/carritoContext";

const CLAVE_STORAGE = "ragnar-carrito";

function leerGuardado() {
  try {
    const crudo = localStorage.getItem(CLAVE_STORAGE);
    const lista = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

// Cantidad máxima que se puede pedir de un producto (su stock disponible)
const tope = (stock) => Math.max(0, Number(stock) || 0);

export default function CarritoProvider({ children }) {
  // items: [{ id, name, price, stock, cantidad }]
  const [items, setItems] = useState(leerGuardado);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
    } catch {
      // sin storage disponible (modo privado, etc.): se ignora
    }
  }, [items]);

  // Cantidad de un producto en el carrito (0 si no está)
  const cantidadDe = useCallback(
    (id) => items.find((i) => i.id === id)?.cantidad || 0,
    [items],
  );

  // Fijar la cantidad de un producto: 0 lo quita, y nunca supera el stock
  const cambiarCantidad = useCallback((producto, cantidad) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === producto.id);
      const stock = producto.stock ?? existente?.stock;
      const final = Math.min(Math.max(0, cantidad), tope(stock));
      if (final === 0) return prev.filter((i) => i.id !== producto.id);
      if (existente) {
        return prev.map((i) => (i.id === producto.id ? { ...i, cantidad: final } : i));
      }
      return [
        ...prev,
        {
          id: producto.id,
          name: producto.name,
          price: Number(producto.price) || 0,
          stock,
          cantidad: final,
        },
      ];
    });
  }, []);

  const agregar = useCallback(
    (producto) => cambiarCantidad(producto, cantidadDe(producto.id) + 1),
    [cambiarCantidad, cantidadDe],
  );

  const quitar = useCallback(
    (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
    [],
  );

  const vaciar = useCallback(() => setItems([]), []);

  // Actualiza precio, nombre y stock de lo guardado con los datos frescos de
  // la tienda (por si cambiaron desde que se agregó), y ajusta cantidades al
  // stock actual. Los productos que ya no están a la venta se quitan solo
  // cuando se pasa `completo` (la lista entera del catálogo).
  const sincronizar = useCallback((productos, { completo = false } = {}) => {
    setItems((prev) => {
      const porId = new Map(productos.map((p) => [p.id, p]));
      const proxima = prev
        .filter((i) => !completo || porId.has(i.id))
        .map((i) => {
          const p = porId.get(i.id);
          if (!p) return i;
          return {
            ...i,
            name: p.name,
            price: Number(p.price) || 0,
            stock: p.stock,
            cantidad: Math.min(i.cantidad, tope(p.stock)),
          };
        })
        .filter((i) => i.cantidad > 0);
      const igual =
        proxima.length === prev.length &&
        proxima.every((i, n) => JSON.stringify(i) === JSON.stringify(prev[n]));
      return igual ? prev : proxima;
    });
  }, []);

  const valor = useMemo(() => {
    const totalUnidades = items.reduce((t, i) => t + i.cantidad, 0);
    const total = items.reduce((t, i) => t + i.cantidad * i.price, 0);
    return {
      items,
      totalUnidades,
      total,
      cantidadDe,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      sincronizar,
      abierto,
      abrir: () => setAbierto(true),
      cerrar: () => setAbierto(false),
    };
  }, [items, abierto, cantidadDe, agregar, cambiarCantidad, quitar, vaciar, sincronizar]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}
