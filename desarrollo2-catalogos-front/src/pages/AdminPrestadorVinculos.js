import React, { useEffect, useMemo, useState, useCallback } from "react";
import * as MC from "@mantine/core";
import {
IconLink,
IconPlus,
IconUnlink,
IconPencil,
IconAlertCircle,
} from "@tabler/icons-react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BareModal from "../components/BareModal";

import {
getPrestadores,
getPrestadorById,
addHabilidadToPrestador,
removeHabilidadFromPrestador,
} from "../Api/prestadores";

import {
listHabilidades,
createHabilidad,
updateHabilidad,
} from "../Api/habilidades";

import { listRubros } from "../Api/rubros";

const norm = (v) => (v == null ? "" : String(v)).trim();

// Reutilizable para que los Select abran por encima del modal
const comboFix = {
comboboxProps: {
withinPortal: true,
zIndex: 6000,
portalProps: { target: document.getElementById("modal-root") || document.body },
},
};

// (ignora mayúsculas, acentos y espacios extras)
const canon = (v) =>
(v == null ? "" : String(v))
.trim()
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "") // quita acentos
.replace(/\s+/g, " "); // colapsa espacios

export default function AdminPrestadorVinculos() {
const [opened, setOpened] = useState(false);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

const [prestadores, setPrestadores] = useState([]);
const [prestadorId, setPrestadorId] = useState(null);
const [prestador, setPrestador] = useState(null);

const [habilidadesAll, setHabilidadesAll] = useState([]);
const [rubros, setRubros] = useState([]);
const rubrosMap = useMemo(
() => new Map(rubros.map((r) => [String(r.id), r.nombre])),
[rubros]
);

// Modales
const [linkModalOpen, setLinkModalOpen] = useState(false);
const [createModalOpen, setCreateModalOpen] = useState(false);
const [editModalOpen, setEditModalOpen] = useState(false);
const [confirmUnlink, setConfirmUnlink] = useState({ open: false, hab: null });

// Formularios
const [selectedHabIdToLink, setSelectedHabIdToLink] = useState(null);
const [createForm, setCreateForm] = useState({ nombre: "", descripcion: "", id_rubro: "" });
const [editForm, setEditForm] = useState({ id: "", nombre: "", descripcion: "", id_rubro: "" });

// 👇 Nuevo: touched y submit-attempt flags
const [createTouched, setCreateTouched] = useState({ nombre: false, descripcion: false, id_rubro: false });
const [createTried, setCreateTried] = useState(false);

const [editTouched, setEditTouched] = useState({ nombre: false, descripcion: false, id_rubro: false });
const [editTried, setEditTried] = useState(false);

const [originalEdit, setOriginalEdit] = useState(null);

// --------- CARGAS ----------
useEffect(() => {
const load = async () => {
    try {
    setLoading(true);
    setErr("");
    const [pres, habs, rubs] = await Promise.all([
        getPrestadores(),
        listHabilidades(),
        listRubros(),
    ]);
    setPrestadores(pres || []);
    setHabilidadesAll(habs || []);
    setRubros(rubs || []);
    } catch (e) {
    setErr(e?.message || "Error cargando datos");
    } finally {
    setLoading(false);
    }
};
load();
}, []);

const fetchPrestador = useCallback(async (id) => {
if (!id) return;
setLoading(true);
setErr("");
try {
    const data = await getPrestadorById(id);
    setPrestador(data);
} catch (e) {
    setErr(e?.message || "Error al traer prestador");
} finally {
    setLoading(false);
}
}, []);

useEffect(() => {
if (prestadorId) fetchPrestador(prestadorId);
}, [prestadorId, fetchPrestador]);

// --------- DERIVADOS ----------
const prestadoresOptions = useMemo(
() =>
    (prestadores || []).map((p) => ({
    value: String(p.id),
    label: p.nombreCompleto || p.nombre || `Prestador #${p.id}`,
    })),
[prestadores]
);

const linkedHabs = useMemo(() => prestador?.habilidades || [], [prestador]);

const unlinkedHabOptions = useMemo(() => {
const linkedIds = new Set(linkedHabs.map((h) => String(h.id)));
return (habilidadesAll || [])
    .filter((h) => !linkedIds.has(String(h.id)))
    .map((h) => ({
    value: String(h.id),
    label: `${h.nombre} — ${rubrosMap.get(String(h.id_rubro)) || "Sin rubro"}`,
    }));
}, [habilidadesAll, linkedHabs, rubrosMap]);

const existingNames = useMemo(() => {
const s = new Set();
(habilidadesAll || []).forEach((h) => s.add(canon(h?.nombre)));
return s;
}, [habilidadesAll]);

// CREATE validations
const createNombreCanon = canon(createForm.nombre);
const createDescripcionOk = canon(createForm.descripcion).length > 0;
const createNombreOk = createNombreCanon.length > 0;
const createRubroOk = !!createForm.id_rubro;
const createIsDuplicate = existingNames.has(createNombreCanon);

const canCreateLink =
!!prestadorId && createNombreOk && createDescripcionOk && createRubroOk && !createIsDuplicate;

const showCreateNombreError = (createTouched.nombre || createTried) && (!createNombreOk || createIsDuplicate);
const showCreateDescError   = (createTouched.descripcion || createTried) && !createDescripcionOk;
const showCreateRubroError  = (createTouched.id_rubro || createTried) && !createRubroOk;

// EDIT validations
const editNombreCanon = canon(editForm.nombre);
const editNombreOk = editNombreCanon.length > 0;
const editDescripcionOk = canon(editForm.descripcion).length > 0;
const editRubroOk = !!editForm.id_rubro;

const editIsDuplicate = useMemo(() => {
if (!editForm.id) return false;
const currentId = String(editForm.id);
return (habilidadesAll || []).some(
    (h) => String(h.id) !== currentId && canon(h.nombre) === editNombreCanon
);
}, [habilidadesAll, editForm.id, editNombreCanon]);

const isChanged = useMemo(() => {
if (!originalEdit) return false;
return (
    canon(editForm.nombre) !== canon(originalEdit.nombre) ||
    canon(editForm.descripcion) !== canon(originalEdit.descripcion) ||
    String(editForm.id_rubro || "") !== String(originalEdit.id_rubro || "")
);
}, [editForm, originalEdit]);

const canSaveEdit =
editNombreOk && editDescripcionOk && editRubroOk && isChanged && !editIsDuplicate;

const showEditNombreError = (editTouched.nombre || editTried) && (!editNombreOk || editIsDuplicate);
const showEditDescError   = (editTouched.descripcion || editTried) && !editDescripcionOk;
const showEditRubroError  = (editTouched.id_rubro || editTried) && !editRubroOk;

// --------- ACCIONES ----------
const reloadHabilidadesAll = async () => {
try {
    const habs = await listHabilidades();
    setHabilidadesAll(habs || []);
} catch {}
};

const handleLinkExisting = async () => {
if (!prestadorId || !selectedHabIdToLink) return;
setErr("");
setLoading(true);
try {
    await addHabilidadToPrestador(prestadorId, Number(selectedHabIdToLink));
    await fetchPrestador(prestadorId);
    setSelectedHabIdToLink(null);
    setLinkModalOpen(false);
} catch (e) {
    setErr(e?.message || "No se pudo vincular la habilidad");
} finally {
    setLoading(false);
}
};

const handleCreateAndLink = async () => {
const { nombre, descripcion, id_rubro } = createForm;
const nombreOk = canon(nombre).length > 0;
const descOk = canon(descripcion).length > 0;
const rubroOk = !!id_rubro;

if (!prestadorId || !nombreOk || !descOk || !rubroOk) {
    setErr("Completá todos los campos obligatorios.");
    return;
}
if (existingNames.has(canon(nombre))) {
    setErr("Ya existe una habilidad con ese nombre.");
    return;
}

setErr("");
setLoading(true);
try {
    const nueva = await createHabilidad({
    nombre: norm(nombre),
    descripcion: norm(descripcion),
    id_rubro: Number(id_rubro),
    });
    await addHabilidadToPrestador(prestadorId, Number(nueva.id));
    await Promise.all([fetchPrestador(prestadorId), reloadHabilidadesAll()]);
    setCreateForm({ nombre: "", descripcion: "", id_rubro: "" });
    setCreateTouched({ nombre: false, descripcion: false, id_rubro: false });
    setCreateTried(false);
    setCreateModalOpen(false);
} catch (e) {
    setErr(e?.message || "No se pudo crear/vincular la habilidad");
} finally {
    setLoading(false);
}
};

const openEdit = (hab) => {
setEditForm({
    id: hab.id,
    nombre: hab.nombre || "",
    descripcion: hab.descripcion || "",
    id_rubro: hab.id_rubro ? String(hab.id_rubro) : "",
});
setOriginalEdit({
    nombre: hab.nombre || "",
    descripcion: hab.descripcion || "",
    id_rubro: hab.id_rubro ? String(hab.id_rubro) : "",
});
setEditTouched({ nombre: false, descripcion: false, id_rubro: false });
setEditTried(false);
setEditModalOpen(true);
};

const handleEditSave = async () => {
const { id, nombre, descripcion, id_rubro } = editForm;
if (!id) return;
const nombreOk = canon(nombre).length > 0;
const descOk = canon(descripcion).length > 0;
const rubroOk = !!id_rubro;

if (!nombreOk || !descOk || !rubroOk) {
    setErr("Completá los campos obligatorios.");
    return;
}
const dup = (habilidadesAll || []).some(
    (h) => String(h.id) !== String(id) && canon(h.nombre) === canon(nombre)
);
if (dup) {
    setErr("Ya existe otra habilidad con ese nombre.");
    return;
}
// si no hubo cambios, no llames al backend
if (
    originalEdit &&
    canon(nombre) === canon(originalEdit.nombre) &&
    canon(descripcion) === canon(originalEdit.descripcion) &&
    String(id_rubro || "") === String(originalEdit.id_rubro || "")
) {
    return; // no-op
}

setErr("");
setLoading(true);
try {
    await updateHabilidad(Number(id), {
    nombre: norm(nombre),
    descripcion: norm(descripcion),
    id_rubro: Number(id_rubro),
    });
    await Promise.all([fetchPrestador(prestadorId), reloadHabilidadesAll()]);
    setEditTouched({ nombre: false, descripcion: false, id_rubro: false });
    setEditTried(false);
    setEditModalOpen(false);
} catch (e) {
    setErr(e?.message || "No se pudo actualizar la habilidad");
} finally {
    setLoading(false);
}
};

const handleUnlink = async () => {
const hab = confirmUnlink.hab;
if (!hab) return;
setErr("");
setLoading(true);
try {
    await removeHabilidadFromPrestador(prestadorId, Number(hab.id));
    await fetchPrestador(prestadorId);
    setConfirmUnlink({ open: false, hab: null });
} catch (e) {
    setErr(e?.message || "No se pudo desvincular la habilidad");
} finally {
    setLoading(false);
}
};

// --------- RENDER ----------
return (
<MC.AppShell
    header={{ height: 60 }}
    navbar={{ width: 280, breakpoint: "sm", collapsed: { mobile: !opened } }}
    padding="md"
>
    <MC.AppShell.Header>
    <Header opened={opened} toggle={() => setOpened((o) => !o)} />
    </MC.AppShell.Header>

    <MC.AppShell.Navbar>
    <Sidebar />
    </MC.AppShell.Navbar>

    <MC.AppShell.Main>
    <MC.LoadingOverlay visible={loading} zIndex={1000} />

    <MC.Stack gap="md">
        <MC.Paper p="md" radius="lg" withBorder>
        <MC.Group justify="center" align="center">
        <MC.Title order={2} fw={600} fz="xl" lh={2.5}>Vínculos de Prestador</MC.Title>
        {prestador && (
            <MC.Badge size="lg" variant="light" color="#b67747ff">
            {prestador?.nombreCompleto || prestador?.nombre || `Prestador #${prestador?.id}`}
            </MC.Badge>
        )}
        </MC.Group>

        {!!err && (
        <MC.Alert
            color="red"
            icon={<IconAlertCircle size={18} />}
            variant="light"
            withCloseButton
            onClose={() => setErr("")}
        >
            {err}
        </MC.Alert>
        )}

        {/* Solo combo de prestadores */}
        <MC.Paper p="md" radius="lg" withBorder>
        <MC.Select
            {...comboFix}
            data={prestadoresOptions}
            value={prestadorId ? String(prestadorId) : null}
            onChange={(v) => setPrestadorId(v ? Number(v) : null)}
            label={<span style={{ fontWeight: 640 }}>Seleccioná un prestador</span>}
            placeholder="Elegí uno…"
            searchable
            nothingFoundMessage="Sin resultados"
            leftSection={<IconLink size={16} />}
        />
        </MC.Paper>

        {/* Habilidades vinculadas */}
        <MC.Paper p="md" radius="lg" withBorder mt="md">
        <MC.Group justify="space-between" mb="sm">
            <MC.Title size={15} fw={640}>Habilidades vinculadas</MC.Title>

            <MC.Group gap="xs">
            <MC.Button
                leftSection={<IconPlus size={18} />}
                variant="light"
                color="#b67747ff"
                onClick={() => setLinkModalOpen(true)}
                disabled={!prestadorId}
            >
                Vincular existente
            </MC.Button>
            <MC.Button
                leftSection={<IconPlus size={18} />}
                variant="filled"
                color="#93755E"
                onClick={() => setCreateModalOpen(true)}
                disabled={!prestadorId}
            >
                Crear & Vincular
            </MC.Button>
            </MC.Group>
        </MC.Group>

        {(!prestadorId || linkedHabs.length === 0) && (
            <MC.Alert variant="light" color="gray">
            {prestadorId
                ? "Este prestador aún no tiene habilidades vinculadas."
                : "Elegí un prestador para ver sus habilidades."}
            </MC.Alert>
        )}

        {prestadorId && linkedHabs.length > 0 && (
            <MC.Table striped highlightOnHover withRowBorders={false} verticalSpacing="sm">
            <MC.Table.Thead>
                <MC.Table.Tr >
                <MC.Table.Th style={{textAlign: "center" }}>Habilidad</MC.Table.Th>
                <MC.Table.Th style={{textAlign: "center" }}>Rubro/Servicio</MC.Table.Th>
                <MC.Table.Th style={{textAlign: "center" }}>Descripción</MC.Table.Th>
                <MC.Table.Th style={{ width: 120, textAlign: "right" }}>
                    Acciones
                </MC.Table.Th>
                </MC.Table.Tr>
            </MC.Table.Thead>
            <MC.Table.Tbody>
                {linkedHabs.map((h) => (
                <MC.Table.Tr key={h.id}>
                    <MC.Table.Td>
                    <MC.Text fw={500 }fz="sm">{h.nombre}</MC.Text>
                    </MC.Table.Td>
                    <MC.Table.Td>
                    <MC.Badge variant="dot" color="#b67747ff">
                        {rubrosMap.get(String(h.id_rubro)) || "Sin rubro"}
                    </MC.Badge>
                    </MC.Table.Td>
                    <MC.Table.Td>
                    <MC.Text size="sm" c="dimmed" lineClamp={2}>
                        {h.descripcion || "—"}
                    </MC.Text>
                    </MC.Table.Td>
                    <MC.Table.Td>
                    <MC.Group justify="end" gap="xs" wrap="nowrap">
                        <MC.ActionIcon
                        variant="subtle"
                        title="Editar habilidad"
                        onClick={() => openEdit(h)}
                        >
                        <IconPencil size={18} />
                        </MC.ActionIcon>
                        <MC.ActionIcon
                        color="orange"
                        variant="subtle"
                        title="Desvincular del prestador"
                        onClick={() => setConfirmUnlink({ open: true, hab: h })}
                        >
                        <IconUnlink size={18} />
                        </MC.ActionIcon>
                    </MC.Group>
                    </MC.Table.Td>
                </MC.Table.Tr>
                ))}
            </MC.Table.Tbody>
            </MC.Table>
        )}
        </MC.Paper>
        </MC.Paper>
    </MC.Stack>

    {/* ====== MODALES CUSTOM ====== */}

    {/* Vincular existente */}
    <BareModal
        opened={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Vincular habilidad existente"
        width={520}
    >
        <MC.Stack>
        <MC.Select
            {...comboFix}
            label="Habilidad"
            placeholder="Elegí una habilidad"
            searchable
            data={unlinkedHabOptions}
            value={selectedHabIdToLink}
            onChange={setSelectedHabIdToLink}
            nothingFoundMessage="No hay habilidades disponibles"
        />
        <MC.Group justify="end" mt="xs">
            <MC.Button variant="default" onClick={() => setLinkModalOpen(false)}>
            Cancelar
            </MC.Button>
            <MC.Button
            color="#b67747ff"
            onClick={handleLinkExisting}
            disabled={!selectedHabIdToLink}
            >
            Vincular
            </MC.Button>
        </MC.Group>
        </MC.Stack>
    </BareModal>

    {/* Crear & Vincular */}
    <BareModal
        opened={createModalOpen}
        onClose={() => {
        setCreateModalOpen(false);
        setCreateTried(false);
        setCreateTouched({ nombre: false, descripcion: false, id_rubro: false });
        }}
        title="Crear nueva habilidad y vincular"
        width={560}
    >
        <MC.Stack>
        <MC.TextInput
            label="Nombre *"
            placeholder="Ej.: Electricista matriculado"
            value={createForm.nombre}
            onChange={(e) => setCreateForm((f) => ({ ...f, nombre: e.currentTarget.value }))}
            onBlur={() => setCreateTouched((t) => ({ ...t, nombre: true }))}
            error={
            showCreateNombreError
                ? (!createNombreOk
                    ? "El nombre es obligatorio"
                    : createIsDuplicate
                    ? "Ya existe una habilidad con este nombre"
                    : null)
                : null
            }
        />

        <MC.Textarea
            label="Descripción *"
            placeholder="Escribí una breve descripción"
            autosize
            minRows={2}
            value={createForm.descripcion}
            onChange={(e) => setCreateForm((f) => ({ ...f, descripcion: e.currentTarget.value }))}
            onBlur={() => setCreateTouched((t) => ({ ...t, descripcion: true }))}
            error={showCreateDescError ? "La descripción es obligatoria" : null}
        />

        <MC.Select
            {...comboFix}
            label="Rubro / Servicio *"
            placeholder="Elegí un rubro"
            data={rubros.map((r) => ({ value: String(r.id), label: r.nombre }))}
            value={createForm.id_rubro}
            onChange={(v) => setCreateForm((f) => ({ ...f, id_rubro: v || "" }))}
            onBlur={() => setCreateTouched((t) => ({ ...t, id_rubro: true }))}
            searchable
            error={showCreateRubroError ? "El rubro es obligatorio" : null}
        />

        <MC.Group justify="end" mt="xs">
            <MC.Button
            variant="default"
            onClick={() => {
                setCreateModalOpen(false);
                setCreateTried(false);
                setCreateTouched({ nombre: false, descripcion: false, id_rubro: false });
            }}
            >
            Cancelar
            </MC.Button>
            <MC.Button
            color="#b67747ff"
            disabled={!canCreateLink}
            onClick={() => {
                if (!canCreateLink) {
                setCreateTried(true);
                return;
                }
                handleCreateAndLink();
            }}
            >
            Crear & Vincular
            </MC.Button>
        </MC.Group>
        </MC.Stack>
    </BareModal>

    {/* Editar habilidad */}
    <BareModal
        opened={editModalOpen}
        onClose={() => {
        setEditModalOpen(false);
        setEditTried(false);
        setEditTouched({ nombre: false, descripcion: false, id_rubro: false });
        }}
        title="Editar habilidad"
        width={560}
    >
        <MC.Stack>
        <MC.TextInput
            label="Nombre *"
            value={editForm.nombre}
            onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.currentTarget.value }))}
            onBlur={() => setEditTouched((t) => ({ ...t, nombre: true }))}
            error={
            showEditNombreError
                ? (!editNombreOk
                    ? "El nombre es obligatorio"
                    : editIsDuplicate
                    ? "Ya existe otra habilidad con este nombre"
                    : null)
                : null
            }
        />
        <MC.Textarea
            label="Descripción *"
            autosize
            minRows={2}
            value={editForm.descripcion}
            onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.currentTarget.value }))}
            onBlur={() => setEditTouched((t) => ({ ...t, descripcion: true }))}
            error={showEditDescError ? "La descripción es obligatoria" : null}
        />
        <MC.Select
            {...comboFix}
            label="Rubro / Servicio *"
            data={rubros.map((r) => ({ value: String(r.id), label: r.nombre }))}
            value={editForm.id_rubro}
            onChange={(v) => setEditForm((f) => ({ ...f, id_rubro: v || "" }))}
            onBlur={() => setEditTouched((t) => ({ ...t, id_rubro: true }))}
            searchable
            error={showEditRubroError ? "El rubro es obligatorio" : null}
        />

        <MC.Group justify="end" mt="xs">
            <MC.Button
            variant="default"
            onClick={() => {
                setEditModalOpen(false);
                setEditTried(false);
                setEditTouched({ nombre: false, descripcion: false, id_rubro: false });
            }}
            >
            Cancelar
            </MC.Button>
            <MC.Button
            color="#b67747ff"
            disabled={!canSaveEdit}
            onClick={() => {
                if (!canSaveEdit) {
                setEditTried(true);
                return;
                }
                handleEditSave();
            }}
            >
            Guardar cambios
            </MC.Button>
        </MC.Group>
        </MC.Stack>
    </BareModal>

    {/* Confirmar desvincular */}
    <BareModal
        opened={confirmUnlink.open}
        onClose={() => setConfirmUnlink({ open: false, hab: null })}
        title="Desvincular habilidad"
        width={520}
    >
        <MC.Stack>
        <MC.Text>
            ¿Seguro que querés <strong>desvincular</strong> la habilidad{" "}
            <em>{confirmUnlink.hab?.nombre}</em> de este prestador?
        </MC.Text>
        <MC.Group justify="end">
            <MC.Button
            variant="default"
            onClick={() => setConfirmUnlink({ open: false, hab: null })}
            >
            Cancelar
            </MC.Button>
            <MC.Button color="orange" leftSection={<IconUnlink size={16} />} onClick={handleUnlink}>
            Desvincular
            </MC.Button>
        </MC.Group>
        </MC.Stack>
    </BareModal>
    </MC.AppShell.Main>
</MC.AppShell>
);
}
