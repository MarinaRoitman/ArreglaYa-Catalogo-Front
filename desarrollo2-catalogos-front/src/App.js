import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader, Center } from '@mantine/core';

// Tus páginas y componentes
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Solicitudes from './pages/Solicitudes';
import Confirmados from './pages/Confirmados';
import Realizados from './pages/Realizados';
import Habilidades from './pages/Habilidades';
import Perfil from './pages/Perfil';
import PrivateRoute from './PrivateRoutes';

// Importa el servicio de API
import { getPedidos, updatePedido, deletePedido } from './Api/pedidosServicio';

import './App.css'; 
import './Form.css';

// Función para parsear fechas de forma segura
const parseCustomDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return isNaN(d) ? null : d;
};

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar TODOS los datos desde el backend
  const fetchJobs = async () => {
    try {
      const dataFromApi = await getPedidos();
      
      console.log("Datos CRUDOS recibidos de la API:", dataFromApi); // DEBUG

      // --- MAPEADO DE DATOS CORREGIDO ---
      const mappedData = dataFromApi.map(job => ({
        id: job.id,
        // Usamos la descripción como campo principal y el ID de usuario como respaldo
        nombre: job.descripcion || `Pedido del Usuario #${job.id_usuario}`, 
        telefono: 'N/A', // Este dato debe venir del backend en el futuro
        direccion: job.direccion_calle || 'No especificada',
        fecha: job.fecha, // Guardamos la fecha original para la lógica de filtros
        fechaHora: job.fecha ? new Date(job.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }).replace(",", "") + 'hs' : 'Fecha a convenir',
        // Servicio y habilidad ahora vienen de 'descripcion'
        servicio: job.descripcion,
        habilidad: '', // Dejamos habilidad vacío por ahora
        estado: job.estado,
        tiempoEstimado: job.tiempo_estimado,
        montoTotal: job.tarifa,
        clienteConfirmo: job.estado === 'confirmado' || job.estado === 'finalizado'
      }));

      console.log("Datos TRADUCIDOS para el frontend:", mappedData); // DEBUG
      setJobs(mappedData);
    } catch (error) {
      console.error("Error al obtener los trabajos:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchJobs();
    } else {
      setLoading(false);
    }
  }, []);

  const profesionalEnviaPresupuesto = async (id, { tiempoEstimado, montoTotal }) => {
    try {
      await updatePedido(id, {
        tiempo_estimado: tiempoEstimado,
        tarifa: montoTotal,
        estado: 'pendiente-cliente'
      });
      fetchJobs();
    } catch (error) {
      console.error("Error al enviar el presupuesto:", error);
    }
  };

  const rechazarSolicitud = async (id) => {
    try {
      await deletePedido(id);
      fetchJobs();
    } catch (error) {
      console.error("Error al rechazar la solicitud:", error);
    }
  };
  
  const ahora = new Date();
  const solicitudesData = jobs.filter(job => job.estado === 'pendiente' && (!job.fecha || parseCustomDate(job.fecha) > ahora));
  const confirmadosData = jobs.filter(job => (job.estado === 'pendiente-cliente' || job.estado === 'confirmado') && (!job.fecha || parseCustomDate(job.fecha) > ahora));
  const realizadosData = jobs.filter(job => (job.estado === 'finalizado' || job.estado === 'calificado') && job.fecha && parseCustomDate(job.fecha) < ahora);

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader color="#b67747ff" size="xl" />
      </Center>
    );
  }
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          
          <Route path="/solicitudes" element={<PrivateRoute><Solicitudes data={solicitudesData} aprobar={profesionalEnviaPresupuesto} rechazar={rechazarSolicitud} /></PrivateRoute>}/>
          <Route path="/confirmados" element={<PrivateRoute><Confirmados data={confirmadosData} /></PrivateRoute>}/>
          <Route path="/realizados" element={<PrivateRoute><Realizados data={realizadosData} /></PrivateRoute>}/>
          <Route path="/habilidades" element={<PrivateRoute><Habilidades /></PrivateRoute>}/>
          <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;