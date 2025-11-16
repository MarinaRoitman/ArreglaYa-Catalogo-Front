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
} from "../Api/prestadores";

import { uploadImageToCloudinary } from "../Api/cloudinary"; //

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
  telefono: "",
  dni: "",
  foto: "",
  estado: "",
  ciudad: "",
  calle: "",
  numero: "",
  piso: "",
  departamento: "",
});

const [errors, setErrors] = useState({
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  estado: "",
  ciudad: "",
  calle: "",
  numero: "",
  piso: "",
  departamento: "",
});

const MAX = {
  nombre: 30,
  apellido: 30,
  email: 30,
  telefono: 10,
  estado: 30,
  ciudad: 30,
  calle: 30,
  numero: 4,
  piso: 3,
  departamento: 2,
};

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
    telefono: prestador.telefono || "",
    dni: prestador.dni || "",
    estado: prestador.estado || prestador.estado_pri || "",
    ciudad: prestador.ciudad || prestador.ciudad_pri || "",
    calle: prestador.calle || prestador.calle_pri || "",
    numero: prestador.numero || prestador.numero_pri || "",
    piso: prestador.piso || prestador.piso_pri || "",
    departamento: prestador.departamento || prestador.departamento_pri || "",
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

const onlyLetters = (s = "") => s.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");
const onlyLettersNoSpace = (s = "") => s.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
const onlyDigits = (s = "") => s.replace(/\D+/g, "");

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
  const input = e?.target ? e.target.value : e;
  let val = typeof input === "string" ? input : String(input ?? "");

// Sanitizar + recortar por máximo

  if (MAX[key]) val = val.slice(0, MAX[key]); // límite de caracteres

// Sanitizado por campo
  if (["estado", "ciudad", "calle"].includes(key)) val = onlyLetters(val);
  if (["numero", "piso", "telefono"].includes(key)) val = onlyDigits(val);
  if (key === "departamento") val = onlyLettersNoSpace(val.toUpperCase());

setForm((prev) => ({ ...prev, [key]: val }));

// Validación por campo
setErrors((prev) => {
    const d = { ...prev };

    if (key === "nombre") d.nombre = val.trim() ? "" : "El nombre es obligatorio.";
    if (key === "apellido") d.apellido = val.trim() ? "" : "El apellido es obligatorio.";

    if (key === "telefono") {
      d.telefono = !val.trim()
        ? "El teléfono es obligatorio."
        : /^\d+$/.test(val)
        ? ""
        : "El teléfono debe tener solo números.";
    }

    if (key === "email") {
      if (!val.trim()) d.email = "El mail es obligatorio.";
      else d.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
        ? ""
        : "Ingresá un e-mail válido.";
    }

    if (key === "estado") d.estado = val.trim() ? "" : "El estado es obligatorio.";
    if (key === "ciudad") d.ciudad = val.trim() ? "" : "La ciudad es obligatoria.";
    if (key === "calle") d.calle = val.trim() ? "" : "La calle es obligatoria.";

    if (key === "numero") d.numero = val ? "" : "El número es obligatorio.";
    if (key === "piso") d.piso = ""; // opcional
    if (key === "departamento") d.departamento = ""; // opcional

    return d;
  });
};

