import React, { useEffect, useState } from "react";
import {
Modal,
Stack,
Text,
Select,
Group,
Button,
} from "@mantine/core";
import { API_URL } from "../Api/api";

export default function ModalHabilidad({
opened,
onClose,
onSelect, // callback con la habilidad seleccionada
loading = false,
habilidadesActuales = [], // lista de habilidades ya asociadas al prestador
}) {
const [habilidades, setHabilidades] = useState([]);
const [habilidadId, setHabilidadId] = useState("");

// cargar habilidades disponibles
useEffect(() => {
if (!opened) return;

const fetchHabilidades = async () => {
    try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}habilidades/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al traer habilidades");
    const data = await res.json();

    // filtrar las ya asociadas al prestador
    const actualesIds = new Set(habilidadesActuales.map((h) => h.id));
    const disponibles = data.filter((h) => !actualesIds.has(h.id));

    setHabilidades(disponibles);
    } catch (err) {
    console.error("Error cargando habilidades:", err.message);
    }
};

fetchHabilidades();
setHabilidadId(""); 
}, [opened, habilidadesActuales]);

const opcionesHabilidades = habilidades.map((h) => ({
  value: String(h.id),
  label: h.nombre, 
}));

const handleSubmit = () => {
if (!habilidadId) return;
const habilidad = habilidades.find((h) => String(h.id) === habilidadId);
if (habilidad) {
    onSelect?.(habilidad);
}
};

return (
<Modal
    opened={opened}
    onClose={onClose}
    centered
    radius="lg"
    withCloseButton
    title={<Text fw={700}>Vincular habilidad</Text>}
>
    <Stack>
    <Select
        label="Habilidades disponibles"
        data={opcionesHabilidades}
        value={habilidadId}
        onChange={setHabilidadId}
        placeholder="Seleccioná una habilidad"
        searchable
        required
    />

    <Group justify="flex-end" mt="xs">
        <Button variant="light" onClick={onClose} color="#a07353ff">
        Cancelar
        </Button>
        <Button
        onClick={handleSubmit}
        disabled={!habilidadId}
        color="#93755E"
        loading={loading}
        >
        Vincular
        </Button>
    </Group>
    </Stack>
</Modal>
);
}
