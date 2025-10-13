import React, { useEffect, useState } from "react";
import { Modal, Text, TextInput, Grid, Group, Button, Stack, Alert, MultiSelect } from "@mantine/core";
import { fetchZonas } from "../Api/zonas";
const MAX = 50;

export default function EditPrestadorModal({
opened,
initialData,              
loading = false,
onCancel,
onSave,                   
onOpenPassword,            
}) {
const [values, setValues] = useState({
nombre: "",
apellido: "",
email: "",
telefono: "",
direccion: "",
dni: "",
id_zona: "",
});

const [errors, setErrors] = useState({
nombre: "",
apellido: "",
email: "",
telefono: "",
direccion: "",
id_zona: "",
});

const [zonasDisponibles, setZonasDisponibles] = useState([]);
const [zonasSeleccionadasIds, setZonasSeleccionadasIds] = useState([]);const [formError, setFormError] = useState("");

useEffect(() => {
  if (opened) {
    const loadZonas = async () => {
      try {
        const zonasData = await fetchZonas(); // Asumiendo que tienes fetchZonas en Api/zonas.js
        setZonasDisponibles(
          zonasData.map((z) => ({ value: String(z.id), label: z.nombre }))
        );
      } catch (error) {
        console.error("Error al cargar zonas:", error);
      }
    };
    loadZonas();
    const initialZonaIds = (initialData?.zonas || []).map(z => String(z.id));
    setZonasSeleccionadasIds(initialZonaIds);

    const next = {
    nombre: initialData?.nombre ?? "",
    apellido: initialData?.apellido ?? "",
    email: initialData?.email ?? initialData?.mail ?? "",
    telefono: initialData?.telefono ?? initialData?.celular ?? "",
    direccion: initialData?.direccion ?? initialData?.domicilio ?? "",
    dni: initialData?.dni ?? initialData?.documento ?? "",
    id_zona: initialData?.id_zona ?? "", 

    };
    // recortamos a MAX por si viniera largo
    Object.keys(next).forEach((k) => {
    if (typeof next[k] === "string") next[k] = next[k].slice(0, MAX);
    });
    setValues(next);
    setErrors({ nombre: "", apellido: "", email: "", telefono: "", direccion: "", id_zona: "" });
    setFormError("");
}
}, [opened, initialData]);

const validateField = (key, val) => {
  if (key === "zonas") {
    // Si es un array y tiene al menos un elemento, es válido. Si no, devuelve el error.
    return Array.isArray(val) && val.length > 0
      ? ""
      : "Debe seleccionar al menos una zona.";
  }

  // Para TODOS los demás campos (que sí son de texto), aplicamos .trim()
  const v = (val ?? "").trim();

  // A partir de aquí, el resto de las validaciones para campos de texto.
  if (key === "nombre") return v ? "" : "El nombre es obligatorio.";
  if (key === "apellido") return v ? "" : "El apellido es obligatorio.";
  if (key === "direccion") return v ? "" : "La dirección es obligatoria.";
  if (key === "telefono") {
    if (!v) return "El teléfono es obligatorio.";
    if (!/^\d+$/.test(v)) return "El teléfono debe tener solo números.";
    return "";
  }
  if (key === "email") {
    if (!v) return "El email es obligatorio.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Ingresá un e-mail válido.";
  }
  
  return ""; // Si el campo no tiene regla de validación, es válido.
};

// REEMPLAZA TU FUNCIÓN validateAll POR ESTA:
const validateAll = (data = values) => {
  const nextErrors = {
    nombre: validateField("nombre", data.nombre),
    apellido: validateField("apellido", data.apellido),
    email: validateField("email", data.email),
    telefono: validateField("telefono", data.telefono),
    direccion: validateField("direccion", data.direccion),
    
    // --- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ---
    // Le decimos que para validar las 'zonas', debe usar el estado 'zonasSeleccionadasIds'
    zonas: validateField("zonas", zonasSeleccionadasIds), 
  };

  const isValid = Object.values(nextErrors).every((e) => !e);
  setErrors(nextErrors);
  setFormError(isValid ? "" : "Revisá los campos marcados.");
  return isValid;
};

const handleChange = (field) => (e) => {
let val = e?.currentTarget?.value ?? "";

// Sanitizar + límite de caracteres
if (field === "telefono") {
    val = val.replace(/\D+/g, ""); // solo números
}
if (typeof val === "string") val = val.slice(0, MAX);

setValues((prev) => ({ ...prev, [field]: val }));
// validación instantánea del campo
if (field in errors) {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
}
};


const handleSubmit = async () => {
  if (!validateAll()) return;

  const payload = {
    nombre: values.nombre.trim(),
    apellido: values.apellido.trim(),
    email: values.email.trim(),
    telefono: values.telefono.trim(),
    direccion: values.direccion.trim(),
    zonas: zonasSeleccionadasIds.map(id => parseInt(id, 10)),
  };

  await onSave?.(payload);
};

return (
<Modal
    opened={opened}
    onClose={onCancel}
    centered
    radius="lg"
    title={<Text fw={800} fz="xl">Editar prestador</Text>}
    withCloseButton={!loading}
    closeOnClickOutside={!loading}
    closeOnEscape={!loading}
>
    <Stack gap="sm">
    {formError && (
        <Alert color="red" variant="light" mb="xs">
        {formError}
        </Alert>
    )}

<Grid>
  <Grid.Col span={{ base: 12, sm: 6 }}>
    <TextInput
      label="Nombre"
      withAsterisk
      value={values.nombre}
      onChange={handleChange("nombre")}
      error={errors.nombre}
      disabled={loading}
      maxLength={MAX}
    />
  </Grid.Col>

  <Grid.Col span={{ base: 12, sm: 6 }}>
    <TextInput
      label="Apellido"
      withAsterisk
      value={values.apellido}
      onChange={handleChange("apellido")}
      error={errors.apellido}
      disabled={loading}
      maxLength={MAX}
    />
  </Grid.Col>

  <Grid.Col span={{ base: 12, sm: 6 }}>
    <TextInput
      label="Email"
      withAsterisk
      type="email"
      value={values.email}
      onChange={handleChange("email")}
      error={errors.email}
      disabled={loading}
      maxLength={MAX}
    />
  </Grid.Col>

  <Grid.Col span={{ base: 12, sm: 6 }}>
    <TextInput
      label="Teléfono"
      withAsterisk
      value={values.telefono}
      onChange={handleChange("telefono")}
      error={errors.telefono}
      disabled={loading}
      maxLength={MAX}
      inputMode="numeric"
    />
  </Grid.Col>

  <Grid.Col span={12}>
    <TextInput
      label="Dirección"
      withAsterisk
      value={values.direccion}
      onChange={handleChange("direccion")}
      error={errors.direccion}
      disabled={loading}
      maxLength={MAX}
    />
  </Grid.Col>

  <Grid.Col span={{ base: 12, sm: 6 }}>
    <TextInput
      label="DNI"
      value={values.dni}
      disabled // 🔒 NO editable
      maxLength={MAX}
    />
  </Grid.Col>

<Grid.Col span={12}>
  <MultiSelect
    label="Zonas de trabajo"
    placeholder="Seleccione una o más zonas"
    data={zonasDisponibles}
    value={zonasSeleccionadasIds}
    onChange={setZonasSeleccionadasIds}
    searchable
    clearable
    disabled={loading}
  />
</Grid.Col>
</Grid>

    <Group justify="space-between" mt="md">
        <Button variant="outline" onClick={onOpenPassword} disabled={loading}>
        Cambiar contraseña
        </Button>
        <Group>
        <Button variant="light" onClick={onCancel} disabled={loading} color="#a07353ff">
            Cancelar
        </Button>
        <Button onClick={handleSubmit} loading={loading} color="#93755E">
            Guardar
        </Button>
        </Group>
    </Group>
    </Stack>
</Modal>
);
}