const formKeys = [
  "nombre","apellido","email","telefono","dni",
  "estado","ciudad","calle","numero","piso","departamento"
];
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

    // --- LÓGICA DE VALIDACIÓN ---
    if (hasFormChanges) {
      const { isValid, nextErrors } = validateForm(form);
      setErrors(nextErrors);
      if (!isValid) {
        throw new Error("Revisá los campos marcados.");
      }
    }

    // --- PREPARACIÓN DEL PAYLOAD ---
  const payload = {
    nombre: form.nombre,
    apellido: form.apellido,
    email: form.email,
    telefono: form.telefono,
    estado: form.estado || "",
    ciudad: form.ciudad || "",
    calle: form.calle || "",
    numero: form.numero || "",
    piso: form.piso || "",
    departamento: form.departamento || "",
  };
    
    if (hasFotoChange) {
      const newFotoUrl = await uploadImageToCloudinary(fotoFile); //
      payload.foto = newFotoUrl;
    }

    // --- EJECUCIÓN DE LAS ACTUALIZACIONES ---
    if (hasFormChanges || hasFotoChange) {
      await updatePrestador(prestadorId, payload);
      setOriginalForm({ ...form });
      if (hasFotoChange) {
        setFotoUrl(payload.foto);
        setFotoFile(null);
        localStorage.setItem("userFoto", payload.foto);
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
  console.error(err);

  let backendMsg =
    err?.message ||
    err?.response?.data?.detail ||
    err?.detail ||
    "";

  if (backendMsg.toLowerCase().includes("email")) {
    setError("Este email ya está siendo utilizado.");
  } else {
    setError("Ocurrió un error al guardar los cambios.");
  }
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
  const nextErrors = {
    nombre: "", apellido: "", email: "", telefono: "",
    estado: "", ciudad: "", calle: "", numero: "",
    piso: "", departamento: "",
  };

  // Requeridos
  if (!data.nombre?.trim()) nextErrors.nombre = "El nombre es obligatorio.";
  if (!data.apellido?.trim()) nextErrors.apellido = "El apellido es obligatorio.";
  if (!data.email?.trim()) nextErrors.email = "El mail es obligatorio.";
  if (!data.telefono?.trim()) nextErrors.telefono = "El teléfono es obligatorio.";

  if (!data.estado?.trim()) nextErrors.estado = "El estado es obligatorio.";
  if (!data.ciudad?.trim()) nextErrors.ciudad = "La ciudad es obligatoria.";
  if (!data.calle?.trim()) nextErrors.calle = "La calle es obligatoria.";
  if (!data.numero?.trim()) nextErrors.numero = "El número es obligatorio.";

  // Formatos
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    nextErrors.email = "Ingresá un e-mail válido.";
  }
  if (data.telefono && !/^\d+$/.test(data.telefono.trim())) {
    nextErrors.telefono = "El teléfono debe tener solo números.";
  }
  if (data.estado && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(data.estado.trim())) {
    nextErrors.estado = "Solo letras y espacios.";
  }
  if (data.ciudad && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(data.ciudad.trim())) {
    nextErrors.ciudad = "Solo letras y espacios.";
  }
  if (data.calle && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(data.calle.trim())) {
    nextErrors.calle = "Solo letras y espacios.";
  }
  if (data.numero && !/^\d{1,5}$/.test(data.numero.trim())) {
    nextErrors.numero = "Solo números (máx 5).";
  }
  if (data.piso && !/^\d{1,3}$/.test(data.piso.trim())) {
    nextErrors.piso = "Solo números (máx 3).";
  }
  if (data.departamento && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{1,2}$/.test(data.departamento.trim())) {
    nextErrors.departamento = "Solo letras (máx 2).";
  }

  const isValid = Object.values(nextErrors).every((v) => !v);
  return { isValid, nextErrors };
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
      
      <Paper p="lg" withBorder radius="lg" shadow="sm">
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
    
    <Group grow mb="md">
        <TextInput label="Mail" value={form.email} onChange={handleChange("email")} error={errors.email} maxLength={MAX.email}
        onBlur={async () => {
        }}/>
        <TextInput label="DNI" value={form.dni} disabled />
    </Group>

    <Group grow mb="md" align="flex-end">
    <Box style={{ flex: 1 }}>
    <label
        style={{
        display: "block",
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 6,
        color: "var(--text)",
        }}
    >
        Zonas
    </label>

    <Select
        isMulti
        options={zonas}
        placeholder="Seleccioná zonas"
        value={zonasSeleccionadas}
        onChange={(opts) => setZonasSeleccionadas(opts || [])}

        styles={{
        control: (base) => ({
            ...base,
            background: "var(--input-bg)",
            borderColor: "var(--input-border)",
            boxShadow: "none",
            ":hover": { borderColor: "var(--input-border)" },
        }),
        menu: (base) => ({
            ...base,
            background: "var(--card-bg)",
            border: "1px solid var(--input-border)",
        }),
        option: (base, state) => ({
            ...base,
            background: state.isFocused ? "var(--input-bg)" : "transparent",
            color: "var(--text)",
        }),
        singleValue: (base) => ({ ...base, color: "var(--text)" }),
        multiValue: (base) => ({
            ...base,
            background: "transparent",
            border: "1px solid var(--input-border)",
        }),
        multiValueLabel: (base) => ({ ...base, color: "var(--text)" }),
        input: (base) => ({ ...base, color: "var(--text)" }),
        placeholder: (base) => ({ ...base, color: "var(--text)" }),
        }}
    />
    </Box>

</Group>

<Group grow mb="md">
  <TextInput
    label="Estado"
    value={form.estado}
    onChange={handleChange("estado")}
    error={errors.estado}
    maxLength={MAX.estado}
    placeholder="Ej: Buenos Aires"
  />
  <TextInput
    label="Ciudad"
    value={form.ciudad}
    onChange={handleChange("ciudad")}
    error={errors.ciudad}
    maxLength={MAX.ciudad}
    placeholder="Ej: La Plata"
  />
</Group>

<Group grow mb="md">
  <TextInput
    label="Calle"
    value={form.calle}
    onChange={handleChange("calle")}
    error={errors.calle}
    maxLength={MAX.calle}
    placeholder="Ej: Calle 500"
  />
  <TextInput
    label="Número"
    value={form.numero}
    onChange={handleChange("numero")}
    error={errors.numero}
    maxLength={MAX.numero}
    placeholder="Ej: 1234"
  />
</Group>

<Group grow mb="md">
  <TextInput
    label="Piso"
    value={form.piso}
    onChange={handleChange("piso")}
    error={errors.piso}
    maxLength={MAX.piso}
    placeholder="Ej: 3"
  />
  <TextInput
    label="Departamento"
    value={form.departamento}
    onChange={handleChange("departamento")}
    error={errors.departamento}
    maxLength={MAX.departamento}
    placeholder="Ej: B"
  />
</Group>

    <Group grow mb="md">
        <TextInput label="Teléfono" value={form.telefono} onChange={handleChange("telefono")} error={errors.telefono} maxLength={MAX.telefono}/>
    </Group>


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
