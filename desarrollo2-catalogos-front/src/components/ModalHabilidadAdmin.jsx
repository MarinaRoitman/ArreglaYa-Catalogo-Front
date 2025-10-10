// src/components/ModalHabilidadAdmin.jsx
import React, { useEffect, useState } from "react";
import { Modal, Stack, TextInput, Textarea, Select, Group, Button, Text } from "@mantine/core";

export default function ModalHabilidadAdmin({
opened,
onClose,
onSubmit,
rubrosOpts = [],
defaultValues,
mode = "create",
loading = false,
}) {
const [nombre, setNombre] = useState("");
const [descripcion, setDescripcion] = useState("");
const [idRubro, setIdRubro] = useState("");

useEffect(() => {
if (opened) {
    setNombre(defaultValues?.nombre ?? "");
    setDescripcion(defaultValues?.descripcion ?? "");
    setIdRubro(defaultValues?.id_rubro ?? "");
} else {
    setNombre(""); setDescripcion(""); setIdRubro("");
}
}, [opened, defaultValues]);

const handleSave = async () => {
  if (!nombre.trim() || !idRubro) return;
  await onSubmit?.({
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    id_rubro: parseInt(idRubro, 10), // <-- importante
  });
};


return (
<Modal
    opened={opened}
    onClose={onClose}
    centered
    radius="lg"
    withCloseButton
    title={<Text fw={700}>{mode === "edit" ? "Editar habilidad" : "Nueva habilidad"}</Text>}
>
    <Stack>
    <TextInput
        label="Nombre"
        placeholder="Ej: Plomería domiciliaria"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        autoFocus
    />
    <Textarea
        label="Descripción"
        placeholder="Detalle breve del servicio"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        minRows={2}
    />
    <Select
        label="Rubro"
        data={rubrosOpts}
        value={idRubro}
        onChange={setIdRubro}
        searchable
        placeholder="Seleccioná un rubro"
        required
    />
    <Group justify="flex-end" mt="sm">
        <Button variant="light" onClick={onClose} color="#a07353ff">
        Cancelar
        </Button>
        <Button onClick={handleSave} loading={loading} color="#93755E">
            {mode === "edit" ? "Guardar cambios" : "Crear"}
        </Button>
    </Group>
    </Stack>
</Modal>
);
}
