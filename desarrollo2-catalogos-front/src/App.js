import React, { useState, useEffect, useCallback } from 'react';
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

// Importamos todos los servicios de API necesarios
import { getPedidos, updatePedido, deletePedido } from './Api/pedidosServicio';
import { getUsuarioById } from './Api/usuarios';
import { listHabilidades } from './Api/habilidades';

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

  // Usamos useCallback para que esta función no se recree en cada render, mejorando el rendimiento
  const fetchJobs = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // 1. Obtenemos pedidos y la lista completa de habilidades en paralelo
      const [pedidosData, habilidadesData] = await Promise.all([
        getPedidos(),
        listHabilidades()
      ]);
      
      // 2. Buscamos los datos de todos los clientes necesarios de una sola vez
      const userIds = [...new Set(pedidosData.map(p => p.id_usuario))];
      const userPromises = userIds.map(id => getUsuarioById(id));
      const usersData = await Promise.all(userPromises);
      const usersMap = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      // 3. Mapeamos y enriquecemos los datos en un solo paso
      const mappedData = pedidosData.map(job => {
        const usuario = usersMap[job.id_usuario] || {};
        const habilidad = habilidadesData.find(h => h.id === job.id_habilidad) || {};
        
        return {
          id: job.id,
          nombre: `${usuario.nombre || 'Usuario'} ${usuario.apellido || ''}`.trim(),
          telefono: usuario.telefono || 'N/A',
          direccion: usuario.direccion || 'No especificada', // <-- DIRECCIÓN CORREGIDA
          fecha: job.fecha,
          fechaHora: job.fecha ? new Date(job.fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }).replace(",", "") + 'hs' : 'Fecha a convenir',
          
          servicio: habilidad.nombre || job.descripcion,      // El SERVICIO es el RUBRO de la habilidad
          habilidad: habilidad.nombre_rubro || 'General',      // La HABILIDAD es el NOMBRE de la habilidad
          
          estado: job.estado,
          montoTotal: job.tarifa,
          clienteConfirmo: job.estado === 'aprobado_por_usuario' || job.estado === 'finalizado'
        };
      });

      setJobs(mappedData);
    } catch (error) {
      console.error("Error al obtener los trabajos:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const profesionalEnviaPresupuesto = async (id, { fecha, montoTotal }) => {
    try {
      await updatePedido(id, {
        fecha: fecha,
        tarifa: montoTotal,
        estado: 'aprobado_por_prestador'
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

  const ahora = new Date();
  const solicitudesData = jobs.filter(job => job.estado === 'pendiente' && (!job.fecha || parseCustomDate(job.fecha) > ahora));
  const confirmadosData = jobs.filter(job => (job.estado === 'aprobado_por_prestador' || job.estado === 'aprobado_por_usuario') && (!job.fecha || parseCustomDate(job.fecha) > ahora));
  const realizadosData = jobs.filter(job => (job.estado === 'finalizado' || job.estado === 'cancelado') && job.fecha && parseCustomDate(job.fecha) < ahora);

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