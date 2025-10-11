import React, { useMemo, useState, useEffect } from "react";
import { Paper, Text, Group, Button, Pagination, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import AppLayout from "../components/LayoutTrabajosPendientes";
import HabilidadesFilter from "../components/HabilidadesFilter";
import TableHabilidad from "../components/TableHabilidad";
import ModalHabilidad from "../components/ModalHabilidad";
import CardsHabilidad from "../components/CardsHabilidad";
import ConfirmDelete from "../components/ModalBorrar";
import { API_URL } from "../Api/api";
import { addHabilidadToPrestador, removeHabilidadFromPrestador } from "../Api/prestadores";

export default function Habilidades() {
const [data, setData] = useState([]); // habilidades del prestador
const [loading, setLoading] = useState(true);

// filtros
const [fNombre, setFNombre] = useState("");
const [fServicio, setFServicio] = useState("");

// paginación
const pageSize = 10;
const [page, setPage] = useState(1);

// 🔹 cargar habilidades del prestador
useEffect(() => {
const fetchHabilidadesPrestador = async () => {
    try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const prestadorId = localStorage.getItem("prestador_id");

    if (!token || !prestadorId) {
        console.error("Falta token o prestador_id en localStorage");
        return;
    }

    const res = await fetch(`${API_URL}prestadores/${prestadorId}`, {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error("Error al traer habilidades");

    const prestador = await res.json();
    setData(prestador.habilidades || []);
    } catch (err) {
    console.error("Error cargando habilidades:", err.message);
    } finally {
    setLoading(false);
    }
};

fetchHabilidadesPrestador();
}, []);

// Filtro
const filtered = useMemo(() => {
const match = (v, f) =>
    String(v ?? "").toLowerCase().includes(f.trim().toLowerCase());
return (data || []).filter((h) => {
    const servicioNombre = h.nombre_rubro ?? "";
    return match(h.nombre, fNombre) && match(servicioNombre, fServicio);
});
}, [data, fNombre, fServicio]);

const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

const rowsView = useMemo(
() =>
    pageData.map((h) => ({
    ...h,
    servicio: h.nombre_rubro ?? "—",
    })),
[pageData]
);

// ---- Crear ----
const [openNuevo, setOpenNuevo] = useState(false);
const [creating, setCreating] = useState(false);

const handleSelectHabilidad = async (habilidad) => {
try {
    setCreating(true);
    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("Falta prestador_id");

    // asociamos al prestador
    await addHabilidadToPrestador(prestadorId, habilidad.id);

    // refrescamos
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}prestadores/${prestadorId}`, {
    headers: { Authorization: `Bearer ${token}` },
    });
    const prestador = await res.json();
    setData(prestador.habilidades || []);

    setOpenNuevo(false);
} catch (err) {
    console.error("Error vinculando habilidad:", err.message);
    alert("No se pudo vincular la habilidad");
} finally {
    setCreating(false);
}
};

// ---- Eliminar ----
const [confirmOpen, setConfirmOpen] = useState(false);
const [deletingId, setDeletingId] = useState(null);

const askDelete = (id) => {
setDeletingId(id);
setConfirmOpen(true);
};

const confirmDelete = async () => {
try {
    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("Falta prestador_id");
    await removeHabilidadFromPrestador(prestadorId, deletingId);
    setData((prev) => prev.filter((h) => h.id !== deletingId));
    setConfirmOpen(false);
    setDeletingId(null);
} catch (err) {
    console.error("Error eliminando habilidad:", err.message);
    alert("No se pudo eliminar la habilidad");
}
};

// responsive
const theme = useMantineTheme();
const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

return (
<AppLayout>
    <Paper
    p="lg"
    maw={{ base: "100%", lg: 1100, xl: 1200 }}
    mx="auto"
    radius="lg" shadow="sm"
    style={{
        background:"--app-bg",
        border: "1px solid var(--input-border)",
    }}
    >
    <Text fw={700} fz="xl" mb="md" ta="center">
        Mis Habilidades
    </Text>

    <Group justify={isMobile ? "stretch" : "flex-end"} mb="sm">
        <Button
        fullWidth={isMobile}
        color="#93755E"
        leftSection={<IconPlus size={16} />}
        onClick={() => setOpenNuevo(true)}
        >
        Nuevo
        </Button>
    </Group>

    <HabilidadesFilter
        fNombre={fNombre}
        setFNombre={setFNombre}
        fServicio={fServicio}
        setFServicio={setFServicio}
        setPage={setPage}
    />

    {isMobile ? (
        <CardsHabilidad
        rows={rowsView}
        onDelete={askDelete}
        loading={loading}
        />
    ) : (
        <TableHabilidad
        rows={rowsView}
        onDelete={askDelete}
        loading={loading}
        />
    )}

    <Group justify={isMobile ? "center" : "space-between"} mt="md">
        {!isMobile && (
        <Text size="sm" c="dimmed">
            Página <Text span fw={700}>{page}</Text> de {totalPages}
        </Text>
        )}
        <Pagination
        value={page}
        onChange={setPage}
        total={totalPages}
        color="#93755E"
        variant="filled"
        radius="md"
        size={isMobile ? "md" : "sm"}
        />
    </Group>
    </Paper>

    <ModalHabilidad
    opened={openNuevo}
    onClose={() => setOpenNuevo(false)}
    onSelect={handleSelectHabilidad}
    habilidadesActuales={data}
    loading={creating}
    />

    <ConfirmDelete
    opened={confirmOpen}
    onCancel={() => setConfirmOpen(false)}
    onConfirm={confirmDelete}
    loading={false}
    itemLabel="esta habilidad"
    />
</AppLayout>
);
}
