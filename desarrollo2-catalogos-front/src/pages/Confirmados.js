import React, { useMemo, useState } from "react";
import { Text, Paper } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import AppLayout from "../components/LayoutTrabajosPendientes";
import Filterbar from "../components/Filterbar";
import TableComponent from "../components/TableComponent";
import CardsMobile from "../components/CardsMobile";
import ConfirmDelete from "../components/ModalBorrar"; // 

export default function Confirmados({ data, rechazar }) { // <-- 2. Recibir prop "rechazar"
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
  
  // --- 3. Lógica para el modal de confirmación ---
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
  };

  const cancelDelete = () => setConfirmOpen(false);
  // --- Fin de la lógica del modal ---

  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <AppLayout>
      <Paper
      p="lg"
      withBorder radius="lg" shadow="sm"
      style={{background: "--app-bg"}}
      >
        <Text fw={700} fz="xl" mb="md" ta="center">Trabajos Confirmados</Text>
        
        <Filterbar {...{ fNombre, setFNombre, fTel, setFTel, fDir, setFDir, fFecha, setFFecha, fServ, setFServ, fHab, setFHab }} />
        
        {filteredData.length === 0 ? (
          <Text ta="center" mt="lg" c="dimmed">No se encontraron resultados</Text>
        ) : isMobile ? (
          <CardsMobile rows={filteredData} type="confirmados" rechazar={askDelete} /> // <-- 4. Pasar "askDelete"
        ) : (
          <TableComponent rows={filteredData} type="confirmados" rechazar={askDelete} /> // <-- 4. Pasar "askDelete"
        )}
      </Paper>

      {/* 5. Añadir el componente del modal */}
      <ConfirmDelete 
        opened={confirmOpen} 
        onCancel={cancelDelete} 
        onConfirm={confirmDelete} 
        loading={deleting} 
      />
    </AppLayout>
  );
}