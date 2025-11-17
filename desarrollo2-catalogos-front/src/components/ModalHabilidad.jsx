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

const onlyLetters = (v = "") =>
v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "");

export default function ModalHabilidad({
opened,
onClose,
onSelect,
habilidadesActuales = [],
loading = false,
}) {
const [modo, setModo] = useState("existente");

const [habilidades, setHabilidades] = useState([]);
const [habilidadId, setHabilidadId] = useState("");

const [rubros, setRubros] = useState([]);
const [idRubro, setIdRubro] = useState("");

const [nombre, setNombre] = useState("");
const [descripcion, setDescripcion] = useState("");

useEffect(() => {
  if (!opened) return;

  const fetchData = async () => {
    try {
      const data = await listHabilidades();

      const actualesIds = new Set(habilidadesActuales.map((h) => h.id));
      setHabilidades(
        data.filter((h) => h.activo === true && !actualesIds.has(h.id))
      );

      const token = localStorage.getItem("token");

      // rubros
      const resRubros = await fetch(`${API_URL}rubros/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rubrosData = await resRubros.json();
      setRubros(
        rubrosData.map((r) => ({ value: String(r.id), label: r.nombre }))
      );
    } catch (err) {
      console.error("Error cargando datos:", err.message);
    }
  };

  fetchData();

  // reset
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
    if (!nombre.trim() || !idRubro) {
        alert("Falta completar nombre y rubro");
        return;
    }

    const nueva = await createHabilidad({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
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
        data={habilidades.map((h) => ({
            value: String(h.id),
            label: h.nombre,
        }))}
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
            maxLength={30}
            onChange={(e) => setNombre(onlyLetters(e.target.value))}
            required
        />

        <Textarea
            label="Descripción"
            value={descripcion}
            maxLength={40}
            onChange={(e) => setDescripcion(onlyLetters(e.target.value))}
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
        disabled={
            modo === "existente" ? !habilidadId : !nombre || !idRubro
        }
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
