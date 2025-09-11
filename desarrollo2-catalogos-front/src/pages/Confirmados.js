import React, { useMemo, useState } from "react";
import { Box, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import Filterbar from "../components/Filterbar";
import TableComponent from "../components/TableComponent";
import CardsMobile from "../components/CardsMobile";

export default function Confirmados({ data }) {
  const [fNombre, setFNombre] = useState("");
  const [fTel, setFTel] = useState("");
  const [fDir, setFDir] = useState("");
  const [fFecha, setFFecha] = useState("");
  const [fServ, setFServ] = useState("");
  const [fHab, setFHab] = useState("");

  // filtrar datos
  const filtered = useMemo(() => {
    const match = (val, f) =>
      String(val ?? "")
        .toLowerCase()
        .includes(f.trim().toLowerCase());
    return data.filter(
      (r) =>
        match(r.nombre, fNombre) &&
        match(r.telefono, fTel) &&
        match(r.direccion, fDir) &&
        match(r.fechaHora, fFecha) &&
        match(r.servicio, fServ) &&
        match(r.habilidad, fHab)
    );
  }, [data, fNombre, fTel, fDir, fFecha, fServ, fHab]);

  const calificarTrabajo = (id) => {
    console.log(`Lógica para calificar el trabajo con ID: ${id}`);
    alert(`Calificar trabajo ID: ${id}`);
  };

  const isMobile = useMediaQuery("(max-width: 48em)"); // sm por defecto

  return (
    <AppLayout>
      <Box
        p="lg"
        bg="white"
        style={{
          borderRadius: 16,
          boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)",
        }}
      >
        <Text fw={700} fz="xl" mb="md" ta="center">
          Trabajos Confirmados
        </Text>

        <Filterbar
          fNombre={fNombre} setFNombre={setFNombre}
          fTel={fTel} setFTel={setFTel}
          fDir={fDir} setFDir={setFDir}
          fFecha={fFecha} setFFecha={setFFecha}
          fServ={fServ} setFServ={setFServ}
          fHab={fHab} setFHab={setFHab}
        />

        {filtered.length === 0 ? (
          <Text ta="center" mt="lg" c="dimmed">
            No se encuentran resultados
          </Text>
        ) : isMobile ? (
          <CardsMobile
            rows={filtered}
            calificar={calificarTrabajo}
            type="confirmados"
          />
        ) : (
          <TableComponent
            rows={filtered}
            calificar={calificarTrabajo}
            type="confirmados"
          />
        )}
      </Box>
    </AppLayout>
  );
}
