import React, { useEffect, useState } from "react";
import {
Modal,
Stack,
Text,
Select,
Group,
Button,
TextInput,
Textarea,
Divider,
SegmentedControl,
} from "@mantine/core";
import { API_URL } from "../Api/api";
import { listHabilidades, createHabilidad } from "../Api/habilidades";

export default function ModalHabilidad({
opened,
onClose,
onSelect, // callback que devuelve la habilidad creada o elegida
habilidadesActuales = [],
loading = false,
}) {
const [modo, setModo] = useState("existente");

// habilidades existentes
const [habilidades, setHabilidades] = useState([]);
const [habilidadId, setHabilidadId] = useState("");

// rubros
const [rubros, setRubros] = useState([]);
const [idRubro, setIdRubro] = useState("");

// campos nueva habilidad
const [nombre, setNombre] = useState("");
const [descripcion, setDescripcion] = useState("");

useEffect(() => {
if (!opened) return;

const fetchData = async () => {
    try {
    // 🔹 habilidades
    const data = await listHabilidades();
    const actualesIds = new Set(habilidadesActuales.map((h) => h.id));
    setHabilidades(data.filter((h) => !actualesIds.has(h.id)));

    // 🔹 rubros
    const token = localStorage.getItem("token");
    const resRubros = await fetch(`${API_URL}rubros/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resRubros.ok) throw new Error("Error al traer rubros");
    const rubrosData = await resRubros.json();
    setRubros(rubrosData.map((r) => ({ value: String(r.id), label: r.nombre })));
    } catch (err) {
    console.error("Error cargando datos:", err.message);
    }
};

fetchData();

// limpiar formulario al abrir
setModo("existente");
setHabilidadId("");
setIdRubro("");
setNombre("");
setDescripcion("");
}, [opened, habilidadesActuales]);

const handleSubmit = async () => {
try {
    if (modo === "existente") {
    if (!habilidadId) return;
    const habilidad = habilidades.find((h) => String(h.id) === habilidadId);
    if (habilidad) onSelect?.(habilidad);
    } else {
    if (!nombre || !idRubro) {
        alert("Falta completar nombre y rubro");
        return;
    }
    const nueva = await createHabilidad({
        nombre,
        descripcion,
        id_rubro: parseInt(idRubro, 10),
    });
    onSelect?.(nueva);
    }
} catch (err) {
    console.error("Error en submit:", err.message);
    alert("No se pudo guardar la habilidad");
}
};

return (
<Modal
    opened={opened}
    onClose={onClose}
    centered
    radius="lg"
    withCloseButton
    title={<Text fw={700}>Agregar habilidad</Text>}
>
    <Stack>
    <SegmentedControl
        fullWidth
        value={modo}
        onChange={setModo}
        data={[
        { label: "Existente", value: "existente" },
        { label: "Nueva", value: "nueva" },
        ]}
    />

    {modo === "existente" && (
        <Select
        label="Habilidades disponibles"
        data={habilidades.map((h) => ({ value: String(h.id), label: h.nombre }))}
        value={habilidadId}
        onChange={setHabilidadId}
        searchable
        placeholder="Seleccioná una habilidad"
        />
    )}

    {modo === "nueva" && (
        <>
        <TextInput
            label="Nombre de la habilidad"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
        />
        <Textarea
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            minRows={2}
        />
        <Select
            label="Rubro"
            data={rubros}
            value={idRubro}
            onChange={setIdRubro}
            searchable
            placeholder="Seleccioná un rubro"
            required
        />
        </>
    )}

    <Divider />
    <Group justify="flex-end">
        <Button variant="light" onClick={onClose} color="#a07353ff">
        Cancelar
        </Button>
        <Button
        onClick={handleSubmit}
        disabled={modo === "existente" ? !habilidadId : !nombre || !idRubro}
        loading={loading}
        color="#93755E"
        >
        {modo === "existente" ? "Vincular" : "Crear y vincular"}
        </Button>
    </Group>
    </Stack>
</Modal>
);
}
