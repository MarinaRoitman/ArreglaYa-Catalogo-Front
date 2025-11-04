import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
Paper,
Group,
Text,
Table,
ActionIcon,
Button,
Loader,
Tooltip,
Divider,
TextInput,
ScrollArea,
Center,
} from "@mantine/core";
import { IconPencil, IconTrash, IconRefresh, IconSearch, IconPlus } from "@tabler/icons-react";
import AppLayout from "../components/LayoutTrabajosPendientes";
import ConfirmDelete from "../components/ModalBorrar";
import { fetchZonas, deleteZona } from "../Api/zonas";
import ModalZona from "../components/ModalZona";

export default function AdminZonas() {
const [zonas, setZonas] = useState([]);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

const [query, setQuery] = useState("");

const [editOpen, setEditOpen] = useState(false);
const [current, setCurrent] = useState(null);

const [deleteOpen, setDeleteOpen] = useState(false);
const [deleteTarget, setDeleteTarget] = useState(null);
const [deleting, setDeleting] = useState(false);

const fetchAll = useCallback(async () => {
try {
    setErr("");
    setLoading(true);
    const data = await fetchZonas();
    setZonas(Array.isArray(data) ? data : []);
} catch (e) {
    console.error(e);
    setErr(e?.message || "No se pudieron cargar las zonas");
} finally {
    setLoading(false);
}
}, []);

useEffect(() => { fetchAll(); }, [fetchAll]);

const filtered = useMemo(() => {
const q = query.trim().toLowerCase();
if (!q) return zonas;
return zonas.filter((z) => String(z?.nombre ?? "").toLowerCase().includes(q));
}, [zonas, query]);

const onNew = () => {
setCurrent(null);
setEditOpen(true);
};

const onEdit = (row) => {
setCurrent(row);
setEditOpen(true);
};

const onDelete = (row) => {
setDeleteTarget(row);
setDeleteOpen(true);
};

const handleCancelDelete = () => {
setDeleteOpen(false);
setDeleteTarget(null);
};

const handleConfirmDelete = async () => {
if (!deleteTarget?.id) return;
try {
    setDeleting(true);
    await deleteZona(deleteTarget.id);
    await fetchAll();
    setDeleteOpen(false);
    setDeleteTarget(null);
} catch (e) {
    alert(e?.message || "No se pudo eliminar la zona");
} finally {
    setDeleting(false);
}
};

return (
<AppLayout>
    <Paper p="lg" radius="lg" shadow="xs" withBorder>
    <Group justify="space-between" align="flex-end" mb="xs" wrap="wrap">
        <div>
        <Text fw={600} fz="lg" lh={1.7}>Zonas</Text>
        <Text c="dimmed" fz="xs">
            Administrá las zonas que verán los usuarios.
        </Text>
        </div>

        <Group>
        <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Buscar por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            w={240}
        />

        <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={fetchAll}
        >
            Recargar
        </Button>

        <Button
            color="#93755E"
            leftSection={<IconPlus size={16} />}
            onClick={onNew}
        >
            Nueva
        </Button>
        </Group>
    </Group>

    <Divider my="md" />

    {loading ? (
        <Group justify="center" py="xl"><Loader /></Group>
    ) : err ? (
        <Text c="red">{err}</Text>
    ) : filtered.length === 0 ? (
        <Center py="xl">
        <Text c="dimmed" fz="sm">No hay zonas para mostrar.</Text>
        </Center>
    ) : (
        <ScrollArea>
        <Table
            striped
            highlightOnHover
            withTableBorder
            stickyHeader
            verticalSpacing="sm"
            horizontalSpacing="md"
        >
            <Table.Thead>
            <Table.Tr>
                <Table.Th fz="sm">Nombre de la zona</Table.Th>
                <Table.Th style={{ width: 120 }} fz="sm">Acciones</Table.Th>
            </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
            {filtered.map((z) => (
                <Table.Tr key={z.id}>
                <Table.Td>
                    <Text fw={400} fz="sm">{z.nombre}</Text>
                </Table.Td>
                <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                    <Tooltip label="Editar" withArrow>
                        <ActionIcon variant="subtle" color="blue" onClick={() => onEdit(z)}>
                        <IconPencil size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar" color="red" withArrow>
                        <ActionIcon variant="subtle" color="red" onClick={() => onDelete(z)}>
                        <IconTrash size={18} />
                        </ActionIcon>
                    </Tooltip>
                    </Group>
                </Table.Td>
                </Table.Tr>
            ))}
            </Table.Tbody>
        </Table>
        </ScrollArea>
    )}
    </Paper>

    <ConfirmDelete
    opened={deleteOpen}
    onCancel={handleCancelDelete}
    onConfirm={handleConfirmDelete}
    loading={deleting}
    />

    <ModalZona
    opened={editOpen}
    onClose={() => { setEditOpen(false); setCurrent(null); }}
    zona={current}
    zonas={zonas}
    onSaved={async () => {
        setEditOpen(false);
        setCurrent(null);
        await fetchAll();
    }}
    />
</AppLayout>
);
}
