import React, { useState, useEffect } from "react";
import {
Modal, Text, Group, Stack, TextInput, Button, Box, Divider,
SimpleGrid, Paper, ThemeIcon
} from "@mantine/core";
import {
IconUser, IconDeviceMobile, IconCalendar, IconMapPin,
IconTools, IconBolt, IconClockHour4, IconCurrencyDollar
} from "@tabler/icons-react";

export default function ModalSolicitud({ opened, onClose, job, onSubmit }) {
const [tiempo, setTiempo] = useState("");
const [monto, setMonto] = useState("");
const [touched, setTouched] = useState({ tiempo: false, monto: false });

useEffect(() => {
setTiempo(""); setMonto(""); setTouched({ tiempo: false, monto: false });
}, [opened, job?.id]);

const montoOk = Number(monto) > 0;
const isValid = tiempo.trim() !== "" && montoOk;

return (
<Modal
    opened={opened}
    onClose={onClose}
    centered
    radius="lg"
    size="lg"
    withCloseButton={false}
    overlayProps={{ opacity: 0.35, blur: 2 }}
    title={<Text fw={800} fz="xl">Confirmar Solicitud</Text>}
>
    <Stack gap="md">
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Group gap="xs" justify="center">
        <ThemeIcon variant="light" radius="xl"><IconUser size={16} /></ThemeIcon>
        <Box>
            <Text fw={700} lh={1.1}>{job?.nombre}</Text>
            <Text size="xs" c="dimmed">Cliente</Text>
        </Box>
        </Group>
        <Group gap="xs" justify="center">
        <ThemeIcon variant="light" radius="xl"><IconDeviceMobile size={16} /></ThemeIcon>
        <Box>
            <Text fw={600}>{job?.telefono}</Text>
            <Text size="xs" c="dimmed">Teléfono</Text>
        </Box>
        </Group>
        <Group gap="xs" justify="center">
        <ThemeIcon variant="light" radius="xl"><IconCalendar size={16} /></ThemeIcon>
        <Box>
            <Text fw={600}>{job?.fechaHora}</Text>
            <Text size="xs" c="dimmed">Fecha y hora</Text>
        </Box>
        </Group>
    </SimpleGrid>

    <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
        <Stack gap={6} ta="center">
        <Group gap={6} justify="center"><IconMapPin size={16} /><Text>{job?.direccion}</Text></Group>
        <Group gap={6} justify="center"><IconTools size={16} /><Text>{job?.servicio}</Text></Group>
        <Group gap={6} justify="center"><IconBolt size={16} /><Text>{job?.habilidad}</Text></Group>
        </Stack>
    </Paper>

    <Divider />

    <Stack gap="sm">
        <TextInput
        placeholder="Tiempo estimado"
        value={tiempo}
        onChange={(e) => setTiempo(e.currentTarget.value)}
        onBlur={() => setTouched((t) => ({ ...t, tiempo: true }))}
        error={touched.tiempo && !tiempo.trim() ? "Campo obligatorio" : null}
        radius="md"
        size="md"
        variant="filled"
        leftSection={<IconClockHour4 size={16} />}
        />
        <TextInput
        placeholder="Monto total"
        value={monto}
        onChange={(e) => setMonto(e.currentTarget.value)}
        onBlur={() => setTouched((t) => ({ ...t, monto: true }))}
        error={touched.monto && !montoOk ? "Debe ser mayor a 0" : null}
        radius="md"
        size="md"
        variant="filled"
        type="number"
        inputMode="decimal"
        leftSection={<IconCurrencyDollar size={16} />}
        />
    </Stack>

    <Group justify="center" mt="sm">
        <Button color="#93755E" radius="md" onClick={() => isValid && onSubmit?.({
        id: job?.id,
        tiempoEstimado: tiempo.trim(),
        montoTotal: monto.trim(),
        })} disabled={!isValid}>
        Enviar
        </Button>
        <Button color="#a07353ff" variant="light" radius="md" onClick={onClose}>
        Cancelar
        </Button>
    </Group>
    </Stack>
</Modal>
);
}

