// src/pages/Habilidades.js
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
import { habilidadesApi } from "../Api/habilidades";
import { rubrosApi } from "../Api/rubrosServicio";

export default function Habilidades() {
const [data, setData] = useState([]);
const [rubros, setRubros] = useState([]);
const [loading, setLoading] = useState(true);

// filtros
const [fNombre, setFNombre] = useState("");
const [fServicio, setFServicio] = useState("");

// paginación
const pageSize = 10;
const [page, setPage] = useState(1);

// cargar datos del back
useEffect(() => {
(async () => {
try {
    setLoading(true);
    const [hab, rub] = await Promise.all([habilidadesApi.list(), rubrosApi.list()]);
    setData(hab || []);
    setRubros(rub || []);
} finally {
    setLoading(false);
}
})();
}, []);

// helpers
const getRubroId = (h) =>
h?.id_rubro ?? h?.rubro_id ?? h?.idRubro ?? h?.rubro?.id ?? null;

const rubroById = useMemo(
() => Object.fromEntries((rubros || []).map((r) => [r.id, r.nombre])),
[rubros]
);

// Filtro
const filtered = useMemo(() => {
const match = (v, f) => String(v ?? "").toLowerCase().includes(f.trim().toLowerCase());
return (data || []).filter((r) => {
    const servicioNombre = r.servicio ?? rubroById[getRubroId(r)] ?? "";
    return match(r.nombre, fNombre) && match(servicioNombre, fServicio);
});
}, [data, fNombre, fServicio, rubroById]);

const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

// retroceder página si borré el último
useEffect(() => {
if (page > totalPages) setPage(totalPages);
}, [page, totalPages]);

// rows para UI (agrega nombre de servicio)
const rowsView = useMemo(
() =>
    pageData.map((h) => ({
    ...h,
    servicio: h.servicio ?? rubroById[getRubroId(h)] ?? "—",
    })),
[pageData, rubroById]
);

// ---- Crear ----
const [openNuevo, setOpenNuevo] = useState(false);
const [creating, setCreating] = useState(false);

const handleCreate = async ({ nombre, id_rubro, descripcion }) => {
try {
    setCreating(true);
    const created = await habilidadesApi.create({ nombre, descripcion, id_rubro });
    setData((prev) => [...prev, created]);
    setOpenNuevo(false);
} catch (err) {
    alert(err.message || "No se pudo crear la habilidad");
} finally {
    setCreating(false);
}
};

// ---- Editar ----
const [openEdit, setOpenEdit] = useState(false);
const [editingRow, setEditingRow] = useState(null);
const [savingEdit, setSavingEdit] = useState(false);

const openEditModal = (rowView) => {
  const original = data.find(d => d.id === rowView.id) || rowView;
  // log para chequear:
  // console.log("edit original:", original);
  setEditingRow(original);
  setOpenEdit(true);
};

const handleUpdate = async ({ id, nombre, id_rubro, descripcion }) => {
try {
    setSavingEdit(true);
    const updated = await habilidadesApi.update(id, { nombre, descripcion, id_rubro });
    setData((prev) => prev.map((x) => (x.id === id ? { ...x, ...updated } : x)));
    setOpenEdit(false);
    setEditingRow(null);
} catch (err) {
    alert(err.message || "No se pudo actualizar la habilidad");
} finally {
    setSavingEdit(false);
}
};

// ---- Eliminar (con confirmación) ----
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
    await habilidadesApi.remove(deletingId);
    setData((prev) => prev.filter((x) => x.id !== deletingId));
    setConfirmOpen(false);
    setDeletingId(null);
} catch (err) {
    alert(err.message || "No se pudo eliminar la habilidad");
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
    style={{ borderRadius: 16, boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)" }}
    >
    <Text fw={700} fz="xl" mb="md" ta="center">Habilidades</Text>

    <Group justify={isMobile ? "stretch" : "flex-start"} mb="sm">
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
        <CardsHabilidad rows={rowsView} onEdit={openEditModal} onDelete={askDelete} loading={loading} />
    ) : (
        <TableHabilidad rows={rowsView} onEdit={openEditModal} onDelete={askDelete} loading={loading} />
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
    mode="create"
    onCreate={handleCreate}
    rubros={rubros}
    loading={creating}
    />

    <ModalHabilidad
    opened={openEdit}
    onClose={() => setOpenEdit(false)}
    mode="edit"
    initialValues={editingRow}
    onUpdate={handleUpdate}
    rubros={rubros}
    loading={savingEdit}
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
