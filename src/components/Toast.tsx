"use client";

import { useEffect, useState, useCallback } from "react";

let pushToast: (msg: string) => void = () => {};

export function toast(msg: string) {
  pushToast(msg);
}

export default function Toast() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);

  const handler = useCallback((m: string) => {
    setMsg(m);
    setShow(true);
    window.clearTimeout((handler as any)._t);
    (handler as any)._t = window.setTimeout(() => setShow(false), 2600);
  }, []);

  useEffect(() => {
    pushToast = handler;
    return () => {
      pushToast = () => {};
    };
  }, [handler]);

  return (
    <div id="toast" className={show ? "show" : ""} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
