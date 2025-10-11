import React, { useState } from "react";
import * as MC from "@mantine/core";
import { IconCheck, IconX, IconCircleCheck } from "@tabler/icons-react";
import ConfirmarSolicitudModal from "../components/ModalSolicitud";

export default function TableComponent({ rows = [], aprobar, rechazar, type = "solicitudes" }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const openConfirm = (row) => { setSelectedJob(row); setConfirmOpen(true); };
  const handleConfirmSubmit = ({ id, fecha, montoTotal }) => { aprobar?.(id, { fecha, montoTotal }); setConfirmOpen(false); };

  const showActionsColumn = type === "solicitudes" || type === "confirmados";

  return (
    <>
      {/* Opcional: envolver en Paper para fondo adaptable */}
      <MC.Paper
      p="lg"
      withBorder radius="lg" shadow="sm"
      style={{background: "--app-bg"}}
      >
        <MC.ScrollArea>
          <MC.Table
            highlightOnHover
            striped
            withColumnBorders
            style={(theme) => ({
              minWidth: 1200,
              tableLayout: "fixed",
              // Bordes que se ven bien en ambos modos
              "--tbl-border":
                theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3],
              borderColor: "var(--tbl-border)",
            })}
          >
            <MC.Table.Thead
              style={(theme) => ({
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor:
                  "--app-bg"
              })}
            >
              <MC.Table.Tr>
                <MC.Table.Th style={{ minWidth: 180 }}><MC.Text fw={600} fz="sm">Nombre y Apellido</MC.Text></MC.Table.Th>
                <MC.Table.Th style={{ minWidth: 120 }}><MC.Text fw={600} fz="sm">Teléfono</MC.Text></MC.Table.Th>
                <MC.Table.Th style={{ minWidth: 200 }}><MC.Text fw={600} fz="sm">Dirección</MC.Text></MC.Table.Th>
                <MC.Table.Th style={{ minWidth: 150 }}><MC.Text fw={600} fz="sm">Fecha y Hora</MC.Text></MC.Table.Th>
                <MC.Table.Th style={{ minWidth: 220 }}><MC.Text fw={600} fz="sm">Servicio</MC.Text></MC.Table.Th>
                <MC.Table.Th style={{ minWidth: 180 }}><MC.Text fw={600} fz="sm">Habilidad</MC.Text></MC.Table.Th>

                {type !== "solicitudes" && (
                  <MC.Table.Th style={{ width: 100 }}>
                    <MC.Text fw={600} fz="sm">Tarifa</MC.Text>
                  </MC.Table.Th>
                )}

                {type === "realizados" && (
                  <MC.Table.Th style={{ width: 120 }}>
                    <MC.Text fw={600} fz="sm">Estado</MC.Text>
                  </MC.Table.Th>
                )}

                {showActionsColumn && (
                  <MC.Table.Th style={{ width: 120 }}>
                    <MC.Text fw={600} fz="sm">Estado</MC.Text>
                  </MC.Table.Th>
                )}
              </MC.Table.Tr>
            </MC.Table.Thead>

            <MC.Table.Tbody>
              {rows.map((row) => (
                <MC.Table.Tr key={row.id}>
                  <MC.Table.Td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.nombre}</MC.Table.Td>
                  <MC.Table.Td>{row.telefono}</MC.Table.Td>
                  <MC.Table.Td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.direccion}</MC.Table.Td>
                  <MC.Table.Td>{row.fechaHora}</MC.Table.Td>
                  <MC.Table.Td>{row.servicio}</MC.Table.Td>
                  <MC.Table.Td>{row.habilidad}</MC.Table.Td>

                  {type !== "solicitudes" && <MC.Table.Td>${row.montoTotal ?? "-"}</MC.Table.Td>}

                  {type === "realizados" && (
                    <MC.Table.Td>
                      <MC.Group gap="xs" justify="center">
                        {row.estado === "finalizado" ? (
                          <MC.ActionIcon variant="light" color="green" aria-label="Realizado y Confirmado">
                            <IconCircleCheck size={18} />
                          </MC.ActionIcon>
                        ) : (
                          <MC.ActionIcon variant="light" color="red" aria-label="Cancelado">
                            <IconX size={18} />
                          </MC.ActionIcon>
                        )}
                      </MC.Group>
                    </MC.Table.Td>
                  )}

                  {showActionsColumn && (
                    <MC.Table.Td>
                      <MC.Group gap="xs" justify="center">
                        {type === "solicitudes" && (
                          <>
                            <MC.ActionIcon variant="light" color="teal" aria-label="Aprobar" onClick={() => openConfirm(row)}>
                              <IconCheck size={18} />
                            </MC.ActionIcon>
                            <MC.ActionIcon variant="light" color="red" aria-label="Rechazar" onClick={() => rechazar?.(row.id)}>
                              <IconX size={18} />
                            </MC.ActionIcon>
                          </>
                        )}

                        {type === "confirmados" && (
                          <>
                            {row.estado === "aprobado_por_usuario" ? (
                              <MC.Badge color="green" variant="light">Confirmado</MC.Badge>
                            ) : (
                              <MC.Badge color="blue" variant="light">Pendiente</MC.Badge>
                            )}
                            <MC.ActionIcon variant="light" color="red" aria-label="Cancelar Pedido" onClick={() => rechazar?.(row.id)}>
                              <IconX size={18} />
                            </MC.ActionIcon>
                          </>
                        )}
                      </MC.Group>
                    </MC.Table.Td>
                  )}
                </MC.Table.Tr>
              ))}
            </MC.Table.Tbody>
          </MC.Table>
        </MC.ScrollArea>
      </MC.Paper>

      {type === "solicitudes" && (
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
