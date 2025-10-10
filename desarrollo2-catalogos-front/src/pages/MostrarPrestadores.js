// src/pages/MostrarPrestadores.js
import React, { useEffect, useState, useCallback } from "react";
import * as MC from "@mantine/core";
import LayoutTrabajosPendientes from "../components/LayoutTrabajosPendientes";
import AdminPrestadoresTable from "../components/AdminPrestadoresTable";
import ConfirmDelete from "../components/ModalBorrar";
import EditPrestadorModal from "../components/EditPrestadorModal";
import ModalCambiarContrasena from "../components/ModalCambiarContrasena";

import {
getPrestadores,
getPrestadorById,
updatePrestador,
deletePrestador,
cambiarContrasena,
} from "../Api/prestadores";

import { listCalificaciones } from "../Api/calificacion";

import { getUsuarioById } from "../Api/usuarios";

export default function MostrarPrestadores() {
const [rows, setRows] = useState([]);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");
const [usersCache, setUsersCache] = useState(new Map()); 
const [authorsLoading, setAuthorsLoading] = useState(false);

// selección / modales
const [selected, setSelected] = useState(null);
const [editOpen, setEditOpen] = useState(false);
const [deleteOpen, setDeleteOpen] = useState(false);
const [pwdOpen, setPwdOpen] = useState(false);

// loading específicos
const [saving, setSaving] = useState(false);
const [deleting, setDeleting] = useState(false);
const [pwdSaving, setPwdSaving] = useState(false);
const [pwdError, setPwdError] = useState("");
const [pwdSuccessOpen, setPwdSuccessOpen] = useState(false);

// ⭐ destacado + reseñas
const [highlightedId, setHighlightedId] = useState(null);
const [reviewsByPrestador, setReviewsByPrestador] = useState(new Map());
const [reviewsOpen, setReviewsOpen] = useState(false);
const [reviewsLoading, setReviewsLoading] = useState(false);
const [currentReviews, setCurrentReviews] = useState([]); // reseñas del prestador seleccionado
const [reviewsOwner, setReviewsOwner] = useState(null);   // prestador seleccionado (para mostrar su nombre)

// saca el id del autor desde la review, contemplando variantes comunes
const extractUserId = (rev) =>
  rev?.id_usuario ?? rev?.usuario_id ?? rev?.usuario?.id ?? rev?.idUser ?? null;

// devuelve un nombre "lindo" a partir de un objeto usuario (por si tu API trae nombre+apellido)
const fullNameFromUser = (u) => {
  if (!u) return null;
  const n = [u?.nombre, u?.apellido].filter(Boolean).join(" ").trim();
  return n || u?.name || u?.username || null;
};

// pide el usuario y devuelve { id, name }
const fetchUserName = async (id) => {
  const data = await getUsuarioById(id);
  const name =
    fullNameFromUser(data) ||
    data?.nombreCompleto ||
    data?.email ||
    String(id);
  return { id: String(id), name };
};

// trae nombres faltantes y los cachea
const fetchAuthorsForReviews = async (reviews) => {
  const ids = Array.from(
    new Set(
      (reviews || [])
        .map(extractUserId)
        .filter((x) => x != null)
        .map(String)
    )
  );

  // filtrar solo los que no están ya en cache
  const missing = ids.filter((id) => !usersCache.has(id));
  if (!missing.length) return;

  setAuthorsLoading(true);
  try {
    const results = await Promise.allSettled(missing.map((id) => fetchUserName(id)));
    const next = new Map(usersCache);
    for (const r of results) {
      if (r.status === "fulfilled" && r.value?.id) {
        next.set(r.value.id, r.value.name);
      }
    }
    setUsersCache(next);
  } finally {
    setAuthorsLoading(false);
  }
};

const fetchRows = useCallback(async () => {
try {
    setErr("");
    setLoading(true);
    const data = await getPrestadores();

    const onlyActive = (Array.isArray(data) ? data : []).filter((p) => {
    const v = p?.activo;
    return v === 1 || v === true || v === "1" || v === "true";
    });

    const mapped = onlyActive.map((p) => {
    const nombreCompleto =
        `${p?.nombre ?? ""} ${p?.apellido ?? ""}`.trim() ||
        p?.nombreCompleto ||
        "-";
    const telefono = p?.telefono || p?.celular || p?.phone || "-";
    const direccion = p?.direccion || p?.domicilio || p?.address || "-";
    const dni = p?.dni || p?.documento || p?.document_number || "-";
    const email = p?.email || p?.mail || "-";

    let zonas = "-";
    if (Array.isArray(p?.zonas)) {
        zonas = p.zonas
        .map((z) => (typeof z === "string" ? z : z?.nombre || z?.zona || ""))
        .filter(Boolean);
    } else if (typeof p?.zonas === "string") zonas = p.zonas;
    else if (p?.zona) zonas = Array.isArray(p.zona) ? p.zona : String(p.zona);

    const canonicalId = p?.id ?? p?.ID ?? null;

    return {
        id: canonicalId,
        editable: canonicalId != null,
        nombre: p?.nombre ?? "",
        apellido: p?.apellido ?? "",
        nombreCompleto,
        telefono,
        direccion,
        zonas,
        dni,
        email,
    };
    });

    setRows(mapped);
} catch (e) {
    console.error("Error getPrestadores:", e);
    setErr(e?.message || "No se pudieron cargar los prestadores.");
} finally {
    setLoading(false);
}
}, []);

// agrupa calificaciones por id_prestador -> [califs]
const buildReviewsMap = (califs) => {
const map = new Map();
for (const c of Array.isArray(califs) ? califs : []) {
    // normalizo ids (número o string)
    const pid = c?.id_prestador ?? c?.prestador_id ?? c?.prestador ?? null;
    if (pid == null) continue;
    const key = String(pid);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(c);
}
return map;
};

const fetchCalificaciones = useCallback(async () => {
try {
    setReviewsLoading(true);
    const califs = await listCalificaciones();
    setReviewsByPrestador(buildReviewsMap(califs));
} catch (e) {
    console.error("Error listCalificaciones:", e);
    // si falla, dejamos el map vacío pero no rompemos la UI
    setReviewsByPrestador(new Map());
} finally {
    setReviewsLoading(false);
}
}, []);

useEffect(() => {
if (!localStorage.getItem("userName")) {
    localStorage.setItem("userName", "Admin");
}
// cargo prestadores y calificaciones en paralelo
fetchRows();
fetchCalificaciones();
}, [fetchRows, fetchCalificaciones]);

// ---------- Editar (abre modal, carga prestador) ----------
const handleEdit = async (row) => {
try {
    if (!row?.id) return;
    setErr("");
    setSelected(null);
    setEditOpen(true);

    const full = await getPrestadorById(row.id);
    setSelected(full || {});
} catch (e) {
    console.error("Error al cargar prestador:", e);
    setErr(e?.message || "No se pudo cargar el prestador seleccionado.");
    setEditOpen(false);
}
};

// ---------- Guardar edición ----------
const handleSaveEdit = async (formValues) => {
const id = selected?.id ?? selected?.ID ?? null;
if (!id) {
    setErr("No se pudo determinar el ID del prestador a actualizar.");
    return;
}
try {
    setSaving(true);
    setErr("");

    const payload = {
    nombre: formValues?.nombre?.trim(),
    apellido: formValues?.apellido?.trim(),
    email: formValues?.email?.trim(),
    telefono: formValues?.telefono?.trim(),
    direccion: formValues?.direccion?.trim(),
    dni: formValues?.dni?.trim(),
    };
    Object.keys(payload).forEach((k) => {
    if (payload[k] === "" || payload[k] == null) delete payload[k];
    });

    await updatePrestador(id, payload);

    setEditOpen(false);
    setSelected(null);
    await fetchRows();
} catch (e) {
    console.error("Error al actualizar prestador:", e);
    setErr(e?.message || "No se pudo actualizar el prestador.");
} finally {
    setSaving(false);
}
};

const handleCancelEdit = () => {
setEditOpen(false);
setSelected(null);
};

// ---------- Eliminar ----------
const handleDelete = (row) => {
setErr("");
setSelected({ id: row.id, nombreCompleto: row.nombreCompleto });
setDeleteOpen(true);
};

const confirmDelete = async () => {
const id = selected?.id ?? selected?.ID ?? null;
if (!id) return;
try {
    setDeleting(true);
    setErr("");
    await deletePrestador(id);
    setDeleteOpen(false);
    setSelected(null);
    await fetchRows();
    // podría refrescar calificaciones también si lo deseás
    // await fetchCalificaciones();
} catch (e) {
    console.error("Error al eliminar prestador:", e);
    setErr(e?.message || "No se pudo eliminar el prestador.");
} finally {
    setDeleting(false);
}
};

const cancelDelete = () => {
setDeleteOpen(false);
setSelected(null);
};

// ---------- Cambiar contraseña ----------
const openPasswordModal = () => setPwdOpen(true);
const closePasswordModal = () => {
setPwdOpen(false);
setPwdError("");
};

const handlePasswordChange = async (newPassword) => {
const id = selected?.id ?? selected?.ID ?? null;
if (!id) return;
setPwdSaving(true);
setPwdError("");
try {
    await cambiarContrasena(id, newPassword);
    setPwdOpen(false);
    setPwdSuccessOpen(true);
} catch (e) {
    setPwdError(e?.message || "Ocurrió un error al cambiar la contraseña.");
} finally {
    setPwdSaving(false);
}
};

// ---------- ⭐ Ver reseñas ----------
const handleRate = (row) => {
  if (!row?.id) return;
  const key = String(row.id);

  setHighlightedId((prev) => (prev === row.id ? null : row.id));
  setReviewsOwner(row);

  const list = reviewsByPrestador.get(key) ?? [];
  setCurrentReviews(list);


  fetchAuthorsForReviews(list);

  setReviewsOpen(true);
};


return (
<LayoutTrabajosPendientes>
    <MC.Box>
    <MC.Paper p="md" radius="lg" shadow="xs" withBorder>
        <MC.Group justify="space-between" mb="md" align="center">
        <MC.Title order={3} style={{ fontWeight: 600, margin: "0 auto" }}>
            Prestadores
        </MC.Title>
        <MC.Group gap="xs">
            <MC.Button
            variant="light"
            color="#8e7a6bff"
            size="xs"
            onClick={fetchRows}
            loading={loading}
            >
            Recargar prestadores
            </MC.Button>
        </MC.Group>
        </MC.Group>

        {err && (
        <MC.Alert color="red" mb="md" variant="light" title="Error">
            {err}
        </MC.Alert>
        )}

        {loading ? (
        <MC.LoadingOverlay visible zIndex={1000} overlayProps={{ radius: "lg", blur: 2 }} />
        ) : (
        <AdminPrestadoresTable
            rows={rows}
            onEdit={handleEdit}
            onRate={handleRate}           // <-- acá enganchamos la ⭐
            onDelete={handleDelete}
            highlightedId={highlightedId} // <-- para pintar la ⭐
        />
        )}
    </MC.Paper>
    </MC.Box>

    {/* Modal de edición */}
    <EditPrestadorModal
    opened={editOpen}
    loading={saving}
    initialData={selected}
    onCancel={handleCancelEdit}
    onSave={handleSaveEdit}
    onOpenPassword={openPasswordModal}
    />

    {/* Confirmación de borrado */}
    <ConfirmDelete
    opened={deleteOpen}
    onCancel={cancelDelete}
    onConfirm={confirmDelete}
    loading={deleting}
    />

    {/* Cambio de contraseña */}
    <ModalCambiarContrasena
    opened={pwdOpen}
    onClose={closePasswordModal}
    onSubmit={handlePasswordChange}
    loading={pwdSaving}
    error={pwdError}
    clearError={() => setPwdError("")}
    />

    {/* Éxito contraseña */}
    <MC.Modal
    opened={pwdSuccessOpen}
    onClose={() => setPwdSuccessOpen(false)}
    centered
    title={<MC.Text fw={600}>¡Éxito!</MC.Text>}
    >
    <MC.Stack align="center">
        <MC.Text>La contraseña se actualizó correctamente.</MC.Text>
        <MC.Button color="#93755E" onClick={() => setPwdSuccessOpen(false)} mt="md">
        Aceptar
        </MC.Button>
    </MC.Stack>
    </MC.Modal>

    {/* Modal de Reseñas */}
    <MC.Modal
    opened={reviewsOpen}
    onClose={() => setReviewsOpen(false)}
    size="lg"
    centered
    title={
        <MC.Group justify="space-between" w="100%">
        <MC.Text fw={700}>Reseñas</MC.Text>
        {reviewsOwner?.nombreCompleto && (
            <MC.Text c="dimmed" size="sm">
            {reviewsOwner.nombreCompleto}
            </MC.Text>
        )}
        </MC.Group>
    }
    >
    {reviewsLoading ? (
        <MC.LoadingOverlay visible />
    ) : currentReviews?.length ? (
        <MC.Stack gap="md">
        {currentReviews.map((rev, idx) => {
            const comentario = rev?.comentario ?? rev?.comentarios ?? rev?.descripcion ?? "";
            const fecha = rev?.fecha ?? rev?.created_at ?? rev?.fecha_calificacion ?? null;
            const estrellas = Number(
            rev?.estrellas ?? rev?.puntuacion ?? rev?.rating ?? 0
            );
            const userId = extractUserId(rev);
            const autorNameFromObj = rev?.usuario?.nombre || rev?.autor || null; // por si viene embebido
            const autor =
                (userId != null && usersCache.get(String(userId))) ||
                autorNameFromObj ||
                (userId != null ? `Usuario #${userId}` : null);

            return (
                <MC.Paper key={rev?.id ?? idx} withBorder radius="md" p="md">
                <MC.Group justify="space-between" align="center" mb="xs">
                    <MC.Rating
                        readOnly
                        value={isNaN(estrellas) ? 0 : estrellas}
                        fractions={10}        // soporta 0.1 en 0..5
                        color="yellow"        // color visible
                        size="md"
                        />
                    {fecha && (
                    <MC.Text size="xs" c="dimmed">
                        {new Date(fecha).toLocaleString()}
                    </MC.Text>
                    )}
                </MC.Group>

                {autor && (
                    <MC.Text size="sm" fw={500} mb={4}>
                    {autor}
                    {authorsLoading && (
                        <MC.Loader size="xs" ml="xs" style={{ display: "inline-block", verticalAlign: "middle" }} />
                    )}
                    </MC.Text>
                )}

                <MC.Text size="sm">{comentario || <i>Sin comentario</i>}</MC.Text>
                </MC.Paper>
            );
            })}
        </MC.Stack>
    ) : (
        <MC.Alert color="gray" variant="light" title="Sin reseñas">
        Este prestador todavía no tiene reseñas.
        </MC.Alert>
    )}
    </MC.Modal>
</LayoutTrabajosPendientes>
);
}
