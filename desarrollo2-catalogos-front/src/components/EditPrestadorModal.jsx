import React, { useEffect, useState } from "react";
import { Modal, Text, TextInput, Grid, Group, Button, Stack, Alert } from "@mantine/core";

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
});

const [errors, setErrors] = useState({
nombre: "",
apellido: "",
email: "",
telefono: "",
direccion: "",
});

const [formError, setFormError] = useState("");

useEffect(() => {
if (opened) {
    const next = {
    nombre: initialData?.nombre ?? "",
    apellido: initialData?.apellido ?? "",
    email: initialData?.email ?? initialData?.mail ?? "",
    telefono: initialData?.telefono ?? initialData?.celular ?? "",
    direccion: initialData?.direccion ?? initialData?.domicilio ?? "",
    dni: initialData?.dni ?? initialData?.documento ?? "",
    };
    // recortamos a MAX por si viniera largo
    Object.keys(next).forEach((k) => {
    if (typeof next[k] === "string") next[k] = next[k].slice(0, MAX);
    });
    setValues(next);
    setErrors({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
    setFormError("");
}
}, [opened, initialData]);

const validateField = (key, val) => {
const v = (val ?? "").trim();

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
return "";
};

const validateAll = (data = values) => {
const nextErrors = {
    nombre: validateField("nombre", data.nombre),
    apellido: validateField("apellido", data.apellido),
    email: validateField("email", data.email),
    telefono: validateField("telefono", data.telefono),
    direccion: validateField("direccion", data.direccion),
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
    // ❌ DNI NO SE EDITA: no lo mandamos en el payload
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
            // sin onChange
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
