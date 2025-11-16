import React, { useEffect, useState } from "react";
import { Modal, Text, TextInput, Grid, Group, Button, Stack, Alert, MultiSelect } from "@mantine/core";
import { fetchZonas } from "../Api/zonas";

const MAX = 30;

const onlyDigits = (v = "") => v.replace(/\D+/g, "");
const onlyLetters = (v = "") => v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");

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
    estado: "",
    ciudad: "",
    calle: "",
    numero: "",
    piso: "",
    departamento: "",
    dni: "",
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
  });

  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [zonasSeleccionadasIds, setZonasSeleccionadasIds] = useState([]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!opened) return;

    const loadZonas = async () => {
      try {
        const zonasData = await fetchZonas();
        setZonasDisponibles(
          zonasData.map((z) => ({ value: String(z.id), label: z.nombre }))
        );
      } catch (error) {
        console.error("Error al cargar zonas:", error);
      }
    };
    loadZonas();

    // zonas iniciales
    const initialZonaIds = (initialData?.zonas || []).map((z) => String(z.id));
    setZonasSeleccionadasIds(initialZonaIds);

    // mapeo inicial de valores
    const next = {
      nombre: initialData?.nombre ?? "",
      apellido: initialData?.apellido ?? "",
      email: initialData?.email ?? initialData?.mail ?? "",
      telefono: initialData?.telefono ?? initialData?.celular ?? "",
      estado: initialData?.estado ?? "",
      ciudad: initialData?.ciudad ?? "",
      calle: initialData?.calle ?? initialData?.direccion_calle ?? initialData?.direccion?.calle ?? "",
      numero: (initialData?.numero ?? initialData?.direccion_numero ?? initialData?.direccion?.numero ?? "").toString(),
      piso: (initialData?.piso ?? "").toString(),
      departamento: (initialData?.departamento ?? "").toString(),
      dni: initialData?.dni ?? initialData?.documento ?? "",
    };

    // recortes a MAX
    Object.keys(next).forEach((k) => {
      if (typeof next[k] === "string") next[k] = next[k].slice(0, MAX);
    });

    setValues(next);
    setErrors({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      estado: "",
      ciudad: "",
      calle: "",
      numero: "",
    });
    setFormError("");
  }, [opened, initialData]);

  const validateField = (key, rawVal) => {
    const val = (rawVal ?? "").toString().trim();

    // requeridos
    if (key === "nombre") return val ? "" : "El nombre es obligatorio.";
    if (key === "apellido") return val ? "" : "El apellido es obligatorio.";

    if (key === "email") {
      if (!val) return "El email es obligatorio.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? "" : "Ingresá un e-mail válido.";
    }

    if (key === "telefono") {
      if (!val) return "El teléfono es obligatorio.";
      if (!/^\d+$/.test(val)) return "El teléfono debe tener solo números.";
      return "";
    }

    if (key === "estado") return val ? "" : "El estado/provincia es obligatorio.";
    if (key === "ciudad") return val ? "" : "La ciudad es obligatoria.";
    if (key === "calle") return val ? "" : "La calle es obligatoria.";

    // numero: opcional, pero si está, solo dígitos
    if (key === "numero") {
      if (!val) return "";
      return /^\d+$/.test(val) ? "" : "El número debe ser numérico (o dejar vacío).";
    }

    // zonas (array) validación desde el submit
    if (key === "zonas") {
      return Array.isArray(rawVal) && rawVal.length > 0
        ? ""
        : "Debe seleccionar al menos una zona.";
    }

    return "";
  };

  const validateAll = (data = values) => {
    const nextErrors = {
      nombre: validateField("nombre", data.nombre),
      apellido: validateField("apellido", data.apellido),
      email: validateField("email", data.email),
      telefono: validateField("telefono", data.telefono),
      estado: validateField("estado", data.estado),
      ciudad: validateField("ciudad", data.ciudad),
      calle: validateField("calle", data.calle),
      numero: validateField("numero", data.numero)
    };
    const zonasErr = validateField("zonas", zonasSeleccionadasIds);

    const isValid =
      Object.values(nextErrors).every((e) => !e) && !zonasErr;

    setErrors(nextErrors);
    setFormError(isValid ? "" : zonasErr || "Revisá los campos marcados.");
    return isValid;
  };

  const handleChange = (field) => (e) => {
    let val = e?.currentTarget?.value ?? "";

    if (field === "telefono" || field === "numero") {
      val = val.replace(/[^\d]/g, "");
    }

    if (typeof val === "string") val = val.slice(0, MAX);

    setValues((prev) => ({ ...prev, [field]: val }));
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
      estado: values.estado.trim(),
      ciudad: values.ciudad.trim(),
      calle: values.calle.trim(),
      numero: values.numero.trim(), // puede ir vacio
      piso: values.piso.trim(), // opcional
      departamento: values.departamento.trim(), // opcional
      zonas: zonasSeleccionadasIds.map((id) => parseInt(id, 10)),
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
              maxLength={10}
              inputMode="numeric"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Estado / Provincia"
              withAsterisk
              value={values.estado}
              onChange={handleChange("estado")}
              error={errors.estado}
              disabled={loading}
              maxLength={MAX}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Ciudad"
              withAsterisk
              value={values.ciudad}
              onChange={handleChange("ciudad")}
              error={errors.ciudad}
              disabled={loading}
              maxLength={MAX}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 8 }}>
            <TextInput
              label="Calle"
              withAsterisk
              value={values.calle}
              onChange={handleChange("calle")}
              error={errors.calle}
              disabled={loading}
              maxLength={MAX}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextInput
              label="Número (opcional)"
              value={values.numero}
              onChange={handleChange("numero")}
              error={errors.numero}
              disabled={loading}
              maxLength={4}
              inputMode="numeric"
              placeholder="Ej: 213"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Piso (opcional)"
            value={values.piso}
            onChange={(e) => {
              let v = onlyDigits(e.target.value).slice(0, 3); // ← solo números y máx 3
              setValues((prev) => ({ ...prev, piso: v }));
            }}
            disabled={loading}
            placeholder="Ej: 3"
            maxLength={3}
          />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Departamento (opcional)"
              value={values.departamento}
              onChange={(e) => {
                let v = onlyLetters(e.target.value).toUpperCase().slice(0, 2);
                setValues((prev) => ({ ...prev, departamento: v }));
              }}
              disabled={loading}
              placeholder="Ej: B"
              maxLength={2}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="DNI"
              value={values.dni}
              disabled
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
