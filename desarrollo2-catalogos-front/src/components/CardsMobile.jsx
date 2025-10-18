
import React from 'react';
import * as MC from '@mantine/core';
import { IconCheck, IconX, IconClockHour4, IconCircleCheck, IconBell } from '@tabler/icons-react';

const CardsMobile = ({ rows = [], aprobar, rechazar, calificar, type }) => {
const isCritico = (v) => Number(v) === 1;

  return (
    <MC.Stack>
      {rows.map((row) => (
        <MC.Card shadow="sm" padding="lg" radius="md" withBorder key={row.id}>
          <MC.Group justify="space-between" mb="xs">
            <MC.Text fw={600}>{row.nombre}</MC.Text>

        {isCritico(row?.critico) && (
          <MC.Badge
            leftSection={<IconBell size={14} />}
            variant="light"
            styles={{
              root: { background: "#fff7e0", borderColor: "#f2c94c" },
              label: { color: "#8a6d00" },
            }}
          >
            Crítico
          </MC.Badge>
            )}
          </MC.Group>

          <MC.Text size="sm">
            <MC.Text span fw={600}>Teléfono:</MC.Text> {row.telefono}
          </MC.Text>
          <MC.Text size="sm">
            <MC.Text span fw={600}>Dirección:</MC.Text> {row.direccion}
          </MC.Text>
          <MC.Text size="sm">
            <MC.Text span fw={600}>Fecha y Hora:</MC.Text> {row.fechaHora}
          </MC.Text>

          {type !== 'solicitudes' && (
            <>
              <MC.Text size="sm">
                <MC.Text span fw={600}>Tiempo Estimado:</MC.Text> {row.tiempoEstimado || '-'}
              </MC.Text>
              <MC.Text size="sm">
                <MC.Text span fw={600}>Costo Total:</MC.Text> ${row.montoTotal || '-'}
              </MC.Text>
            </>
          )}

          <MC.Group mt="xs">
            <MC.Badge color="blue" variant="light">{row.servicio}</MC.Badge>
            <MC.Badge color="blue" variant="light">{row.habilidad}</MC.Badge>
          </MC.Group>

          <MC.Group justify="flex-end" gap="xs" mt="sm">
            {type === 'solicitudes' && (
              <>
                <MC.ActionIcon
                  variant="light"
                  color="teal"
                  aria-label="Aprobar"
                  onClick={() => aprobar?.(row)}
                >
                  <IconCheck size={18} />
                </MC.ActionIcon>
                <MC.ActionIcon
                  variant="light"
                  color="red"
                  aria-label="Rechazar"
                  onClick={() => rechazar?.(row.id)}
                >
                  <IconX size={18} />
                </MC.ActionIcon>
              </>
            )}

            {type === 'confirmados' && (
              <>
                {row.clienteConfirmo ? (
                  <MC.ActionIcon variant="light" color="green" aria-label="Cliente confirmó">
                    <IconCircleCheck size={18} />
                  </MC.ActionIcon>
                ) : (
                  <MC.ActionIcon variant="light" color="blue" aria-label="Esperando confirmación">
                    <IconClockHour4 size={18} />
                  </MC.ActionIcon>
                )}

                <MC.ActionIcon
                  variant="light"
                  color="red"
                  aria-label="Rechazar"
                  onClick={() => rechazar?.(row.id)}
                >
                  <IconX size={18} />
                </MC.ActionIcon>
              </>
            )}

            {type === 'realizados' && (
              row.clienteConfirmo ? (
                <MC.ActionIcon
                  variant="light"
                  color="green"
                  aria-label="Realizado y Confirmado"
                  onClick={() => calificar?.(row.id)}
                >
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
