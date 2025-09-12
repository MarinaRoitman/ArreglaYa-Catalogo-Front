import React, { useState, useEffect } from "react";
import * as MC from "@mantine/core";
import { DateTimePicker } from '@mantine/dates';
import 'dayjs/locale/es';

export default function ConfirmarSolicitudModal({ opened, onClose, job, onSubmit }) {
  const [fecha, setFecha] = useState(null);
  const [montoTotal, setMontoTotal] = useState("");

  useEffect(() => {
    if (job) {
      setFecha(job.fecha ? new Date(job.fecha) : new Date());
      setMontoTotal(job.montoTotal || "");
    }
  }, [job]);

  const handleSubmit = () => {
    if (!fecha || !montoTotal) {
      alert("Por favor, completa la fecha y el monto.");
      return;
    }
    onSubmit({
      id: job.id,
      fecha: fecha.toISOString(),
      montoTotal: parseFloat(montoTotal),
    });
    onClose();
  };

  if (!job) return null;

  return (
    <MC.Modal opened={opened} onClose={onClose} title="Enviar Presupuesto" centered radius="md" zIndex={1000}>
      <MC.Stack gap="md">
        <MC.Paper withBorder p="sm" radius="sm" bg="gray.0">
          <MC.Text size="sm">Propuesta para el trabajo:</MC.Text>
          <MC.Text fw={700} size="lg">"{job.habilidad || job.servicio}"</MC.Text>
          <MC.Text size="sm" c="dimmed">Cliente: {job.nombre}</MC.Text>
        </MC.Paper>
        <MC.Divider my="xs" />
        <DateTimePicker
          label="Nueva Fecha y Hora Propuesta"
          placeholder="Elige una fecha y hora"
          value={fecha}
          onChange={setFecha}
          locale="es"
          minDate={new Date()}
          required
          popoverProps={{ zIndex: 1001 }}
        />
        <MC.NumberInput
          label="Costo Total del Trabajo"
          placeholder="Ingresa el monto final"
          value={montoTotal}
          onChange={setMontoTotal}
          prefix="$ "
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          required
          mt="md"
        />
        <MC.Group justify="flex-end" mt="xl">
          <MC.Button variant="default" onClick={onClose}>Cancelar</MC.Button>
          <MC.Button color="#b67747ff" onClick={handleSubmit}>Enviar Presupuesto</MC.Button>
        </MC.Group>
      </MC.Stack>
    </MC.Modal>
  );
}