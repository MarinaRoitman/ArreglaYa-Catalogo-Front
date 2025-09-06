import React from "react";
import { Card, Group, Text, Badge, Stack, ActionIcon } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function CardsMobile({ rows, aprobar, rechazar }) {
return (
<Stack gap="sm">
    {rows.map((row) => (
    <Card key={row.id} withBorder radius="md">
        <Group justify="space-between" mb="xs">
        <Text fw={600}>{row.nombre}</Text>
        <Text size="sm" c="dimmed">{row.telefono}</Text>
        </Group>

        <Text size="sm"><Text span fw={600}>Dirección:</Text> {row.direccion}</Text>
        <Text size="sm"><Text span fw={600}>Fecha y Hora:</Text> {row.fechaHora}</Text>
        <Group gap="xs" mt={6}>
        <Badge variant="light">{row.servicio}</Badge>
        <Badge variant="light">{row.habilidad}</Badge>
        </Group>

        <Group justify="flex-end" gap="xs" mt="sm">
        <ActionIcon variant="light" color="teal" aria-label="Aprobar" onClick={() => aprobar(row.id)}>
            <IconCheck size={18} />
        </ActionIcon>
        <ActionIcon variant="light" color="red" aria-label="Rechazar" onClick={() => rechazar(row.id)}>
            <IconX size={18} />
        </ActionIcon>
        </Group>
    </Card>
    ))}
</Stack>
);
}
