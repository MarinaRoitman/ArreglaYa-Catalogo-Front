import React from "react";
import { Box, SimpleGrid, TextInput } from "@mantine/core";

export default function HabilidadesFilterbar({
fNombre, setFNombre,
fServicio, setFServicio,
setPage,
}) {
const on = (setter) => (e) => { setPage?.(1); setter(e.currentTarget.value); };

return (
<Box mb="md">
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
    <TextInput
        label="Nombre"
        placeholder="Filtro"
        size="xs"
        value={fNombre}
        onChange={on(setFNombre)}
    />
    <TextInput
        label="Servicio"
        placeholder="Filtro"
        size="xs"
        value={fServicio}
        onChange={on(setFServicio)}
    />
    </SimpleGrid>
</Box>
);
}
