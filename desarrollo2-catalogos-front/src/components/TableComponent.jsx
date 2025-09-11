import React, { useState } from "react";
import * as MC from "@mantine/core";
import { IconCheck, IconX, IconClockHour4, IconCircleCheck } from "@tabler/icons-react";
import ConfirmarSolicitudModal from "../components/ModalSolicitud";

// Recibimos todas las props necesarias, con 'type' por defecto para no romper nada
export default function TableComponent({ rows = [], aprobar, rechazar, calificar, type = 'solicitudes' }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const openConfirm = (row) => {
    setSelectedJob(row);
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = ({ id, tiempoEstimado, montoTotal }) => {
    if (typeof aprobar === "function") {
      aprobar(id, { tiempoEstimado, montoTotal });
    }
    setConfirmOpen(false);
  };

  return (
    <>
      <MC.ScrollArea>
        <MC.Table highlightOnHover striped withColumnBorders>
          {/* === ENCABEZADOS DE LA TABLA === */}
          <MC.Table.Thead>
            <MC.Table.Tr>
              <MC.Table.Th><MC.Text fw={600} fz="sm" ta="center">Nombre y Apellido</MC.Text></MC.Table.Th>
              <MC.Table.Th><MC.Text fw={600} fz="sm" ta="center">Teléfono</MC.Text></MC.Table.Th>
              <MC.Table.Th><MC.Text fw={600} fz="sm" ta="center">Dirección</MC.Text></MC.Table.Th>
              <MC.Table.Th><MC.Text fw={600} fz="sm" ta="center">Fecha y Hora</MC.Text></MC.Table.Th>
              <MC.Table.Th><MC.Text fw={600} fz="sm" ta="center">Servicio</MC.Text></MC.Table.Th>
              <MC.Table.Th><MC.Text fw={600} fz="sm" ta="center">Habilidad</MC.Text></MC.Table.Th>
              
              {/* Columnas que solo aparecen en Confirmados y Realizados */}
              {type !== 'solicitudes' && (
                <>
                  <MC.Table.Th><MC.Text fw={600} fz="sm" ta="center">Tiempo Estimado</MC.Text></MC.Table.Th>
                  <MC.Table.Th><MC.Text fw={600} fz="sm" ta="center">Tarifa</MC.Text></MC.Table.Th>
                </>
              )}

              <MC.Table.Th><MC.Text fw={600} fz="sm" ta="center">Estados</MC.Text></MC.Table.Th>
            </MC.Table.Tr>
          </MC.Table.Thead>

          {/* === CUERPO DE LA TABLA === */}
          <MC.Table.Tbody>
            {rows.map((row) => (
              <MC.Table.Tr key={row.id}>
                <MC.Table.Td>{row.nombre}</MC.Table.Td>
                <MC.Table.Td>{row.telefono}</MC.Table.Td>
                <MC.Table.Td>{row.direccion}</MC.Table.Td>
                <MC.Table.Td>{row.fechaHora}</MC.Table.Td>
                <MC.Table.Td>{row.servicio}</MC.Table.Td>
                <MC.Table.Td>{row.habilidad}</MC.Table.Td>

                {/* Celdas que solo aparecen en Confirmados y Realizados */}
                {type !== 'solicitudes' && (
                  <>
                    <MC.Table.Td>{row.tiempoEstimado || '-'}</MC.Table.Td>
                    <MC.Table.Td>${row.montoTotal || '-'}</MC.Table.Td>
                  </>
                )}

                <MC.Table.Td>
                <MC.Group gap="xs" justify="center">
                {/* --- Lógica para Solicitudes (sin cambios) --- */}
                {type === 'solicitudes' && (
                    <>
                    <MC.ActionIcon variant="light" color="teal" aria-label="Aprobar" onClick={() => openConfirm(row)}>
                        <IconCheck size={18} />
                    </MC.ActionIcon>
                    <MC.ActionIcon variant="light" color="red" aria-label="Rechazar" onClick={() => rechazar?.(row.id)}>
                        <IconX size={18} />
                    </MC.ActionIcon>
                    </>
                )}

                {/* --- Lógica para Confirmados (sin cambios) --- */}
                {type === 'confirmados' && (
                    row.clienteConfirmo ? (
                    <MC.ActionIcon variant="light" color="green" aria-label="Cliente confirmó">
                        <IconCircleCheck size={18} />
                    </MC.ActionIcon>
                    ) : (
                    <MC.ActionIcon variant="light" color="blue" aria-label="Esperando confirmación del cliente">
                        <IconClockHour4 size={18} />
                    </MC.ActionIcon>
                    )
                )}

                {/* --- Lógica para Realizados (CORREGIDA) --- */}
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
                </MC.Table.Td>
              </MC.Table.Tr>
            ))}
          </MC.Table.Tbody>
        </MC.Table>
      </MC.ScrollArea>

      {/* El modal solo se muestra en la página de solicitudes */}
      {type === 'solicitudes' && (
        <ConfirmarSolicitudModal
          opened={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          job={selectedJob}
          onSubmit={handleConfirmSubmit}
        />
      )}
    </>
  );
}