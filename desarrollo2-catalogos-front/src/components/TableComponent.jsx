import React, { useState } from "react";
import * as MC from "@mantine/core";
import { IconCheck, IconX, IconClockHour4, IconCircleCheck } from "@tabler/icons-react";
import ConfirmarSolicitudModal from "../components/ModalSolicitud";

export default function TableComponent({ rows = [], aprobar, rechazar, type = 'solicitudes' }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const openConfirm = (row) => {
    setSelectedJob(row);
    setConfirmOpen(true);
  };

const handleConfirmSubmit = ({ id, fecha, montoTotal }) => {
    if (typeof aprobar === "function") {
      aprobar(id, { fecha, montoTotal });
    }
    setConfirmOpen(false);
  };

  const showActionsColumn = type === 'solicitudes' || type === 'confirmados';

  return (
    <>
      <MC.Table 
        highlightOnHover 
        striped 
        withColumnBorders
        // Se define un ancho mínimo y un layout fijo para que todas las tablas sean estables.
        // El scroll lo maneja el contenedor en cada página.
        style={{ minWidth: 1200, tableLayout: 'fixed' }} 
      >
        <MC.Table.Thead>
          <MC.Table.Tr>
            <MC.Table.Th style={{ minWidth: "180px" }}><MC.Text fw={600} fz="sm">Nombre y Apellido</MC.Text></MC.Table.Th>
    <MC.Table.Th style={{ minWidth: "120px" }}><MC.Text fw={600} fz="sm">Teléfono</MC.Text></MC.Table.Th>
    <MC.Table.Th style={{ minWidth: "200px" }}><MC.Text fw={600} fz="sm">Dirección</MC.Text></MC.Table.Th>
    <MC.Table.Th style={{ minWidth: "150px" }}><MC.Text fw={600} fz="sm">Fecha y Hora</MC.Text></MC.Table.Th>
    <MC.Table.Th style={{ minWidth: "220px" }}><MC.Text fw={600} fz="sm">Servicio</MC.Text></MC.Table.Th>
    <MC.Table.Th style={{ minWidth: "180px" }}><MC.Text fw={600} fz="sm">Habilidad</MC.Text></MC.Table.Th>
            
            {type !== 'solicitudes' && (
              <MC.Table.Th w={100}><MC.Text fw={600} fz="sm">Tarifa</MC.Text></MC.Table.Th>
            )}

            {/* La columna "Estado" solo se muestra en "Realizados" */}
            {type === 'realizados' && (
              <MC.Table.Th w={120}><MC.Text fw={600} fz="sm">Estado</MC.Text></MC.Table.Th>
            )}
            
            {showActionsColumn && (
              <MC.Table.Th w={120}><MC.Text fw={600} fz="sm">Estado</MC.Text></MC.Table.Th>
            )}
          </MC.Table.Tr>
        </MC.Table.Thead>

        <MC.Table.Tbody>
          {rows.map((row) => (
            <MC.Table.Tr key={row.id}>
              <MC.Table.Td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.nombre}</MC.Table.Td>
              <MC.Table.Td>{row.telefono}</MC.Table.Td>
              <MC.Table.Td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.direccion}</MC.Table.Td>
              <MC.Table.Td>{row.fechaHora}</MC.Table.Td>
              <MC.Table.Td>{row.servicio}</MC.Table.Td>
              <MC.Table.Td>{row.habilidad}</MC.Table.Td>
              
              {type !== 'solicitudes' && <MC.Table.Td>${row.montoTotal || '-'}</MC.Table.Td>}

              {/* La celda de "Estado" solo para "Realizados" */}
              {type === 'realizados' && (
                <MC.Table.Td>
                  <MC.Group gap="xs" justify="center">
                    {row.estado === 'finalizado' ? (
                      <MC.ActionIcon variant="light" color="green" aria-label="Realizado y Confirmado"><IconCircleCheck size={18} /></MC.ActionIcon>
                    ) : (
                      <MC.ActionIcon variant="light" color="red" aria-label="Cancelado"><IconX size={18} /></MC.ActionIcon>
                    )}
                  </MC.Group>
                </MC.Table.Td>
              )}
              
              {/* Celda de "Acciones" para Solicitudes y Confirmados */}
              {showActionsColumn && (
                <MC.Table.Td>
                  <MC.Group gap="xs" justify="center">
                    {type === 'solicitudes' && (
                      <>
                        <MC.ActionIcon variant="light" color="teal" aria-label="Aprobar" onClick={() => openConfirm(row)}><IconCheck size={18} /></MC.ActionIcon>
                        <MC.ActionIcon variant="light" color="red" aria-label="Rechazar" onClick={() => rechazar?.(row.id)}><IconX size={18} /></MC.ActionIcon>
                      </>
                    )}
                    {type === 'confirmados' && (
                      <>
                        {row.estado === 'aprobado_por_usuario' ? (
                      <MC.Badge color="green" variant="light">Confirmado</MC.Badge>
                        ) : (
                      <MC.Badge color="blue" variant="light">Pendiente</MC.Badge>
                        )}
                        <MC.ActionIcon variant="light" color="red" aria-label="Cancelar Pedido" onClick={() => rechazar?.(row.id)}><IconX size={18} /></MC.ActionIcon>
                      </>
                    )}
                  </MC.Group>
                </MC.Table.Td>
              )}
            </MC.Table.Tr>
          ))}
        </MC.Table.Tbody>
      </MC.Table>

      {type === 'solicitudes' && <ConfirmarSolicitudModal opened={confirmOpen} onClose={() => setConfirmOpen(false)} job={selectedJob} onSubmit={handleConfirmSubmit} />}
    </>
  );
}