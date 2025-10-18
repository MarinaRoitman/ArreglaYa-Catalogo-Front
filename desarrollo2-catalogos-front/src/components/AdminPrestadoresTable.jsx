import React, { useState, useMemo } from "react";
import * as MC from "@mantine/core";
import { IconPencil, IconStar, IconX } from "@tabler/icons-react";

const norm = (v) =>
(v == null ? "" : String(v))
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "");

export default function AdminPrestadoresTable({ rows = [], onEdit, onRate, onDelete }) {
const [filters, setFilters] = useState({
nombre: "",
telefono: "",
direccion: "",
zonas: "",
dni: "",
email: "",
});

const handleFilterChange = (key, value) => {
setFilters((prev) => ({ ...prev, [key]: value }));
};

const filtered = useMemo(() => {
return rows.filter((r) => {
    const checks = {
    nombre: norm(r.nombreCompleto || r.nombre).includes(norm(filters.nombre)),
    telefono: norm(r.telefono).includes(norm(filters.telefono)),
    direccion: norm(r.direccion).includes(norm(filters.direccion)),
    zonas: Array.isArray(r.zonas)
        ? norm(r.zonas.join(", ")).includes(norm(filters.zonas))
        : norm(r.zonas).includes(norm(filters.zonas)),
    dni: norm(r.dni).includes(norm(filters.dni)),
    email: norm(r.email).includes(norm(filters.email)),
    };
    return Object.values(checks).every(Boolean);
});
}, [rows, filters]);

const ACTIONS_COL_WIDTH = 128;

return (
<MC.Box>
    <MC.Box visibleFrom="sm">
    <MC.ScrollArea type="auto" scrollbarSize={10} offsetScrollbars styles={{ root: { borderRadius: 12 } }}>
        <MC.Table stickyHeader striped highlightOnHover withColumnBorders style={{ minWidth: 1080, tableLayout: "fixed" }}>
        <MC.Table.Thead>
            <MC.Table.Tr>
            <MC.Table.Th style={{ minWidth: 220, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">Nombre y Apellido</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th style={{ minWidth: 140, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">Teléfono</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th style={{ minWidth: 220, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">Dirección</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th style={{ minWidth: 180, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">Zonas</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th style={{ minWidth: 120, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">DNI</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th style={{ minWidth: 220, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">Mail</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th style={{ width: ACTIONS_COL_WIDTH, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">Acciones</MC.Text>
            </MC.Table.Th>
            </MC.Table.Tr>

            {/* filtros */}
            <MC.Table.Tr>
            <MC.Table.Th>
                <MC.TextInput placeholder="Buscar..." value={filters.nombre} onChange={(e) => handleFilterChange("nombre", e.currentTarget.value)} size="xs" radius="sm" />
            </MC.Table.Th>
            <MC.Table.Th>
                <MC.TextInput placeholder="Buscar..." value={filters.telefono} onChange={(e) => handleFilterChange("telefono", e.currentTarget.value)} size="xs" radius="sm" />
            </MC.Table.Th>
            <MC.Table.Th>
                <MC.TextInput placeholder="Buscar..." value={filters.direccion} onChange={(e) => handleFilterChange("direccion", e.currentTarget.value)} size="xs" radius="sm" />
            </MC.Table.Th>
            <MC.Table.Th>
                <MC.TextInput placeholder="Buscar..." value={filters.zonas} onChange={(e) => handleFilterChange("zonas", e.currentTarget.value)} size="xs" radius="sm" />
            </MC.Table.Th>
            <MC.Table.Th>
                <MC.TextInput placeholder="Buscar..." value={filters.dni} onChange={(e) => handleFilterChange("dni", e.currentTarget.value)} size="xs" radius="sm" />
            </MC.Table.Th>
            <MC.Table.Th>
                <MC.TextInput placeholder="Buscar..." value={filters.email} onChange={(e) => handleFilterChange("email", e.currentTarget.value)} size="xs" radius="sm" />
            </MC.Table.Th>
            <MC.Table.Th />
            </MC.Table.Tr>
        </MC.Table.Thead>

        <MC.Table.Tbody>
            {filtered.map((r) => (
            <MC.Table.Tr key={r.id ?? `${r.email}-${r.dni}`}>
                <MC.Table.Td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.nombreCompleto || r.nombre || "-"}
                </MC.Table.Td>
                <MC.Table.Td>{r.telefono || "-"}</MC.Table.Td>
                <MC.Table.Td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.direccion || "-"}
                </MC.Table.Td>
                <MC.Table.Td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {Array.isArray(r.zonas) ? r.zonas.join(", ") : (r.zonas || "-")}
                </MC.Table.Td>
                <MC.Table.Td>{r.dni || "-"}</MC.Table.Td>
                <MC.Table.Td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.email || "-"}
                </MC.Table.Td>

                <MC.Table.Td style={{ width: 128, textAlign: "center" }}>
                <MC.Group gap="xs" justify="center" wrap="nowrap">
                    <MC.ActionIcon variant="light" color="blue" aria-label="Editar" onClick={() => onEdit?.(r)} title="Editar" size="md">
                    <IconPencil size={18} />
                    </MC.ActionIcon>
                    <MC.ActionIcon variant="light" color="yellow" aria-label="Destacar" onClick={() => onRate?.(r)} title="Destacar / Calificar" size="md">
                    <IconStar size={18} />
                    </MC.ActionIcon>
                    <MC.ActionIcon variant="light" color="red" aria-label="Eliminar" onClick={() => onDelete?.(r)} title="Eliminar" size="md">
                    <IconX size={18} />
                    </MC.ActionIcon>
                </MC.Group>
                </MC.Table.Td>
            </MC.Table.Tr>
            ))}

            {filtered.length === 0 && (
            <MC.Table.Tr>
                <MC.Table.Td colSpan={7}>
                <MC.Text c="dimmed" ta="center" py="md">
                    Sin resultados
                </MC.Text>
                </MC.Table.Td>
            </MC.Table.Tr>
            )}
        </MC.Table.Tbody>
        </MC.Table>
    </MC.ScrollArea>
    </MC.Box>

    {/* mobile cards */}
    <MC.Stack gap="sm" hiddenFrom="sm">
    {filtered.map((r) => (
        <MC.Paper key={r.id} p="md" radius="lg" withBorder>
        <MC.Text fw={600}>{r.nombreCompleto || r.nombre}</MC.Text>
        <MC.Text size="xs" c="dimmed">{r.email}</MC.Text>

        <MC.Divider my="sm" />

        <MC.Text size="sm"><strong>Tel:</strong> {r.telefono || "-"}</MC.Text>
        <MC.Text size="sm"><strong>DNI:</strong> {r.dni || "-"}</MC.Text>
        <MC.Text size="sm"><strong>Dir:</strong> {r.direccion || "-"}</MC.Text>
        <MC.Text size="sm"><strong>Zonas:</strong> {Array.isArray(r.zonas) ? r.zonas.join(", ") : r.zonas}</MC.Text>

        <MC.Group gap="xs" mt="sm">
            <MC.ActionIcon variant="light" color="blue" onClick={() => onEdit?.(r)}><IconPencil size={18} /></MC.ActionIcon>
            <MC.ActionIcon variant="light" color="yellow" onClick={() => onRate?.(r)}><IconStar size={18} /></MC.ActionIcon>
            <MC.ActionIcon variant="light" color="red" onClick={() => onDelete?.(r)}><IconX size={18} /></MC.ActionIcon>
        </MC.Group>
        </MC.Paper>
    ))}
    </MC.Stack>
</MC.Box>
);
}
