import React from "react";
import { Card, Group, Text, ActionIcon, SimpleGrid, Skeleton } from "@mantine/core";
import { IconPencil, IconX } from "@tabler/icons-react";

export default function CardsHabilidad({
rows = [],
onEdit,
onDelete,
loading = false,
skeletonRows = 6,
}) {
return (
<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
    {(loading ? Array.from({ length: skeletonRows }) : rows).map((r, i) =>
    loading ? (
        <Card key={i} withBorder radius="md" p="md">
        <Skeleton height={14} width="60%" mb="xs" />
        <Skeleton height={12} width="40%" />
        <Group justify="flex-end" mt="sm" gap="xs">
            <Skeleton height={30} width={30} circle />
            <Skeleton height={30} width={30} circle />
        </Group>
        </Card>
    ) : (
        <Card key={r.id} withBorder radius="md" p="md">
        <Text fw={600}>{r.nombre}</Text>
        <Text size="sm" c="dimmed">{r.servicio}</Text>
        <Group justify="flex-end" mt="sm" gap="xs">
            <ActionIcon variant="light" color="indigo" onClick={() => onEdit?.(r)}>
            <IconPencil size={18} />
            </ActionIcon>
            <ActionIcon variant="light" color="red" onClick={() => onDelete?.(r.id)}>
            <IconX size={18} />
            </ActionIcon>
        </Group>
        </Card>
    )
    )}
</SimpleGrid>
);
}
