import React, { useEffect, useMemo, useState } from "react";
import {
Paper,
Box,
Text,
Group,
Grid,
TextInput,
Button,
LoadingOverlay,
Modal,
Alert,
Stack,
 Avatar, 
  FileButton,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
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
getPrestadores
} from "../Api/prestadores";

import { uploadImageToImgur } from "../Api/imgur";


import ModalCambiarContrasena from "../components/ModalCambiarContrasena";

/* utilidades  */
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
const navigate = useNavigate();
const isDesktop = useMediaQuery("(min-width: 1200px)");

const [zonas, setZonas] = useState([]);
const [zonasSeleccionadas, setZonasSeleccionadas] = useState([]);
const [form, setForm] = useState({
nombre: "",
apellido: "",
email: "",
direccion: "",
telefono: "",
dni: "",
foto: "",
});

const [errors, setErrors] = useState({
nombre: "",
apellido: "",
email: "",
direccion: "",
telefono: "",
});

const [originalForm, setOriginalForm] = useState(null);
const [originalZonasIds, setOriginalZonasIds] = useState([]);
const [habilidades, setHabilidades] = useState([]);
const [filtro, setFiltro] = useState("");

const [passwordModalOpen, setPasswordModalOpen] = useState(false);
const [passwordSaving, setPasswordSaving] = useState(false);
const [passwordError, setPasswordError] = useState("");
const [passwordSuccessOpen, setPasswordSuccessOpen] = useState(false);

const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [successOpen, setSuccessOpen] = useState(false);
const [error, setError] = useState("");
const [bajaOpen, setBajaOpen] = useState(false);

const [fotoUrl, setFotoUrl] = useState(""); // La foto actual del prestador
const [fotoFile, setFotoFile] = useState(null); // El nuevo archivo a subir
const [fotoPreview, setFotoPreview] = useState("");

const MAX = {
    nombre: 30,
    apellido: 30,
    email: 60,
    direccion: 60,
    telefono: 15,
};

useEffect(() => {
    
const load = async () => {
    try {
    setLoading(true);
    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("No se encontró prestador_id");

    const [zonasRes, prestador] = await Promise.all([
        fetchZonas(),
        getPrestadorById(prestadorId),
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

    const initialFoto = prestador.foto || prestador.foto_url || "";
    setFotoUrl(initialFoto);
    setFotoPreview(initialFoto);

    const prestadorZonas = (prestador.zonas || []).map((z) => ({
        value: z.id,
        label: z.nombre,
    }));
    setZonasSeleccionadas(prestadorZonas);
    setOriginalZonasIds(prestadorZonas.map((z) => z.value));

    setHabilidades(prestador.habilidades || []);
    } catch (err) {
    setError(err.message || "Error al cargar el perfil");
    } finally {
    setLoading(false);
    }
};
load();
}, []);

useEffect(() => {
    if (!fotoFile) {
      return; // Si no hay archivo, no hagas nada
    }
    const objectUrl = URL.createObjectURL(fotoFile);
    setFotoPreview(objectUrl);

    // Limpia la URL de la memoria cuando el componente se desmonte o el archivo cambie
    return () => URL.revokeObjectURL(objectUrl);
  }, [fotoFile]);

const handleChange = (key) => (e) => {
const val = e?.target ? e.target.value : e;

// Sanitizar + recortar por máximo
let newVal =
    key === "telefono"
    ? (val || "").replace(/\D+/g, "")
    : typeof val === "string"
    ? val
    : String(val ?? "");

if (MAX[key]) newVal = newVal.slice(0, MAX[key]); // límite de caracteres

setForm((prev) => ({ ...prev, [key]: newVal }));

// Validación por campo
setErrors((prev) => {
    const draft = { ...prev };
    if (key === "nombre") draft.nombre = newVal?.trim() ? "" : "El nombre es obligatorio.";
    if (key === "apellido") draft.apellido = newVal?.trim() ? "" : "El apellido es obligatorio.";
    if (key === "direccion") draft.direccion = newVal?.trim() ? "" : "La dirección es obligatoria.";
    if (key === "telefono") {
    draft.telefono = !newVal?.trim()
        ? "El teléfono es obligatorio."
        : /^\d+$/.test(newVal)
        ? ""
        : "El teléfono debe tener solo números.";
    }
    if (key === "email") {
    if (!newVal?.trim()) draft.email = "El mail es obligatorio.";
    else
        draft.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newVal.trim())
        ? ""
        : "Ingresá un e-mail válido (con @ y dominio).";
    }
    return draft;
});
};

const formKeys = ["nombre", "apellido", "direccion", "email", "telefono", "dni"];
const hasFormChanges =
originalForm != null && !shallowEqualForm(form, originalForm, formKeys);
const selectedZonaIds = zonasSeleccionadas.map((z) => z.value);
const hasZonaChanges = !sameIdSets(selectedZonaIds, originalZonasIds);
const hasFotoChange = fotoFile != null;

const handleSubmit = async () => {
  try {
    setSaving(true);
    setError("");
    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("No se encontró prestador_id");

    if (!hasFormChanges && !hasZonaChanges && !hasFotoChange) {
      setSuccessOpen(true);
      return;
    }

    if (hasFormChanges) {
      const { isValid, nextErrors } = validateForm(form);
      setErrors(nextErrors);
      if (!isValid) {
        throw new Error("Revisá los campos marcados.");
      }
      const email = form.email?.trim();
      if (email && email !== originalForm.email) {
        const available = await isEmailAvailable(email);
        if (!available) {
          setErrors((prev) => ({ ...prev, email: "Ese e-mail ya está en uso." }));
          throw new Error("Revisá los campos marcados.");
        }
      }
    }

    // --- PREPARACIÓN DEL PAYLOAD ---
    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      direccion: form.direccion,
      email: form.email,
      telefono: form.telefono,
    };

    // --- LA SOLUCIÓN DEFINITIVA ESTÁ AQUÍ ---
    // 1. Añadimos explícitamente el ID al payload.
    // Esto es lo que faltaba y causaba el error "Prestador no encontrado".
    payload.id = prestadorId;

    if (hasFotoChange) {
      const newFotoUrl = await uploadImageToImgur(fotoFile);
      payload.foto = newFotoUrl;
      localStorage.setItem("userFoto", newFotoUrl);

    }

    if (hasFormChanges || hasFotoChange) {
      await updatePrestador(prestadorId, payload);
      setOriginalForm({ ...form });
      if (hasFotoChange) {
        setFotoUrl(payload.foto);
        setFotoFile(null);
      }
    }

    if (hasZonaChanges) {
      const toAdd = selectedZonaIds.filter((id) => !originalZonasIds.includes(id));
      const toRemove = originalZonasIds.filter((id) => !selectedZonaIds.includes(id));
      for (const id of toAdd) await addZonaToPrestador(prestadorId, id);
      for (const id of toRemove) await removeZonaFromPrestador(prestadorId, id);
      setOriginalZonasIds(selectedZonaIds);
    }

    setSuccessOpen(true);

  } catch (err) {
    setError(err.message || "Error al guardar cambios");
  } finally {
    setSaving(false);
  }
};

