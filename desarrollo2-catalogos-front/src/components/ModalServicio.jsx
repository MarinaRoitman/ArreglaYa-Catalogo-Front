import React, { useEffect, useMemo, useState } from "react";
import { Modal, TextInput, Group, Button, Stack, Alert } from "@mantine/core";
import { createRubro, updateRubro } from "../Api/rubros";

const norm = (s) =>
(s ?? "")
.toString()
.trim()
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "") // saca acentos
.replace(/\s+/g, " "); // colapsa espacios

export default function ModalServicio({ opened, onClose, rubro, rubros = [], onSaved }) {
const isEdit = !!rubro?.id;
const [nombre, setNombre] = useState("");
const [originalNombre, setOriginalNombre] = useState("");
const [saving, setSaving] = useState(false);
const [err, setErr] = useState("");

useEffect(() => {
setErr("");
const initial = rubro?.nombre ?? "";
setNombre(initial);
setOriginalNombre(initial); 
}, [rubro, opened]);

const usedNames = useMemo(() => {
const currentNorm = norm(rubro?.nombre);
const set = new Set(
    rubros
    .map((r) => norm(r?.nombre))
    .filter(Boolean)
    .filter((n) => (isEdit ? n !== currentNorm : true))
);
return set;
}, [rubros, rubro, isEdit]);

const nombreNorm = norm(nombre);
const isEmpty = nombreNorm.length === 0;
const isDuplicate = usedNames.has(nombreNorm);

const isChanged = nombre.trim() !== originalNombre.trim();

const handleSubmit = async () => {
if (isEmpty) {
    setErr("El nombre es obligatorio");
    return;
}
if (isDuplicate) {
    setErr("Ya existe un rubro con ese nombre");
    return;
}
if (isEdit && !isChanged) {
    return; 
}

try {
    setSaving(true);
    setErr("");

    if (isEdit) {
    await updateRubro(rubro.id, { nombre: nombre.trim() });
    } else {
    await createRubro({ nombre: nombre.trim() });
    }

    onSaved?.();
} catch (e) {
    const msg = e?.message || "No se pudo guardar el rubro";
    setErr(
    /duplicad|ya existe|conflict/i.test(msg)
        ? "Ya existe un rubro con ese nombre"
        : msg
    );
} finally {
    setSaving(false);
}
};

const soloLetras = (value) => {
const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
return regex.test(value);
};

return (
<Modal
    opened={opened}
    onClose={onClose}
    title={isEdit ? "Editar rubro" : "Nuevo rubro"}
    centered
>
    <Stack gap="sm">
    <TextInput
        label="Nombre del rubro"
        placeholder="Ej: Plomería"
        value={nombre}
        maxLength={30}
        onChange={(e) => {
        const value = e.currentTarget.value;
        if (soloLetras(value)) {
            setNombre(value);
            if (err) setErr("");
        }
        }}
        error={
        isEmpty
            ? "El nombre es obligatorio"
            : isDuplicate
            ? "Ya existe un rubro con ese nombre"
            : undefined
        }
        withAsterisk
        disabled={saving}
    />

    {err && !isDuplicate && !isEmpty && (
        <Alert color="red" variant="light">
        {err}
        </Alert>
    )}

    <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose} disabled={saving}>
        Cancelar
        </Button>

        <Button
        onClick={handleSubmit}
        loading={saving}
        disabled={
            isEmpty ||
            isDuplicate ||
            (isEdit && !isChanged) 
        }
        >
        {isEdit ? "Guardar cambios" : "Crear rubro"}
        </Button>
    </Group>
    </Stack>
</Modal>
);
}
