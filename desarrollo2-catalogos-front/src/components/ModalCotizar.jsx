import {
Modal,
TextInput,
Group,
Button,
Text,
Divider,
Grid,
Flex
} from "@mantine/core";

import {
IconUser,
IconTool,
IconMapPin,
IconCalendar
} from "@tabler/icons-react";

import { useState, useEffect } from "react";

export default function ModalCotizar({ opened, onClose, row, onSubmit }) {
const [tarifa, setTarifa] = useState("");
const [error, setError] = useState("");

useEffect(() => {
if (row) {
    setTarifa(row.montoTotal ? String(row.montoTotal) : "");
}
}, [row]);

const validarTarifa = (value) => {
const regex = /^[0-9]*[.,]?[0-9]{0,2}$/;
if (value.length > 9) return "Máximo 9 caracteres";
if (!regex.test(value)) return "Formato inválido (hasta 2 decimales)";
return "";
};

const handleChange = (e) => {
const value = e.target.value.replace(",", ".");
const err = validarTarifa(value);
setError(err);
setTarifa(value);
};

const handleSubmit = () => {
if (error || tarifa === "") return;

onSubmit({
    montoTotal: Number(tarifa),
    fecha: row?.fecha ?? null,
});
};

return (
<Modal
    opened={opened}
    onClose={onClose}
    centered
    size="md"
    title="Resumen"
    styles={{
    title: {
        width: "100%",
        textAlign: "center",
        fontWeight: 600,
        fontSize: "19px"
    }
    }}
>
    {row && (
    <>

        <Flex justify="center">
        <div style={{ width: "90%" }}>
            <Grid gutter="md" align="start">
            <Grid.Col span={6}>
                <Flex align="center" gap={6}>
                <IconUser size={17} />
                <Text size="sm" fw={500}>Cliente</Text>
                </Flex>
                <Text size="sm" mb="md">{row.nombre}</Text>

                <Flex align="center" gap={6}>
                <IconTool size={17} />
                <Text size="sm" fw={500}>Servicio</Text>
                </Flex>
                <Text size="sm">{row.servicio}</Text>
            </Grid.Col>

            <Grid.Col span={6}>
                <Flex align="center" gap={6}>
                <IconMapPin size={17} />
                <Text size="sm" fw={500}>Dirección</Text>
                </Flex>
                <Text size="sm" mb="md">{row.direccion}</Text>

                <Flex align="center" gap={6}>
                <IconCalendar size={17} />
                <Text size="sm" fw={500}>Fecha</Text>
                </Flex>
                <Text size="sm">{row.fechaHora}</Text>
            </Grid.Col>
            </Grid>
        </div>
        </Flex>

        <Divider my="md" />

        <TextInput
        label="Tarifa propuesta"
        placeholder="Ej: 1500.50"
        value={tarifa}
        onChange={handleChange}
        error={error}
        radius="md"
        leftSection={
            <Text fw={700} size="md">
            $
            </Text>
        }
        />

        <Group justify="flex-end" mt="lg">
        <Button variant="default" radius="md" onClick={onClose}>
            Cancelar
        </Button>
        <Button
            radius="md"
            onClick={handleSubmit}
            disabled={!!error || tarifa === ""}
            style={{ background: "#b67747", color: "white" }}
        >
            Enviar presupuesto
        </Button>
        </Group>
    </>
    )}
</Modal>
);
}
