"use client";

import { useEffect } from "react";

export function PWARegister() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        const registrar = () => {
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => {
                    console.log("[PWA] Service worker registered:", reg.scope);
                })
                .catch((err) => {
                    console.warn("[PWA] Service worker registration failed:", err);
                });
        };

        // O "load" pode já ter acontecido quando o React inicia: aí o evento nunca viria.
        if (document.readyState === "complete") {
            registrar();
            return;
        }
        window.addEventListener("load", registrar);
        return () => window.removeEventListener("load", registrar);
    }, []);

    return null;
}
