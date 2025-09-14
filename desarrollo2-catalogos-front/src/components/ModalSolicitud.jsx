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
    
    // --- ¡CORRECCIÓN CLAVE AQUÍ! ---
    // Esta "red de seguridad" asegura que 'fecha' siempre sea un objeto Date válido
    // sin importar lo que devuelva el calendario.
    const fechaAEnviar = new Date(fecha);
    
    onSubmit({
      id: job.id,
      fecha: fechaAEnviar.toISOString(), // Ahora esto siempre funcionará
      montoTotal: parseFloat(montoTotal),
    });
    onClose();
  };

  if (!job) return null;

  return (
    <MC.Modal opened={opened} onClose={onClose} title="Confirmar Solicitud" centered zIndex={1000}>
      <MC.Stack gap="md">
        <MC.Text>Estás a punto de enviar un presupuesto para el trabajo:</MC.Text>
        <MC.Text fw={700}>"{job.servicio}"</MC.Text>
        
        <DateTimePicker
          label="Selecciona nueva fecha y hora"
          placeholder="Elige una fecha"
          value={fecha}
          onChange={setFecha}
          locale="es"
          minDate={new Date()}
          required
          popoverProps={{ zIndex: 1001 }}
        />
        <MC.NumberInput
          label="Costo Total"
          placeholder="Ingresa el monto"
          value={montoTotal}
          onChange={setMontoTotal}
          prefix="$ "
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          required
        />
        <MC.Group justify="flex-end" mt="md">
          <MC.Button variant="default" onClick={onClose}>Cancelar</MC.Button>
          <MC.Button color="#b67747ff" onClick={handleSubmit}>Enviar Presupuesto</MC.Button>
        </MC.Group>
      </MC.Stack>
    </MC.Modal>
  );
}