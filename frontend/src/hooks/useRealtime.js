import { useEffect, useRef, useState } from "react";
import { realtimeUrl } from "../api/client.js";

// Conexión WebSocket de tiempo real con reconexión exponencial.
// Devuelve el estado: "connecting" | "live" | "offline".
// Al reconectar se llama a `onReconnect` para recargar la lista y no perder cambios.
export function useRealtime(enabled, onEvent, onReconnect) {
  const [status, setStatus] = useState("offline");
  const handlers = useRef({ onEvent, onReconnect });
  handlers.current = { onEvent, onReconnect };

  useEffect(() => {
    if (!enabled || typeof WebSocket === "undefined") return;
    let ws;
    let retry = 0;
    let timer;
    let closed = false;
    let connectedBefore = false;
    let ping;

    const connect = () => {
      setStatus("connecting");
      ws = new WebSocket(realtimeUrl());
      ws.onopen = () => {
        if (connectedBefore) handlers.current.onReconnect?.();
        connectedBefore = true;
        retry = 0;
        setStatus("live");
        // Mantiene viva la conexión a través de proxies que cortan sockets inactivos
        ping = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send("ping"), 25000);
      };
      ws.onmessage = (msg) => {
        try {
          handlers.current.onEvent(JSON.parse(msg.data));
        } catch {
          /* mensaje no válido: se ignora */
        }
      };
      ws.onclose = (e) => {
        clearInterval(ping);
        setStatus("offline");
        // 4401 = sesión expirada: no se reintenta; la siguiente petición HTTP lleva al login
        if (closed || e.code === 4401) return;
        timer = setTimeout(connect, Math.min(30000, 1000 * 2 ** retry++));
      };
    };
    connect();

    return () => {
      closed = true;
      clearTimeout(timer);
      clearInterval(ping);
      ws?.close();
      setStatus("offline");
    };
  }, [enabled]);

  return status;
}
