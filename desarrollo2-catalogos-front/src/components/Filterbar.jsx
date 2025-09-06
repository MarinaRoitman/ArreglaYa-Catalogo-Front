import React from "react";
import { Box, SimpleGrid, TextInput } from "@mantine/core";

export default function Filterbar({
fNombre, setFNombre,
fTel, setFTel,
fDir, setFDir,
fFecha, setFFecha,
fServ, setFServ,
fHab, setFHab,
setPage,
}) {
const on = (setter) => (e) => { setPage(1); setter(e.currentTarget.value); };

return (
<Box mb="md">
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 6 }} spacing="sm">
    <TextInput label="Nombre y Apellido" placeholder="Filtro" size="xs" value={fNombre} onChange={on(setFNombre)} />
    <TextInput label="Teléfono" placeholder="Filtro" size="xs" value={fTel} onChange={on(setFTel)} />
    <TextInput label="Dirección" placeholder="Filtro" size="xs" value={fDir} onChange={on(setFDir)} />
    <TextInput label="Fecha y Hora" placeholder="Filtro" size="xs" value={fFecha} onChange={on(setFFecha)} />
    <TextInput label="Servicio" placeholder="Filtro" size="xs" value={fServ} onChange={on(setFServ)} />
    <TextInput label="Habilidad" placeholder="Filtro" size="xs" value={fHab} onChange={on(setFHab)} />
    </SimpleGrid>
</Box>
);
}
