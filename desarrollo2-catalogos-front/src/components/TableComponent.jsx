import React, { useState } from "react";
import * as MC from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import ConfirmarSolicitudModal from "../components/ModalSolicitud";

export default function TableComponent({ rows = [], aprobar, rechazar }) {
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
        <MC.Table.Thead>
        <MC.Table.Tr>
            <MC.Table.Th>
            <MC.Text fw={600} fz="sm" ta="center">Nombre y Apellido</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th>
            <MC.Text fw={600} fz="sm" ta="center">Teléfono</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th>
            <MC.Text fw={600} fz="sm" ta="center">Dirección</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th>
            <MC.Text fw={600} fz="sm" ta="center">Fecha y Hora</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th>
            <MC.Text fw={600} fz="sm" ta="center">Servicio</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th>
            <MC.Text fw={600} fz="sm" ta="center">Habilidad</MC.Text>
            </MC.Table.Th>
            <MC.Table.Th>
            <MC.Text fw={600} fz="sm" ta="center">Acciones</MC.Text>
            </MC.Table.Th>
        </MC.Table.Tr>
        </MC.Table.Thead>

        <MC.Table.Tbody>
        {rows.map((row) => (
            <MC.Table.Tr key={row.id}>
            <MC.Table.Td>{row.nombre}</MC.Table.Td>
            <MC.Table.Td>{row.telefono}</MC.Table.Td>
            <MC.Table.Td>{row.direccion}</MC.Table.Td>
            <MC.Table.Td>{row.fechaHora}</MC.Table.Td>
            <MC.Table.Td>{row.servicio}</MC.Table.Td>
            <MC.Table.Td>{row.habilidad}</MC.Table.Td>
            <MC.Table.Td>
                <MC.Group gap="xs" justify="center">
                <MC.ActionIcon
                    variant="light"
                    color="teal"
                    aria-label="Aprobar"
                    onClick={() => openConfirm(row)}
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
                </MC.Group>
            </MC.Table.Td>
            </MC.Table.Tr>
        ))}
        </MC.Table.Tbody>
    </MC.Table>
    </MC.ScrollArea>

    {/* Modal */}
    <ConfirmarSolicitudModal
    opened={confirmOpen}
    onClose={() => setConfirmOpen(false)}
    job={selectedJob}
    onSubmit={handleConfirmSubmit}
    />
</>
);
}
