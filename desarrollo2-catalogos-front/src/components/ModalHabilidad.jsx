import React, { useEffect, useState } from "react";
import { Modal, Stack, Text, TextInput, Textarea, Select, Group, Button } from "@mantine/core";

export default function ModalHabilidad({
opened,
onClose,
mode = "create",                 
initialValues = null,           
onCreate,
onUpdate,
rubros = [],
loading = false,
}) {
const [nombre, setNombre] = useState("");
const [rubroId, setRubroId] = useState("");
const [descripcion, setDescripcion] = useState("");

useEffect(() => {
if (!opened) return;
if (mode === "edit" && initialValues) {
    setNombre(initialValues.nombre ?? "");
    const idRubro = initialValues.id_rubro ?? initialValues.rubro_id ?? initialValues?.rubro?.id ?? "";
    setRubroId(idRubro ? String(idRubro) : "");
    setDescripcion(initialValues.descripcion ?? "");
} else {
    setNombre("");
    setRubroId("");
    setDescripcion("");
}
}, [opened, mode, initialValues]);

const opcionesRubros = rubros.map((r) => ({ value: String(r.id), label: r.nombre }));
const isValid = nombre.trim() && rubroId && descripcion.trim();

const handleSubmit = () => {
if (!isValid) return;
const payload = { nombre: nombre.trim(), id_rubro: Number(rubroId), descripcion: descripcion.trim() };
if (mode === "edit" && initialValues?.id) onUpdate?.({ id: initialValues.id, ...payload });
else onCreate?.(payload);
};

return (
<Modal
    key={`${mode}-${initialValues?.id ?? "new"}`}  
    opened={opened}
    onClose={onClose}
    centered
    radius="lg"
    withCloseButton
    title={<Text fw={700}>{mode === "edit" ? "Editar habilidad" : "Nueva habilidad"}</Text>}
>
    <Stack>
    <TextInput label="Nombre" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} required />
    <Select
        label="Rubro / Servicio"
        data={opcionesRubros}
        value={rubroId}
        onChange={setRubroId}
        placeholder="Seleccioná un rubro"
        searchable
        required
    />
    <Textarea
        label="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.currentTarget.value)}
        minRows={3}
        autosize
        required
    />
    <Group justify="flex-end" mt="xs">
        <Button variant="light" onClick={onClose} color="#a07353ff">Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!isValid} color="#93755E" loading={loading}>
        {mode === "edit" ? "Guardar cambios" : "Crear"}
        </Button>
    </Group>
    </Stack>
</Modal>
);
}
