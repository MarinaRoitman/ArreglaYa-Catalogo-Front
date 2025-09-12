import React, { useMemo, useState } from "react";
import { Box, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import Filterbar from "../components/Filterbar";
import TableComponent from "../components/TableComponent";
import CardsMobile from "../components/CardsMobile";

export default function Confirmados({ data }) {
  // 1. Reintroducimos los estados para cada filtro de texto
  const [fNombre, setFNombre] = useState("");
  const [fTel, setFTel] = useState("");
  const [fDir, setFDir] = useState("");
  const [fFecha, setFFecha] = useState("");
  const [fServ, setFServ] = useState("");
  const [fHab, setFHab] = useState("");

  // 2. Reintroducimos el memo para aplicar el filtro de texto a la data que llega desde App.js
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const match = (val, f) => String(val ?? '').toLowerCase().includes(f.trim().toLowerCase());
    return data.filter((r) =>
        match(r.nombre, fNombre) && match(r.telefono, fTel) && match(r.direccion, fDir) &&
        match(r.fechaHora, fFecha) && match(r.servicio, fServ) && match(r.habilidad, fHab)
    );
  }, [data, fNombre, fTel, fDir, fFecha, fServ, fHab]);
  
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <AppLayout>
      <Box p="lg" bg="white" style={{ borderRadius: 16, boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)" }}>
        <Text fw={700} fz="xl" mb="md" ta="center">Trabajos Confirmados</Text>
        
        {/* 3. Pasamos todos los estados y setters al Filterbar */}
        <Filterbar {...{ fNombre, setFNombre, fTel, setFTel, fDir, setFDir, fFecha, setFFecha, fServ, setFServ, fHab, setFHab }} />
        
        {filteredData.length === 0 ? (
          <Text ta="center" mt="lg" c="dimmed">No se encontraron resultados</Text>
        ) : isMobile ? (
          // 4. Usamos la data ya filtrada por el texto
          <CardsMobile rows={filteredData} type="confirmados" />
        ) : (
          <TableComponent rows={filteredData} type="confirmados" />
        )}
      </Box>
    </AppLayout>
  );
}