const handlePasswordChange = async (newPassword) => {
setPasswordSaving(true);
setPasswordError("");
try {
    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("No se encontró el ID del prestador");

    await cambiarContrasena(prestadorId, newPassword);

    setPasswordModalOpen(false);
    setPasswordSuccessOpen(true);
} catch (err) {
    setPasswordError(err.message || "Ocurrió un error inesperado.");
} finally {
    setPasswordSaving(false);
}
};

const handleBaja = async () => {
try {
    setSaving(true);
    const prestadorId = localStorage.getItem("prestador_id");
    if (!prestadorId) throw new Error("No se encontró prestador_id");

    await updatePrestador(prestadorId, { activo: false });
    localStorage.removeItem("token");
    localStorage.removeItem("prestador_id");
    setBajaOpen(false);
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

// manejos de erroes en los campos de texto
const validateForm = (data = form) => {
const nextErrors = { nombre: "", apellido: "", email: "", direccion: "", telefono: "" };

// Requeridos
if (!data.nombre?.trim()) nextErrors.nombre = "El nombre es obligatorio.";
if (!data.apellido?.trim()) nextErrors.apellido = "El apellido es obligatorio.";
if (!data.direccion?.trim()) nextErrors.direccion = "La dirección es obligatoria.";
if (!data.telefono?.trim()) nextErrors.telefono = "El teléfono es obligatorio.";
if (!data.email?.trim()) nextErrors.email = "El mail es obligatorio.";

// Email básico
if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    nextErrors.email = "Ingresá un e-mail válido (con @ y dominio).";
}

// Teléfono: solo dígitos
if (data.telefono && !/^\d+$/.test(data.telefono.trim())) {
    nextErrors.telefono = "El teléfono debe tener solo números.";
}

const isValid = Object.values(nextErrors).every((v) => !v);
return { isValid, nextErrors };
};

// Verifica si el email está disponible (case-insensitive) ignorando el propio prestador
const isEmailAvailable = async (email) => {
  const e = (email || "").trim().toLowerCase();
  if (!e) return false; // vacío no es válido

  const prestadorId = localStorage.getItem("prestador_id");
  const lista = await getPrestadores();

  // buscá coincidencia exacta (insensible a may/min) en otro prestador distinto a mí
  const clash = (lista || []).some((p) => {
    const pid = String(p.id);
    const mail = (p.email || "").trim().toLowerCase();
    return pid !== String(prestadorId) && mail === e;
  });

  return !clash;
};

return (
<AppLayout>
    <Paper
        p="lg"
        withBorder
        radius="lg"
        shadow="sm"
        style={{
            position: "relative",
            width: "100%",
            maxWidth: isDesktop ? 1200 : "95%",
            margin: "0 auto",
            background: "--app-bg",
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
        {/* Columna izquierda: Editar Perfil */}
        <Grid.Col span={{ base: 12, md: 7 }}>
  {/* Usamos un solo Paper para todo el contenido de la columna */}
  <Paper p="lg" withBorder radius="lg" shadow="sm" style={{ background: "var(--app-bg)" }}>

    {/* Título General */}
    <Text fw={600} fz="lg" mb="md" ta="center">
      Editar Perfil
    </Text>

    {/* Sección de la Foto de Perfil */}
<Stack align="center" gap="md" mb="xl">
  <Avatar src={fotoPreview} size={120} radius="100%" />
  <Group>
    <FileButton onChange={setFotoFile} accept="image/png,image/jpeg">
      {(props) => <Button {...props}>Seleccionar foto</Button>}
    </FileButton>
    <Button
      variant="default"
      onClick={() => {
        setFotoFile(null);
        setFotoPreview(fotoUrl); // Vuelve a la foto original
      }}
      disabled={!fotoFile}
    >
      Cancelar
    </Button>
  </Group>
</Stack>

    {/* --- INICIO DEL FORMULARIO DE DATOS --- */}
    <Group grow mb="md">
      <TextInput label="Nombre" value={form.nombre} onChange={handleChange("nombre")} error={errors.nombre} maxLength={MAX.nombre}/>
      <TextInput label="Apellido" value={form.apellido} onChange={handleChange("apellido")} error={errors.apellido} maxLength={MAX.apellido}/>
    </Group>

    {/* ... (Aquí va el resto de tus TextInput y el Select de Zonas,
         exactamente como los tenías antes, dentro del Paper) ... */}
    
    <Group grow mb="md">
        <TextInput label="Mail" value={form.email} onChange={handleChange("email")} error={errors.email} maxLength={MAX.email}
        onBlur={async () => {
          // ... tu lógica onBlur
        }}/>
        <TextInput label="DNI" value={form.dni} disabled />
    </Group>

    <Group grow mb="md" align="flex-end">
        <Box style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>
                Zonas
            </label>
            <Select
                isMulti
                options={zonas}
                placeholder="Seleccioná zonas"
                value={zonasSeleccionadas}
                onChange={(opts) => setZonasSeleccionadas(opts || [])}
                styles={{ /* ... tus estilos ... */ }}
            />
        </Box>
        <TextInput
            label="Dirección"
            value={form.direccion}
            onChange={handleChange("direccion")}
            error={errors.direccion}
            maxLength={MAX.direccion}
        />
    </Group>

    <Group grow mb="md">
        <TextInput label="Teléfono" value={form.telefono} onChange={handleChange("telefono")} error={errors.telefono} maxLength={MAX.telefono}/>
    </Group>
    {/* --- FIN DEL FORMULARIO DE DATOS --- */}


    {/* --- GRUPO DE BOTONES DE ACCIÓN --- */}
    <Group justify="center" mt="xl">
      <Button
        color="#93755E"
        onClick={handleSubmit} // Ahora sí está conectado
        disabled={saving || (!hasFormChanges && !hasZonaChanges && !hasFotoChange)}
      >
        Actualizar
      </Button>
      <Button variant="outline" onClick={() => setPasswordModalOpen(true)} disabled={saving}>
        Cambiar Contraseña
      </Button>
      <Button color="red" variant="outline" onClick={() => setBajaOpen(true)} disabled={saving}>
        Dar de baja
      </Button>
    </Group>

  </Paper>
</Grid.Col>

        {/* Columna derecha: Habilidades con scroll interno */}
        <Grid.Col span={{ base: 12, md: 5 }}>
        <Paper p="lg" withBorder radius="lg" shadow="sm" style={{ background: "--app-bg", height: "100%" }}>
            <Text fw={600} fz="lg" mb="md" ta="center">
            Mis Habilidades
            </Text>

            <TextInput
            placeholder="Buscar habilidad"
            mb="sm"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            />

            {/* ⬇️ contenedor scrolleable */}
            <Box
            mih={100}
            style={{
                border: "1px solid var(--input-border)",
                borderRadius: 8,
                padding: 8,
                maxHeight: 350,        // alto máximo
                overflowY: "auto",     // scroll vertical interno
            }}
            >
            {habilidadesFiltradas.length === 0 ? (
                <Text c="dimmed" fz="sm">
                No se encontraron habilidades
                </Text>
            ) : (
                habilidadesFiltradas.map((h) => (
                <Box key={h.id} p="xs" style={{ borderBottom: "1px solid var(--input-border)" }}>
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
        </Paper>
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
        <Text mb="md">¿Estás seguro de que querés dar de baja tu cuenta?</Text>
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
        clearError={() => setPasswordError("")}
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
    </Paper>
</AppLayout>
);
}
