import React, { useEffect, useMemo, useState } from "react";
import { Modal, TextInput, Button, Group, Stack, Text } from "@mantine/core";
import { createZona, updateZona } from "../Api/zonas";

export default function ModalZona({
opened,
onClose,
zona,        // null => crear, objeto => editar
zonas = [],  // para validar duplicados
onSaved,     // callback al guardar OK
}) {
const isEdit = Boolean(zona?.id);
const [nombre, setNombre] = useState("");
const [saving, setSaving] = useState(false);
const [err, setErr] = useState("");

useEffect(() => {
setErr("");
setNombre(isEdit ? (zona?.nombre ?? "") : "");
}, [zona, isEdit, opened]);

const nombreTrim = useMemo(() => nombre.trim(), [nombre]);

const isDuplicate = useMemo(() => {
const lower = nombreTrim.toLowerCase();
return zonas.some(
(z) =>
z?.id !== zona?.id &&
String(z?.nombre ?? "").trim().toLowerCase() === lower
);
}, [zonas, zona?.id, nombreTrim]);

const canSave = nombreTrim.length > 0 && !isDuplicate && !saving;

const handleSubmit = async () => {
if (!canSave) return;

try {
setSaving(true);
setErr("");

if (isEdit) {
await updateZona(zona.id, { nombre: nombreTrim });
} else {
await createZona(nombreTrim);
}

if (onSaved) await onSaved();
} catch (e) {
console.error(e);
setErr(e?.message || "No se pudo guardar la zona");
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
title={isEdit ? "Editar zona" : "Nueva zona"}
centered
radius="lg"
>
<Stack gap="sm">
<TextInput
    label="Nombre"
    placeholder="Ej: Almagro"
    value={nombre}
    onChange={(e) => {
    const value = e.target.value;
    if (soloLetras(value)) {
        setNombre(value);
        }
    }}
    withAsterisk
    error={
    isDuplicate
        ? "Ya existe una zona con ese nombre"
        : nombreTrim.length === 0
        ? "El nombre es obligatorio"
        : undefined
    }
    maxLength={20}  
/>

{err && <Text c="red" fz="sm">{err}</Text>}

<Group justify="flex-end" mt="xs">
    <Button variant="default" onClick={onClose} disabled={saving}>
    Cancelar
    </Button>
    <Button color="#93755E" onClick={handleSubmit} loading={saving} disabled={!canSave}>
    {isEdit ? "Guardar cambios" : "Crear zona"}
    </Button>
</Group>
</Stack>
</Modal>
);
}
