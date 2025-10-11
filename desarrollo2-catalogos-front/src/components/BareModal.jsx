import React, { useEffect } from "react";
import ReactDOM from "react-dom";

export default function BareModal({
opened,
onClose,
title,
children,
width = 560,
closeOnEsc = true,
closeOnOverlayClick = true,
}) {
useEffect(() => {
if (!opened || !closeOnEsc) return;
const onKey = (e) => e.key === "Escape" && onClose?.();
window.addEventListener("keydown", onKey);
return () => window.removeEventListener("keydown", onKey);
}, [opened, closeOnEsc, onClose]);

if (!opened) return null;

const content = (
<div aria-modal="true" role="dialog" style={{ position: "fixed", inset: 0, zIndex: 5000 }}>
    <div
    onClick={closeOnOverlayClick ? onClose : undefined}
    style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.28)",
        backdropFilter: "blur(2px)",
        zIndex: 5000,
    }}
    />
    <div
    style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `min(90vw, ${width}px)`,
        background: "var(--mantine-color-body, #fff)",
        color: "var(--mantine-color-text, #111)",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        border: "1px solid rgba(0,0,0,0.08)",
        overflow: "hidden",
        zIndex: 5001, // la card encima del overlay
    }}
    >
    <div
        style={{
        padding: "14px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        }}
    >
        <div style={{ fontWeight: 700 }}>{title}</div>
        <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: 6,
            borderRadius: 8,
        }}
        >
        ×
        </button>
    </div>
    <div style={{ padding: 16 }}>{children}</div>
    </div>
</div>
);

const host = document.getElementById("modal-root");
return host ? ReactDOM.createPortal(content, host) : content;
}
