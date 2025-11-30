import React, { useMemo, useState } from "react";
import { Paper, Text, Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import Filterbar from "../components/Filterbar";
import TableComponent from "../components/TableComponent";
import CardsMobile from "../components/CardsMobile";
import { IconRefresh } from "@tabler/icons-react";

export default function Realizados({ data , recargar}) {
  const [fNombre, setFNombre] = useState("");
  const [fTel, setFTel] = useState("");
  const [fDir, setFDir] = useState("");
  const [fFecha, setFFecha] = useState("");
  const [fServ, setFServ] = useState("");
  const [fHab, setFHab] = useState("");

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
      <Paper
            p="lg"
            withBorder radius="lg" shadow="sm"
            style={{background: "--app-bg"}}
            >

    <div style={{ position: "relative", marginBottom: 16 }}>
        <Text fw={700} fz="xl" ta="center">
            Realizados
        </Text>

        <Button
            onClick={recargar}
            leftSection={<IconRefresh size={16} />}
            style={{
            position: "absolute",
            right: 0,           
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#b67747ff",
            }}
        >
            Recargar
        </Button>
    </div>

        <Filterbar {...{ fNombre, setFNombre, fTel, setFTel, fDir, setFDir, fFecha, setFFecha, fServ, setFServ, fHab, setFHab }} />
        {filteredData.length === 0 ? (
          <Text ta="center" mt="lg" c="dimmed">No se encontraron resultados</Text>
        ) : isMobile ? (
          <CardsMobile rows={filteredData} type="realizados" />
        ) : (
          <TableComponent rows={filteredData} type="realizados" />
        )}
      </Paper>
    </AppLayout>
  );
}