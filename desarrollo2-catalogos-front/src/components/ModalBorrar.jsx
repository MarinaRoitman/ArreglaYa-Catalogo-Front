import React from "react";
import { Modal, Text, Group, Button } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function ConfirmDelete({
opened,
onCancel,
onConfirm,
loading = false,
}) {
return (
<Modal
    opened={opened}
    onClose={onCancel}
    centered
    radius="lg"
    withCloseButton={false}
    title={<Text fw={800} fz="xl">Confirmar eliminación</Text>}
>
    <Group align="center" gap="xs" mb="md">
    <IconAlertTriangle size={20} />
    <Text>¿Seguro que querés realizar la operación?</Text>
    </Group>
    <Group justify="flex-end">
    <Button variant="light" onClick={onCancel} color="#a07353ff">Cancelar</Button>
    <Button onClick={onConfirm} loading={loading} color="#93755E">
        Eliminar
    </Button>
    </Group>
</Modal>
);
}
