import React from "react";
import { Modal, Text, Group, Button, Stack } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

export default function LogOut({ opened, onCancel, onConfirm, loading=false }) {
return (
<Modal
    opened={opened}
    onClose={onCancel}
    centered
    radius="lg"
    withCloseButton={false}
    overlayProps={{ opacity: 0.35, blur: 2 }}
    title={
    <Text fw={800} fz="xl" ta="center" w="100%">
        Cerrar sesión
    </Text>
    }
>
    <Stack gap="md" align="center">
    <Group gap="xs" justify="center">
        <IconLogout size={18} />
        <Text ta="center">¿Seguro que querés salir?</Text>
    </Group>

    <Group justify="center" mt="sm">
        <Button variant="light" onClick={onCancel} color="#a07353ff">Cancelar</Button>
        <Button color="#93755E"onClick={onConfirm} loading={loading}>
        Cerrar sesión
        </Button>
    </Group>
    </Stack>
</Modal>
);
}
