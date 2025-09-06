import React, { useMemo, useState } from "react";
import { Box, Text, Group, Pagination, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import Filterbar from "../components/Filterbar";
import TableComponent from "../components/TableComponent";
import CardsMobile from "../components/CardsMobile";


const JOBS_MOCK = Array.from({ length: 100 }).map((_, i) => ({
id: i + 1,
nombre: "Martina Fede",
telefono: "11-11111111",
direccion: "Av. Siempre Viva 742",
fechaHora: i % 3 === 0 ? "27/08/2025 15hs" : "27/08/2025",
servicio: "Electricista",
habilidad: "Conectar luminarias",
estado: "pendiente",
}));

export default function TrabajosPendientes() {
const [data, setData] = useState(JOBS_MOCK);

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

const aprobar = (id) =>
setData((prev) =>
    prev.map((r) => (r.id === id ? { ...r, estado: "aprobado" } : r))
);
const rechazar = (id) =>
setData((prev) =>
    prev.map((r) => (r.id === id ? { ...r, estado: "rechazado" } : r))
);

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
        Trabajos Pendientes
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
        rechazar={rechazar}
        />
    ) : (
        <TableComponent rows={pageData} aprobar={aprobar} rechazar={rechazar} />
    )}

    <Group justify="space-between" mt="md">
        <Text size="sm" c="dimmed">
        Página <Text span fw={700}>{page}</Text> de {totalPages}
        </Text>
        <Pagination value={page} onChange={setPage} total={totalPages} />
    </Group>
    </Box>
</AppLayout>
);
}
