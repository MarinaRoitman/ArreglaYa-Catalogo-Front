import React from "react";
import * as MC from "@mantine/core";
import { IconBell, IconCheck, IconX } from "@tabler/icons-react";

export default function TableComponent({ rows = [], type, aprobar, rechazar }) {
  const isCritico = (v) => Number(v) === 1;

  const isSolicitudes = type === "solicitudes";
  //const isConfirmados = type === "confirmados";
  const isRealizados = type === "realizados";

  const handleRechazar = (row) => {
    if (!rechazar) return;
    rechazar(row.id);
  };

  return (
    <MC.Box style={{ maxWidth: "100%", overflowX: "auto" }}>
      <MC.ScrollArea.Autosize mah="70vh" type="hover" scrollbarSize={10} offsetScrollbars>
        <MC.Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          stickyHeader
          horizontalSpacing="sm"
          verticalSpacing="xs"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <MC.Table.Thead>
            <MC.Table.Tr>
              <MC.Table.Th style={{ minWidth: 160, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">
                  Nombre y Apellido
                </MC.Text>
              </MC.Table.Th>
              <MC.Table.Th style={{ minWidth: 110, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">
                  Teléfono
                </MC.Text>
              </MC.Table.Th>
              <MC.Table.Th style={{ minWidth: 160, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">
                  Dirección
                </MC.Text>
              </MC.Table.Th>
              <MC.Table.Th style={{ minWidth: 140, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">
                  Fecha y Hora
                </MC.Text>
              </MC.Table.Th>
              <MC.Table.Th style={{ minWidth: 180, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">
                  Servicio
                </MC.Text>
              </MC.Table.Th>
              <MC.Table.Th style={{ minWidth: 150, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">
                  Habilidad
                </MC.Text>
              </MC.Table.Th>
              <MC.Table.Th style={{ width: 80, textAlign: "center" }}>
                <MC.Text fw={600} fz="sm" ta="center">
                  Crítico
                </MC.Text>
              </MC.Table.Th>

              {/* Columna Acciones: solo visible en solicitudes */}
              {isSolicitudes && (
                <MC.Table.Th style={{ width: 100, textAlign: "center" }}>
                  <MC.Text fw={600} fz="sm" ta="center">
                    Acciones
                  </MC.Text>
                </MC.Table.Th>
              )}
              {/* {isConfirmados && (
                <MC.Table.Th style={{ width: 100, textAlign: "center" }}>
                  <MC.Text fw={600} fz="sm" ta="center">
                    Acciones
                  </MC.Text>
                </MC.Table.Th>
              )} */}
            </MC.Table.Tr>
          </MC.Table.Thead>

          <MC.Table.Tbody>
            {rows.map((row) => (
              <MC.Table.Tr key={row.id ?? Math.random()}>
                <MC.Table.Td>
                  <MC.Text fz="sm" ta="center" lineClamp={1}>
                    {row?.nombre ?? "—"}
                  </MC.Text>
                </MC.Table.Td>
                <MC.Table.Td>
                  <MC.Text fz="sm" ta="center">
                    {row?.telefono ?? "—"}
                  </MC.Text>
                </MC.Table.Td>
                <MC.Table.Td>
                  <MC.Text fz="sm" ta="center" lineClamp={1}>
                    {row?.direccion ?? "—"}
                  </MC.Text>
                </MC.Table.Td>
                <MC.Table.Td>
                  <MC.Text fz="sm" ta="center">
                    {row?.fechaHora ?? "—"}
                  </MC.Text>
                </MC.Table.Td>
                <MC.Table.Td>
                  <MC.Text fz="sm" ta="center" lineClamp={4}>
                    {row?.servicio ?? "—"}
                  </MC.Text>
                </MC.Table.Td>
                <MC.Table.Td>
                  <MC.Badge
                    variant="light"
                    style={{ display: "block", margin: "0 auto", width: "fit-content" }}
                  >
                    {row?.habilidad ?? "—"}
                  </MC.Badge>
                </MC.Table.Td>

                {/* Columna crítico */}
                <MC.Table.Td style={{ textAlign: "center" }}>
                  {isCritico(row?.critico) ? (
                    <MC.Tooltip label="Pedido crítico" withArrow>
                      <MC.ActionIcon
                        variant="subtle"
                        aria-label="Pedido crítico"
                        data-testid="critico-icon"
                        style={{ color: "#f2c94c" }}
                        size="md"
                        radius="xl"
                      >
                        <IconBell size={37} />
                      </MC.ActionIcon>
                    </MC.Tooltip>
                  ) : (
                    <span style={{ opacity: 0.35 }}>—</span>
                  )}
                </MC.Table.Td>

                {/* Columna Acciones para confirmados */}
                {isSolicitudes && (
                  <MC.Table.Td style={{ textAlign: "center" }}>
                    <MC.Group gap={6} justify="center" wrap="nowrap">
                      {typeof aprobar === "function" && (
                        <MC.ActionIcon
                          size="md"
                          variant="filled"
                          aria-label="Aprobar"
                          onClick={() => aprobar(row)}
                          styles={{
                            root: {
                              background: "#b67747",
                              "&:hover": { background: "#a86b3f" },
                            },
                          }}
                          radius="md"
                        >
                          <IconCheck size={16} />
                        </MC.ActionIcon>
                      )}
                      {typeof rechazar === "function" && (
                        <MC.ActionIcon
                          size="md"
                          variant="light"
                          color="#ff0000ff"
                          aria-label="Rechazar"
                          onClick={() => handleRechazar(row)}
                          radius="md"
                        >
                          <IconX size={16} />
                        </MC.ActionIcon>
                      )}
                    </MC.Group>
                  </MC.Table.Td>
                )}

                {/* {isConfirmados && (
                  <MC.Table.Td style={{ textAlign: "center" }}>
                    <MC.Group gap={6} justify="center" wrap="nowrap">
                      <MC.ActionIcon
                        size="md"
                        variant="light"
                        color="#ff0000ff"
                        aria-label="Rechazar"
                        onClick={() => handleRechazar(row)}
                        radius="md"
                      >
                        <IconX size={16} />
                      </MC.ActionIcon>
                    </MC.Group>
                  </MC.Table.Td>
                )} */}
              </MC.Table.Tr>
            ))}

            {(!rows || rows.length === 0) && (
              <MC.Table.Tr>
                <MC.Table.Td colSpan={isRealizados ? 7 : 8}>
                  <MC.Text ta="center" c="dimmed" py="md">
                    No hay datos para mostrar
                  </MC.Text>
                </MC.Table.Td>
              </MC.Table.Tr>
            )}
          </MC.Table.Tbody>
        </MC.Table>
      </MC.ScrollArea.Autosize>
    </MC.Box>
  );
}
