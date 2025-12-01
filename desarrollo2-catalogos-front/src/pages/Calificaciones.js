import React, { useEffect, useMemo, useState } from "react";
import {
Paper,
Box,
Text,
Group,
Rating,
LoadingOverlay,
Alert,
Divider,
TextInput,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import { listCalificaciones } from "../Api/calificacion";
import { getUsuarioById } from "../Api/usuarios";

export default function Calificaciones() {
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [reviews, setReviews] = useState([]);
const [filtro, setFiltro] = useState("");

const isDesktop = useMediaQuery("(min-width: 1200px)");

useEffect(() => {
const load = async () => {
    try {
    setLoading(true);
    setError("");

    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("No se encontró prestador_id");

    const all = await listCalificaciones();
    const mias = (all || []).filter(
        (c) => String(c.id_prestador) === String(prestadorId)
    );

    const withUsers = await Promise.all(
        mias.map(async (c) => {
        try {
            const u = await getUsuarioById(c.id_usuario);
            const nombre_usuario = `${u?.nombre || "Usuario"} ${
            u?.apellido || ""
            }`.trim();
            return { ...c, nombre_usuario };
        } catch {
            return { ...c, nombre_usuario: `Usuario #${c.id_usuario}` };
        }
        })
    );

    setReviews(withUsers);
    } catch (err) {
    setError(err.message || "Error al cargar calificaciones");
    } finally {
    setLoading(false);
    }
};

load();
}, []);

// Helper para normalizar rating en rango 0..5
const normRating = (v) => {
const n = Number(v);
if (Number.isNaN(n)) return 0;
return Math.max(0, Math.min(5, n));
};

// promedio estrellas
const promedio = useMemo(() => {
if (!reviews.length) return 0;
const suma = reviews.reduce(
    (acc, r) => acc + (Number(r.estrellas) || 0),
    0
);
return suma / reviews.length;
}, [reviews]);

// filtro
const reviewsFiltradas = useMemo(() => {
const f = filtro.trim().toLowerCase();
if (!f) return reviews;
return reviews.filter((r) => {
    const nom = (r.nombre_usuario || "").toLowerCase();
    const desc = (r.descripcion || "").toLowerCase();
    return nom.includes(f) || desc.includes(f);
});
}, [reviews, filtro]);

return (
<AppLayout>
    <Paper
    p="lg"
    style={{
        position: "relative",
        borderRadius: 16,
        boxShadow:
        "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)",
        width: "100%",
        maxWidth: isDesktop ? 1400 : "95%",
        margin: "0 auto",
        minHeight: "80vh",
        overflowX: "auto",
        background: "--app-bg",
        border: "1px solid var(--input-border)",
    }}
    >
    <LoadingOverlay visible={loading} zIndex={1000} />

    <Text fw={700} fz="xl" mb="xs" ta="center">
        Calificaciones
    </Text>

    {error && (
        <Alert color="red" mb="lg" title="Error">
        {error}
        </Alert>
    )}

    {/*Promedio con fracciones */}
    <Group justify="center" mb="xs">
        <Rating value={normRating(promedio)} readOnly fractions={10} />
    </Group>
    <Text ta="center" mb="md">
        {reviews.length
        ? `${promedio.toFixed(1)} / 5 · ${reviews.length} review(s)`
        : "(Sin reviews)"}
    </Text>

    <Divider my="sm" />

    <TextInput
        placeholder="Buscar por usuario o comentario…"
        mb="md"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
    />

    <Box style={{ maxHeight: 420, overflowY: "auto", paddingRight: 8 }}>
        {reviewsFiltradas.length === 0 ? (
        <Text fz="sm" c="dimmed">
            {reviews.length === 0
            ? "Este prestador aún no tiene calificaciones"
            : "No hay resultados para ese filtro"}
        </Text>
        ) : (
        reviewsFiltradas.map((r) => (
            <Box
                key={r.id}
                mb="lg"
                p="md"
                style={{
                    borderRadius: 12,
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                }}
                >
                <Group gap="md" wrap="nowrap" align="flex-start">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group justify="space-between" align="center" mb={6}>
                        <Text
                        fw={600}
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: 16,
                        }}
                        >
                        {r.nombre_usuario || "Usuario"}
                        </Text>

                        <Rating
                        value={normRating(r.estrellas)}
                        readOnly
                        size="sm"
                        fractions={10}
                        />
                    </Group>

                    <Text fz="sm" c="dimmed" style={{ lineHeight: 1.4 }}>
                        {r.descripcion?.trim() || "Sin comentario"}
                    </Text>
                    </Box>
                </Group>
                </Box>

        ))
        )}
    </Box>
    </Paper>
</AppLayout>
);
}
