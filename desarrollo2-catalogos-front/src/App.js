import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader, Center } from '@mantine/core';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Solicitudes from './pages/Solicitudes';
import Confirmados from './pages/Confirmados';
import Realizados from './pages/Realizados';
import Habilidades from './pages/Habilidades';
import Perfil from './pages/Perfil';
import PrivateRoute from './PrivateRoutes';
import { getPedidos, updatePedido, deletePedido } from './Api/pedidosServicio';
import { getUsuarioById } from './Api/usuarios';
import './App.css'; 
import './Form.css';

const parseCustomDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return isNaN(d) ? null : d;
};

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const dataFromApi = await getPedidos();
      const enrichedData = await Promise.all(
        dataFromApi.map(async (job) => {
          try {
            const usuario = await getUsuarioById(job.id_usuario);
            return {
              ...job,
              usuario_nombre: usuario.nombre,
              usuario_apellido: usuario.apellido,
              usuario_telefono: usuario.telefono,
            };
          } catch (error) {
            console.error(`Error al obtener datos del usuario ${job.id_usuario}:`, error);
            return job;
          }
        })
      );

      const mappedData = enrichedData.map(job => ({
        id: job.id,
        nombre: `${job.usuario_nombre || 'Usuario'} ${job.usuario_apellido || ''}`.trim(),
        telefono: job.usuario_telefono || 'N/A',
        direccion: job.direccion_calle || 'No especificada',
        fecha: job.fecha,
        fechaHora: job.fecha ? new Date(job.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }).replace(",", "") + 'hs' : 'Fecha a convenir',
        servicio: job.descripcion,
        habilidad: job.habilidad_nombre || '',
        estado: job.estado,
        montoTotal: job.tarifa,
      }));
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

  // ¡FUNCIÓN ACTUALIZADA! Ahora recibe 'fecha' y usa el nuevo estado 'aprobado_por_prestador'
 const profesionalEnviaPresupuesto = async (id, { fecha, montoTotal }) => {
    try {
      await updatePedido(id, {
        fecha: fecha, // Enviamos la nueva fecha al backend
        tarifa: montoTotal,
        estado: 'aprobado_por_prestador' // Cambiamos al nuevo estado
      });
      fetchJobs();
    } catch (error) { console.error("Error al enviar el presupuesto:", error); }
  };

  const rechazarSolicitud = async (id) => {
    try {
      await deletePedido(id);
      fetchJobs();
    } catch (error) { console.error("Error al rechazar la solicitud:", error); }
  };

  // --- LÓGICA DE FILTRADO (CORREGIDA CON LOS NUEVOS ESTADOS) ---
  const ahora = new Date();
  const solicitudesData = jobs.filter(job => job.estado === 'pendiente' && (!job.fecha || parseCustomDate(job.fecha) > ahora));
  const confirmadosData = jobs.filter(job => (job.estado === 'aprobado_por_prestador' || job.estado === 'aprobado_por_usuario') && (!job.fecha || parseCustomDate(job.fecha) > ahora));
  const realizadosData = jobs.filter(job => job.estado === 'finalizado' && job.fecha && parseCustomDate(job.fecha) < ahora);

  if (loading) {
    return ( <Center style={{ height: '100vh' }}><Loader color="#b67747ff" size="xl" /></Center> );
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