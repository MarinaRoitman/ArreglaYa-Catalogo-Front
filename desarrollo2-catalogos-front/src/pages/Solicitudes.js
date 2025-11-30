import React, { useMemo, useState } from "react";
import { Text, Paper, Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import Filterbar from "../components/Filterbar";
import TableComponent from "../components/TableComponent";
import CardsMobile from "../components/CardsMobile";
import ConfirmDelete from "../components/ModalBorrar";
import ModalCotizar from "../components/ModalCotizar";
import { IconRefresh } from "@tabler/icons-react";

export default function Solicitudes({ data, aprobar, rechazar, recargar }) {
  const [fNombre, setFNombre] = useState("");
  const [fTel, setFTel] = useState("");
  const [fDir, setFDir] = useState("");
  const [fFecha, setFFecha] = useState("");
  const [fServ, setFServ] = useState("");
  const [fHab, setFHab] = useState("");

  const [cotizarOpen, setCotizarOpen] = useState(false);
  const [rowToCotizar, setRowToCotizar] = useState(null);

  const abrirCotizador = (row) => {
    setRowToCotizar(row);
    setCotizarOpen(true);
  };

  const enviarCotizacion = ({ montoTotal, fecha }) => {
    aprobar(rowToCotizar.id, { montoTotal, fecha }); // ya lo tenés hecho
    setCotizarOpen(false);
  };


  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const match = (val, f) => String(val ?? '').toLowerCase().includes(f.trim().toLowerCase());
    return data.filter((r) =>
        match(r.nombre, fNombre) && match(r.telefono, fTel) && match(r.direccion, fDir) &&
        match(r.fechaHora, fFecha) && match(r.servicio, fServ) && match(r.habilidad, fHab)
    );
  }, [data, fNombre, fTel, fDir, fFecha, fServ, fHab]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const askDelete = (id) => { setDeletingId(id); setConfirmOpen(true); };
  const confirmDelete = () => { setDeleting(true); rechazar(deletingId); setConfirmOpen(false); };
  const cancelDelete = () => setConfirmOpen(false);

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
            Solicitudes
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
          <CardsMobile rows={filteredData}  aprobar={abrirCotizador} rechazar={askDelete} type="solicitudes" />
        ) : (
          <TableComponent rows={filteredData}  aprobar={abrirCotizador}  rechazar={askDelete} type="solicitudes" />
        )}
      </Paper>
      <ConfirmDelete opened={confirmOpen} onCancel={cancelDelete} onConfirm={confirmDelete} loading={deleting} />
      <ModalCotizar
        opened={cotizarOpen}
        onClose={() => setCotizarOpen(false)}
        row={rowToCotizar}
        onSubmit={enviarCotizacion}
      />
    </AppLayout>
  );
}