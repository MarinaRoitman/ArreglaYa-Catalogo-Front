import React from 'react';
import * as MC from '@mantine/core';
import { IconCheck, IconX, IconClockHour4, IconCircleCheck } from '@tabler/icons-react';

// Asegúrate de que reciba todas las props necesarias
const CardsMobile = ({ rows = [], aprobar, rechazar, calificar, type }) => {


  return (
    <MC.Stack>
      {rows.map((row) => (
        <MC.Card shadow="sm" padding="lg" radius="md" withBorder key={row.id}>
          <MC.Group justify="space-between" mb="xs">
            <MC.Text fw={600}>{row.nombre}</MC.Text>
            <MC.Text size="sm" c="dimmed">{row.telefono}</MC.Text>
          </MC.Group>

          <MC.Text size="sm"><MC.Text span fw={600}>Dirección:</MC.Text> {row.direccion}</MC.Text>
          <MC.Text size="sm"><MC.Text span fw={600}>Fecha y Hora:</MC.Text> {row.fechaHora}</MC.Text>

          {/* 1. Muestra tiempo y costo si no estamos en 'solicitudes' */}
          {type !== 'solicitudes' && (
            <>
              <MC.Text size="sm"><MC.Text span fw={600}>Tiempo Estimado:</MC.Text> {row.tiempoEstimado || '-'}</MC.Text>
              <MC.Text size="sm"><MC.Text span fw={600}>Costo Total:</MC.Text> ${row.montoTotal || '-'}</MC.Text>
            </>
          )}

          <MC.Group mt="xs">
            <MC.Badge color="blue" variant="light">{row.servicio}</MC.Badge>
            <MC.Badge color="blue" variant="light">{row.habilidad}</MC.Badge>
          </MC.Group>

        <MC.Group justify="flex-end" gap="xs" mt="sm">
            {/* --- Lógica para Solicitudes --- */}
            {type === 'solicitudes' && (
            <>
                <MC.ActionIcon variant="light" color="teal" aria-label="Aprobar" onClick={() => aprobar?.(row)}>
                <IconCheck size={18} />
                </MC.ActionIcon>
                <MC.ActionIcon variant="light" color="red" aria-label="Rechazar" onClick={() => rechazar?.(row.id)}>
                <IconX size={18} />
                </MC.ActionIcon>
            </>
            )}

            {/* --- Lógica para Confirmados --- */}
            {type === 'confirmados' && (
                row.clienteConfirmo ? (
                <MC.ActionIcon variant="light" color="green" aria-label="Cliente confirmó">
                    <IconCircleCheck size={18} />
                </MC.ActionIcon>
                ) : (
                <MC.ActionIcon variant="light" color="blue" aria-label="Esperando confirmación">
                    <IconClockHour4 size={18} />
                </MC.ActionIcon>
                )
            )}
            
            {/* --- Lógica para Realizados --- */}
            {type === 'realizados' && (
                row.clienteConfirmo ? (
                <MC.ActionIcon variant="light" color="green" aria-label="Realizado y Confirmado">
                    <IconCircleCheck size={18} />
                </MC.ActionIcon>
                ) : (
                <MC.ActionIcon variant="light" color="red" aria-label="Expirado sin confirmar">
                    <IconX size={18} />
                </MC.ActionIcon>
                )
            )}
        </MC.Group>
        </MC.Card>
      ))}
    </MC.Stack>
  );
};

export default CardsMobile;