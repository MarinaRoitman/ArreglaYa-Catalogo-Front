import React from "react";
import { Box, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import Filterbar from "../components/Filterbar";
import TableComponent from "../components/TableComponent";
import CardsMobile from "../components/CardsMobile";

export default function Confirmados({ data }) {
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <AppLayout>
      <Box p="lg" bg="white" style={{ borderRadius: 16, boxShadow: "0 6px 24px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04)" }}>
        <Text fw={700} fz="xl" mb="md" ta="center">Trabajos Confirmados</Text>
        <Filterbar />
        {data.length === 0 ? (
          <Text ta="center" mt="lg" c="dimmed">No se encontraron trabajos confirmados.</Text>
        ) : isMobile ? (
          <CardsMobile rows={data} type="confirmados" />
        ) : (
          <TableComponent rows={data} type="confirmados" />
        )}
      </Box>
    </AppLayout>
  );
}