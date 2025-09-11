import React, { useMemo, useState } from "react";
import { Box, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import Filterbar from "../components/Filterbar";
import TableComponent from "../components/TableComponent";
import CardsMobile from "../components/CardsMobile";
import ConfirmDelete from "../components/ModalBorrar";

export default function Solicitudes({ data, aprobar, rechazar }) {
  const [fNombre, setFNombre] = useState("");
  const [fTel, setFTel] = useState("");
  const [fDir, setFDir] = useState("");
  const [fFecha, setFFecha] = useState("");
  const [fServ, setFServ] = useState("");
  const [fHab, setFHab] = useState("");

  // Filtrado simple
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

  // Modal de confirmación para rechazar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const askDelete = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    setDeleting(true);
    rechazar(deletingId);
    setConfirmOpen(false);
    setDeletingId(null);
    setDeleting(false);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const isMobile = useMediaQuery("(max-width: 48em)");

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
          Solicitudes
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
            No se encontraron resultados
          </Text>
        ) : isMobile ? (
          <CardsMobile
            rows={filtered}
            aprobar={aprobar}
            rechazar={askDelete}
            type="solicitudes"
          />
        ) : (
          <TableComponent
            rows={filtered}
            aprobar={aprobar}
            rechazar={askDelete}
            type="solicitudes"
          />
        )}
      </Box>

      <ConfirmDelete
        opened={confirmOpen}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </AppLayout>
  );
}
