import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
Paper, Group, Text, Table, ActionIcon, Button, Loader, Tooltip,
Divider, TextInput, ScrollArea, Center, Alert,
} from "@mantine/core";
import { IconPencil, IconTrash, IconRefresh, IconPlus, IconSearch, IconAlertCircle } from "@tabler/icons-react";
import AppLayout from "../components/LayoutTrabajosPendientes";
import { listHabilidades, createHabilidad, updateHabilidad, deleteHabilidad } from "../Api/habilidades";
import { listRubros } from "../Api/rubros";
import ModalHabilidadAdmin from "../components/ModalHabilidadAdmin";
import ConfirmDelete from "../components/ModalBorrar";

export default function AdminHabilidades() {
const [habilidades, setHabilidades] = useState([]);
const [rubrosOpts, setRubrosOpts] = useState([]);   // [{value,label}]
const [rubrosMap, setRubrosMap] = useState(new Map()); // id(string) -> nombre
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

// filtros
const [q, setQ] = useState("");
const [rubroFilter] = useState("");

// modal
const [open, setOpen] = useState(false);
const [editing, setEditing] = useState(null);
const [confirmOpen, setConfirmOpen] = useState(false);
const [deleting, setDeleting] = useState(null); 


const buildRubrosMap = (opts) => {
const m = new Map();
(opts || []).forEach(o => m.set(String(o.value), o.label));
return m;
// value debe ser string; si tu API usa number, usa String(id) siempre
};

const fetchAll = useCallback(async () => {
  try {
    setErr("");
    setLoading(true);

    const [habs, rubros] = await Promise.all([
      listHabilidades(),
      listRubros()
    ]);

    const opts = (rubros || []).map(r => ({
      value: String(r.id),
      label: r.nombre
    }));

    const activas = Array.isArray(habs)
      ? habs.filter(h => h.activo === true)
      : [];

    setHabilidades(activas);
    setRubrosOpts(opts);
    setRubrosMap(buildRubrosMap(opts));

  } catch (e) {
    console.error(e);
    setErr(e?.message || "No se pudieron cargar habilidades/rubros");
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => { fetchAll(); }, [fetchAll]);

const filtered = useMemo(() => {
const byText = (h) => String(h?.nombre ?? "").toLowerCase().includes(q.trim().toLowerCase());
const byRubro = (h) => {
    const rid = String(h?.id_rubro ?? h?.rubro?.id ?? "");
    return rubroFilter ? rid === rubroFilter : true;
};
return (habilidades || []).filter(h => byText(h) && byRubro(h));
}, [habilidades, q, rubroFilter]);

const resolveRubroNombre = (h) => {
// primero intenta por objeto
const directo = h?.nombre_rubro ?? h?.rubro?.nombre;
if (directo) return directo;
// si no viene, resolvemos por id
const rid = String(h?.id_rubro ?? h?.rubro?.id ?? "");
return rubrosMap.get(rid) || "—";
};

const onCreate = () => { setEditing(null); setOpen(true); };

const onDelete = (row) => {
  setDeleting(row);
  setConfirmOpen(true);
};

const confirmDelete = async () => {
  if (!deleting?.id) return;
  try {
    setLoading(true);
    setErr("");
    await deleteHabilidad(deleting.id);
    setConfirmOpen(false);
    setDeleting(null);
    await fetchAll();
  } catch (e) {
    setErr(e?.message || "No se pudo eliminar la habilidad");
  } finally {
    setLoading(false);
  }
};

const handleSave = async (payload) => {
  try {
    setErr("");
    setLoading(true);

    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([k, v]) => v !== undefined && v !== null)
    );

    if (editing) await updateHabilidad(editing.id, cleanPayload);
    else await createHabilidad(cleanPayload);

    setOpen(false);
    setEditing(null);
    await fetchAll();

  } catch (e) {
    setErr(e?.message || "No se pudo guardar la habilidad");
  } finally {
    setLoading(false);
  }
};



return (
<AppLayout>
    <Paper p="lg" radius="lg" shadow="xs" withBorder>
    <Group justify="space-between" align="flex-end" mb="xs" wrap="wrap">
        <div>
        <Text fw={600} fz="lg" lh={2}>Habilidades</Text>
        <Text c="dimmed" fz="sm">Listá, creá, editá o eliminá habilidades de Prestadores.</Text>
        </div>
        <Group>
        <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Buscar por nombre…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            w={220}
        />

        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={fetchAll}>
            Recargar
        </Button>
        <Button leftSection={<IconPlus size={16} />} onClick={onCreate} color="#93755E">
            Nuevo
        </Button>
        </Group>
    </Group>

    {err && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mt="sm" mb="sm">
        {err}
        </Alert>
    )}

    <Divider my="md" />

    {loading ? (
        <Group justify="center" py="xl"><Loader /></Group>
    ) : filtered.length === 0 ? (
        <Center py="xl">
        <Text c="dimmed">No hay habilidades para mostrar.</Text>
        </Center>
    ) : (
        <ScrollArea>
        <Table striped highlightOnHover withTableBorder stickyHeader verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
            <Table.Tr>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Rubro</Table.Th>
                <Table.Th>Descripción</Table.Th>
                <Table.Th style={{ width: 120 }}>Acciones</Table.Th>
            </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
            {filtered.map((h) => (
                <Table.Tr key={h.id}>
                <Table.Td><Text fw={400} fz="sm">{h.nombre}</Text></Table.Td>
                <Table.Td>{resolveRubroNombre(h)}</Table.Td>
                <Table.Td style={{ maxWidth: 520, whiteSpace: "pre-wrap" }}>
                    {h.descripcion || "—"}
                </Table.Td>
                <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                    <Tooltip label="Editar" withArrow>
                        <ActionIcon variant="subtle" color="blue" onClick={() => { setEditing(h); setOpen(true); }}>
                        <IconPencil size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar" color="red" withArrow>
                        <ActionIcon variant="subtle" color="red" onClick={() => onDelete(h)}>
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

    <ModalHabilidadAdmin
    opened={open}
    onClose={() => { setOpen(false); setEditing(null); }}
    onSubmit={handleSave}
    rubrosOpts={rubrosOpts}
    defaultValues={editing ? {
        nombre: editing.nombre || "",
        descripcion: editing.descripcion || "",
        id_rubro: String(editing.id_rubro ?? editing.rubro?.id ?? ""),
    } : undefined}
    mode={editing ? "edit" : "create"}
    />

<ConfirmDelete
    opened={confirmOpen}
    onCancel={() => { setConfirmOpen(false); setDeleting(null); }}
    onConfirm={confirmDelete}
    loading={loading}
/>

</AppLayout>
);
}
