import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Text,
  Group,
  Grid,
  TextInput,
  Button,
  Divider,
  Rating,
  Avatar,
  LoadingOverlay,
  Modal,
  Alert,
  Stack, 
} from "@mantine/core";
import { IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom"; 
import AppLayout from "../components/LayoutTrabajosPendientes";
import Select from "react-select";
import { fetchZonas } from "../Api/zonas";
import {
getPrestadorById,
updatePrestador,
cambiarContrasena,
addZonaToPrestador,
removeZonaFromPrestador,
} from "../Api/prestadores";
import ModalCambiarContrasena from '../components/ModalCambiarContrasena';
import { listCalificaciones } from "../Api/calificacion";
import { getUsuarioById } from "../Api/usuarios";

// utilidades de comparación
const norm = (v) =>
typeof v === "string" ? v.trim() : v == null ? "" : String(v);
const shallowEqualForm = (a, b, keys) =>
keys.every((k) => norm(a?.[k]) === norm(b?.[k]));
const sameIdSets = (arrA, arrB) => {
const A = [...new Set(arrA)].sort((x, y) => x - y);
const B = [...new Set(arrB)].sort((x, y) => x - y);
if (A.length !== B.length) return false;
for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return false;
return true;
};

export default function Perfil() {
const [reviews, setReviews] = useState([]);
const navigate = useNavigate(); 
const [zonas, setZonas] = useState([]);
const [zonasSeleccionadas, setZonasSeleccionadas] = useState([]);
const [form, setForm] = useState({
nombre: "",
apellido: "",
email: "",
direccion: "",
telefono: "",
dni: "",
});

const [originalForm, setOriginalForm] = useState(null);
const [originalZonasIds, setOriginalZonasIds] = useState([]);
const [habilidades, setHabilidades] = useState([]);
const [filtro, setFiltro] = useState("");

const [passwordModalOpen, setPasswordModalOpen] = useState(false);
const [passwordSaving, setPasswordSaving] = useState(false);
const [passwordError, setPasswordError] = useState('');
const [passwordSuccessOpen, setPasswordSuccessOpen] = useState(false);

const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [successOpen, setSuccessOpen] = useState(false);
const [error, setError] = useState("");
const [bajaOpen, setBajaOpen] = useState(false); // modal de baja

useEffect(() => {
const load = async () => {
    try {
    setLoading(true);
    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("No se encontró prestador_id");

    const [zonasRes, prestador, calificaciones] = await Promise.all([
        fetchZonas(),
        getPrestadorById(prestadorId),
        listCalificaciones(),
    ]);

    setZonas(zonasRes.map((z) => ({ value: z.id, label: z.nombre })));

    const nextForm = {
        nombre: prestador.nombre || "",
        apellido: prestador.apellido || "",
        email: prestador.email || "",
        direccion: prestador.direccion || "",
        telefono: prestador.telefono || "",
        dni: prestador.dni || "",
    };
    setForm(nextForm);
    setOriginalForm(nextForm);

    const prestadorZonas = (prestador.zonas || []).map((z) => ({
        value: z.id,
        label: z.nombre,
    }));
    setZonasSeleccionadas(prestadorZonas);
    setOriginalZonasIds(prestadorZonas.map((z) => z.value));

    setHabilidades(prestador.habilidades || []);

    const calificacionesPrestador = calificaciones.filter(
        (c) => String(c.id_prestador) === String(prestadorId)
    );

    const reviewsConUsuarios = await Promise.all(
        calificacionesPrestador.map(async (c) => {
        try {
            const usuario = await getUsuarioById(c.id_usuario);
            return {
            ...c,
            nombre_usuario: `${usuario?.nombre || "Usuario"} ${
                usuario?.apellido || ""
            }`.trim(),
            };
        } catch {
            return { ...c, nombre_usuario: `Usuario #${c.id_usuario}` };
        }
        })
    );

    setReviews(reviewsConUsuarios);
    } catch (err) {
    setError(err.message || "Error al cargar el perfil");
    } finally {
    setLoading(false);
    }
};
load();
}, []);

const handleChange = (key) => (e) => {
const val = e?.target ? e.target.value : e;
setForm((prev) => ({ ...prev, [key]: val }));
};

const formKeys = ["nombre", "apellido", "direccion", "email", "telefono", "dni"];
const hasFormChanges =
originalForm != null && !shallowEqualForm(form, originalForm, formKeys);
const selectedZonaIds = zonasSeleccionadas.map((z) => z.value);
const hasZonaChanges = !sameIdSets(selectedZonaIds, originalZonasIds);

const handleSubmit = async () => {
try {
    setSaving(true);
    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("No se encontró prestador_id");

    if (!hasFormChanges && !hasZonaChanges) {
    setSuccessOpen(true);
    return;
    }

    if (!hasFormChanges && hasZonaChanges) {
    const toAdd = selectedZonaIds.filter((id) => !originalZonasIds.includes(id));
    const toRemove = originalZonasIds.filter((id) => !selectedZonaIds.includes(id));
    for (const id of toAdd) await addZonaToPrestador(prestadorId, id);
    for (const id of toRemove) await removeZonaFromPrestador(prestadorId, id);
    setOriginalZonasIds(selectedZonaIds);
    setSuccessOpen(true);
    return;
    }

    const payload = {
    nombre: form.nombre,
    apellido: form.apellido,
    direccion: form.direccion,
    email: form.email,
    telefono: form.telefono,
    activo: true,
    };
    Object.keys(payload).forEach((k) => {
    if (payload[k] === "" || payload[k] == null) delete payload[k];
    });

    await updatePrestador(prestadorId, payload);

    if (hasZonaChanges) {
    const toAdd = selectedZonaIds.filter((id) => !originalZonasIds.includes(id));
    const toRemove = originalZonasIds.filter((id) => !selectedZonaIds.includes(id));
    for (const id of toAdd) await addZonaToPrestador(prestadorId, id);
    for (const id of toRemove) await removeZonaFromPrestador(prestadorId, id);
    setOriginalZonasIds(selectedZonaIds);
    }

    setOriginalForm({ ...originalForm, ...form });
    setSuccessOpen(true);
} catch (err) {
    setError(err.message || "Error al guardar cambios");
} finally {
    setSaving(false);
}
};

const handlePasswordChange = async (newPassword) => {
  setPasswordSaving(true);
  setPasswordError('');
  try {
    const prestadorId = localStorage.getItem('prestador_id');
    if (!prestadorId) throw new Error('No se encontró el ID del prestador');

    await cambiarContrasena(prestadorId, newPassword);

    setPasswordModalOpen(false);
    setPasswordSuccessOpen(true);
  } catch (err) {
    setPasswordError(err.message || 'Ocurrió un error inesperado.');
  } finally {
    setPasswordSaving(false);
  }
};

// desactivar cuenta
const handleBaja = async () => {
try {
    setSaving(true);
    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("No se encontró prestador_id");

    await updatePrestador(prestadorId, { activo: false });

    // limpiar token/localStorage si corresponde
    localStorage.removeItem("token");
    localStorage.removeItem("prestador_id");

    // cerrar modal
    setBajaOpen(false);

    // ✅ 3) redirigir al login
    navigate("/login", { replace: true });
} catch (err) {
    setError(err.message || "Error al dar de baja la cuenta");
} finally {
    setSaving(false);
}
};

const habilidadesFiltradas = useMemo(() => {
const f = filtro.toLowerCase();
return (habilidades || []).filter(
    (h) =>
    h.nombre.toLowerCase().includes(f) ||
    (h.nombre_rubro || "").toLowerCase().includes(f)
);
}, [habilidades, filtro]);

return (
<AppLayout>
    <Box
    p="lg"
    bg="white"
    style={{
        position: "relative",
        borderRadius: 16,
        boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)",
    }}
    >
    <LoadingOverlay visible={loading || saving} zIndex={1000} />
    <Text fw={700} fz="xl" mb="lg" ta="center">
        Mi Perfil
    </Text>

    {error && (
        <Alert color="red" mb="lg" title="Error">
        {error}
        </Alert>
    )}

    <Grid gutter="xl" align="stretch">
        <Grid.Col span={{ base: 12, md: 7 }}>
        <Box p="lg" bg="white" style={{ borderRadius: 16 }}>
            <Text fw={600} fz="lg" mb="md" ta="center">
            Editar Perfil
            </Text>

            {/* campos */}
            <Group grow mb="md">
            <TextInput label="Nombre" value={form.nombre} onChange={handleChange("nombre")} />
            <TextInput label="Apellido" value={form.apellido} onChange={handleChange("apellido")} />
            </Group>

            <Group grow mb="md">
            <TextInput label="Mail" value={form.email} onChange={handleChange("email")} />
            <TextInput label="DNI" value={form.dni} disabled />
            </Group>

            <Group grow mb="md" style={{ alignItems: "flex-end" }}>
            <Box style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                Zonas
                </label>
                <Select
                isMulti
                options={zonas}
                placeholder="Seleccioná zonas"
                value={zonasSeleccionadas}
                onChange={(opts) => setZonasSeleccionadas(opts || [])}
                />
            </Box>
            <TextInput label="Dirección" value={form.direccion} onChange={handleChange("direccion")} />
            </Group>

            <Group grow mb="md">
            <TextInput label="Teléfono" value={form.telefono} onChange={handleChange("telefono")} />
            </Group>

            {/* Botones Actualizar y Baja */}
            <Group justify="center" mt="md">
            <Button
                color="#93755E"
                onClick={handleSubmit}
                disabled={saving || (!hasFormChanges && !hasZonaChanges)}
            >
                Actualizar
            </Button>

            {/* BOTÓN NUEVO */}
            <Button
                variant="outline"
                onClick={() => setPasswordModalOpen(true)}
                disabled={saving}
            >
                Cambiar Contraseña
            </Button>

            <Button
                color="red"
                variant="outline"
                onClick={() => setBajaOpen(true)}
                disabled={saving}
            >
                Dar de baja
            </Button>
            </Group>

            <Divider my="sm" label="Tus Habilidades" labelPosition="center" />
            <TextInput
            placeholder="Buscar habilidad"
            mb="sm"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            />

            <Box
            mih={100}
            mb="md"
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8 }}
            >
            {habilidadesFiltradas.length === 0 ? (
                <Text c="dimmed" fz="sm">
                No se encontraron habilidades
                </Text>
            ) : (
                habilidadesFiltradas.map((h) => (
                <Box key={h.id} p="xs" style={{ borderBottom: "1px solid #eee" }}>
                    <Text fw={500} style={{ fontSize: 14 }}>
                    {h.nombre}
                    </Text>
                    <Text fz="xs" c="dimmed">
                    {h.nombre_rubro}
                    </Text>
                </Box>
                ))
            )}
            </Box>
        </Box>
        </Grid.Col>

        {/* Columna derecha (calificaciones) */}
        <Grid.Col span={{ base: 12, md: 5 }}>
        <Box p="lg" bg="white" style={{ borderRadius: 16 }}>
            <Text fw={600} fz="lg" mb="md" ta="center">
            Calificaciones
            </Text>
            <Group justify="center" mb="md">
            <Rating
                value={
                reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + (r.estrellas || 0), 0) / reviews.length
                    : 0
                }
                readOnly
            />
            </Group>
            <Text ta="center" mb="md">
            ({reviews.length} Reviews)
            </Text>
            <Divider my="sm" />
            <Box style={{ maxHeight: 300, overflowY: "auto" }}>
            {reviews.length === 0 ? (
                <Text fz="sm" c="dimmed">
                Este prestador aún no tiene calificaciones
                </Text>
            ) : (
                reviews.map((r) => (
                <Box key={r.id} mb="md">
                    <Group>
                    <Avatar radius="xl" color="#93755E">
                        {r.nombre_usuario ? r.nombre_usuario[0] : "U"}
                    </Avatar>
                    <Text fw={600}>{r.nombre_usuario}</Text>
                    <Rating value={r.estrellas} readOnly size="sm" />
                    </Group>
                    <Text fz="sm" c="dimmed" mt={4}>
                    {r.descripcion || "Sin comentario"}
                    </Text>
                </Box>
                ))
            )}
            </Box>
        </Box>
        </Grid.Col>
    </Grid>

    {/* Modal de éxito */}
    <Modal
        opened={successOpen}
        onClose={() => setSuccessOpen(false)}
        centered
        withCloseButton
        title={
        <Group gap="xs">
            <IconCircleCheck size={20} />
            <Text fw={600}>¡Datos actualizados!</Text>
        </Group>
        }
    >
        <Group justify="center" mb="md">
        <Text c="#000">Tus cambios se guardaron correctamente.</Text>
        </Group>
        <Group justify="end" mt="md">
        <Button color="#93755E" onClick={() => setSuccessOpen(false)}>
            Aceptar
        </Button>
        </Group>
    </Modal>

    {/* Modal de confirmación de baja */}
    <Modal
        opened={bajaOpen}
        onClose={() => setBajaOpen(false)}
        centered
        withCloseButton={false}
        title={
        <Group gap="xs">
            <IconAlertTriangle color="red" size={20} />
            <Text fw={600} c="red">
            Confirmar baja
            </Text>
        </Group>
        }
    >
        <Text mb="md">
        ¿Estás seguro de que querés dar de baja tu cuenta?
        </Text>
        <Group justify="end">
        <Button variant="default" onClick={() => setBajaOpen(false)}>
            Cancelar
        </Button>
        <Button color="red" onClick={handleBaja}>
            Sí, dar de baja
        </Button>
        </Group>
    </Modal>
    
<ModalCambiarContrasena
  opened={passwordModalOpen}
  onClose={() => setPasswordModalOpen(false)}
  onSubmit={handlePasswordChange}
  loading={passwordSaving}
  error={passwordError}
  clearError={() => setPasswordError('')}
/>

<Modal
  opened={passwordSuccessOpen}
  onClose={() => setPasswordSuccessOpen(false)}
  centered
  title={<Text fw={600}>¡Éxito!</Text>}
>
  <Stack align="center">
    <IconCircleCheck size={48} color="green" />
    <Text>Tu contraseña se actualizó correctamente.</Text>
    <Button color="#93755E" onClick={() => setPasswordSuccessOpen(false)} mt="md">
      Aceptar
    </Button>
  </Stack>
</Modal>

    </Box>
</AppLayout>
);
}
