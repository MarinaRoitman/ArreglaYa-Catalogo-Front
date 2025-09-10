import React from "react";
import * as MC from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export default function HabilidadesTable({
rows = [],
onEdit,
onDelete,
loading = false,
skeletonRows = 8,
}) {
return (
<MC.ScrollArea type="auto" aria-busy={loading}>
    <MC.Table
    w="100%"
    style={{ minWidth: 720, tableLayout: "fixed" }}
    withColumnBorders
    striped
    highlightOnHover
    >
    <MC.Table.Thead>
        <MC.Table.Tr>
        <MC.Table.Th>
            {loading ? (
            <MC.Skeleton height={14} width="40%" radius="sm" />
            ) : (
            <MC.Text fw={600} ta="center">Nombre</MC.Text>
            )}
        </MC.Table.Th>
        <MC.Table.Th>
            {loading ? (
            <MC.Skeleton height={14} width="35%" radius="sm" />
            ) : (
            <MC.Text fw={600} ta="center">Servicio</MC.Text>
            )}
        </MC.Table.Th>
        <MC.Table.Th w={110}>
            {loading ? (
            <MC.Skeleton height={14} width="60%" radius="sm" />
            ) : (
            <MC.Text fw={600} ta="center">Acciones</MC.Text>
            )}
        </MC.Table.Th>
        </MC.Table.Tr>
    </MC.Table.Thead>

    <MC.Table.Tbody>
        {loading
        ? Array.from({ length: skeletonRows }).map((_, i) => (
            <MC.Table.Tr key={i}>
                <MC.Table.Td>
                <MC.Skeleton height={16} />
                </MC.Table.Td>
                <MC.Table.Td>
                <MC.Skeleton height={16} />
                </MC.Table.Td>
                <MC.Table.Td>
                <MC.Group justify="center" gap="xs">
                    <MC.Skeleton height={28} width={28} circle />
                    <MC.Skeleton height={28} width={28} circle />
                </MC.Group>
                </MC.Table.Td>
            </MC.Table.Tr>
            ))
        : rows.map((r) => (
            <MC.Table.Tr key={r.id}>
                <MC.Table.Td>{r.nombre}</MC.Table.Td>
                <MC.Table.Td>{r.servicio}</MC.Table.Td>
                <MC.Table.Td>
                <MC.Group justify="center" gap="xs">
                    <MC.ActionIcon
                    variant="light"
                    color="red"
                    aria-label="Eliminar"
                    onClick={() => onDelete?.(r.id)}
                    >
                    <IconX size={18} />
                    </MC.ActionIcon>
                </MC.Group>
                </MC.Table.Td>
            </MC.Table.Tr>
            ))}
    </MC.Table.Tbody>
    </MC.Table>
</MC.ScrollArea>
);
}
