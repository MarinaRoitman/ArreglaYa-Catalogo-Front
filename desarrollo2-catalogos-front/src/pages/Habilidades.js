import React, { useMemo, useState, useEffect } from "react";
import { Box, Text, Group, Button, Pagination, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import AppLayout from "../components/LayoutTrabajosPendientes";
import HabilidadesFilter from "../components/HabilidadesFilter";
import TableHabilidad from "../components/TableHabilidad";
import ModalHabilidad from "../components/ModalHabilidad";
import CardsHabilidad from "../components/CardsHabilidad";
import ConfirmDelete from "../components/ModalBorrar";
import { API_URL } from "../Api/api";
import { removeHabilidadFromPrestador, addHabilidadToPrestador } from "../Api/prestadores";

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

// Nos aseguramos de que todas las habilidades tengan nombre_rubro
const habilidades = (prestador.habilidades || []).map((h) => ({
    ...h,
    nombre_rubro: h.nombre_rubro ?? "—",
}));

setData(habilidades);
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
servicio: h.nombre_rubro, // 👈 usamos directamente nombre_rubro
})),
[pageData]
);

// ---- Crear (vincular habilidad existente) ----
const [openNuevo, setOpenNuevo] = useState(false);
const [creating, setCreating] = useState(false);

const handleSelectHabilidad = async (habilidad) => {
try {
setCreating(true);
const prestadorId = localStorage.getItem("prestador_id");
if (!prestadorId) throw new Error("Falta prestador_id");

// Asociar habilidad al prestador
await addHabilidadToPrestador(prestadorId, habilidad.id);


const token = localStorage.getItem("token");
const res = await fetch(`${API_URL}prestadores/${prestadorId}`, {
    headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) throw new Error("Error al refrescar habilidades");
const prestador = await res.json();

setData(prestador.habilidades || []); // ahora con nombre_rubro

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
const [deleting, setDeleting] = useState(false);

const askDelete = (id) => {
setDeletingId(id);
setConfirmOpen(true);
};

const confirmDelete = async () => {
try {
setDeleting(true);
const prestadorId = localStorage.getItem("prestador_id");
if (!prestadorId) throw new Error("Falta prestador_id");
await removeHabilidadFromPrestador(prestadorId, deletingId);
setData((prev) => prev.filter((h) => h.id !== deletingId));
setConfirmOpen(false);
setDeletingId(null);
} catch (err) {
console.error("Error eliminando habilidad:", err.message);
alert("No se pudo eliminar la habilidad");
} finally {
setDeleting(false);
}
};

// responsive
const theme = useMantineTheme();
const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

return (
<AppLayout>
<Box
p="lg"
bg="white"
maw={{ base: "100%", lg: 1100, xl: 1200 }}
mx="auto"
style={{
    borderRadius: 16,
    boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)",
}}
>
<Text fw={700} fz="xl" mb="md" ta="center">
    Habilidades del Prestador
</Text>

<Group justify={isMobile ? "stretch" : "flex-start"} mb="sm">
    <Button
    fullWidth={isMobile}
    color="#93755E"
    leftSection={<IconPlus size={16} />}
    onClick={() => setOpenNuevo(true)}
    >
    Vincular habilidad
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
</Box>

<ModalHabilidad
opened={openNuevo}
onClose={() => setOpenNuevo(false)}
onSelect={handleSelectHabilidad}
loading={creating}
habilidadesActuales={data} // 👈 para que no se repitan
/>

<ConfirmDelete
opened={confirmOpen}
onCancel={() => setConfirmOpen(false)}
onConfirm={confirmDelete}
loading={deleting}
itemLabel="esta habilidad"
/>
</AppLayout>
);
}
