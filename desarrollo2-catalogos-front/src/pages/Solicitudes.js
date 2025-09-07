import React, { useMemo, useState, useEffect } from "react";
import { Box, Text, Group, Pagination, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import Filterbar from "../components/Filterbar";
import TableComponent from "../components/TableComponent";
import CardsMobile from "../components/CardsMobile";
import SolicitudesPersonas from "../SolicitudesPersonas.json"; 
import ConfirmDelete from "../components/ModalBorrar";

export default function Solicitudes() {
const [data, setData] = useState(SolicitudesPersonas); 

// filtros
const [fNombre, setFNombre] = useState("");
const [fTel, setFTel] = useState("");
const [fDir, setFDir] = useState("");
const [fFecha, setFFecha] = useState("");
const [fServ, setFServ] = useState("");
const [fHab, setFHab] = useState("");

// paginación
const pageSize = 10;
const [page, setPage] = useState(1);

const filtered = useMemo(() => {
const match = (val, f) =>
    String(val).toLowerCase().includes(f.trim().toLowerCase());
return data.filter(
    (r) =>
    match(r.nombre, fNombre) &&
    match(r.telefono, fTel) &&
    match(r.direccion, fDir) &&
    match(r.fechaHora, fFecha) &&
    match(r.servicio, fServ) &&
    match(r.habilidad, fHab)
);
}, [data, fNombre, fTel, fDir, fFecha, fServ, fHab]);

const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

useEffect(() => {
    if (page > totalPages) setPage(totalPages);
}, [page, totalPages]);

const aprobar = (id) =>
setData((prev) =>
    prev.map((r) => (r.id === id ? { ...r, estado: "aprobado" } : r))
);
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
    // si hubiera back: await api.delete(`/solicitudes/${deletingId}`)
    setData((prev) => prev.filter((r) => r.id !== deletingId));
    setConfirmOpen(false);
    setDeletingId(null);
} finally {
    setDeleting(false);
}
};

const cancelDelete = () => {
setConfirmOpen(false);
setDeletingId(null);
};

// responsive
const theme = useMantineTheme();
const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

return (
<AppLayout>
    <Box
    p="lg"
    bg="white"
    style={{
        borderRadius: 16,
        boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)",
    }}
    >
    <Text fw={700} fz="xl" mb="md" ta="center">
        Solicitudes
    </Text>

    <Filterbar
        fNombre={fNombre}
        setFNombre={setFNombre}
        fTel={fTel}
        setFTel={setFTel}
        fDir={fDir}
        setFDir={setFDir}
        fFecha={fFecha}
        setFFecha={setFFecha}
        fServ={fServ}
        setFServ={setFServ}
        fHab={fHab}
        setFHab={setFHab}
        setPage={setPage}
    />

    {isMobile ? (
        <CardsMobile
        rows={pageData}
        aprobar={aprobar}
        rechazar={askDelete}
        />
    ) : (
        <TableComponent rows={pageData} aprobar={aprobar} rechazar={askDelete} />
    )}

    <Group justify="space-between" mt="md">
        <Text size="sm" c="dimmed">
        Página <Text span fw={700}>{page}</Text> de {totalPages}
        </Text>
        <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
            color="#93755E"        
            variant="filled"    
            radius="md"
            size="sm"
            />
    </Group>
    </Box>
    <ConfirmDelete
        opened={confirmOpen}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        loading={deleting}
    />
</AppLayout>
);
}
