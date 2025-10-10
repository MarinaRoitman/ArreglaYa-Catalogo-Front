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
import Calificaciones from './pages/Calificaciones';
import PrivateRoute from './PrivateRoutes';
import MostrarPrestadores from "./pages/MostrarPrestadores";
import AdminServicos from "./pages/AdminServicios";
import AdminHabilidades from './pages/AdminHabilidades';
import PerfilAdmin from './pages/PerfilAdmin';


// Servicios API
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

  // 🧠 Trae los trabajos del usuario actual
  const fetchJobs = useCallback(async () => {
    const token = localStorage.getItem('token');
    const prestadorId = localStorage.getItem('prestador_id');

    // Si no hay sesión, no intentes cargar datos
    if (!token || !prestadorId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1) Pedidos del prestador + catálogo de habilidades
      //    👉 pasamos prestadorId explícito (tu servicio puede tener fallback también)
      const [pedidosData, habilidadesData] = await Promise.all([
        getPedidos(prestadorId),
        listHabilidades(),
      ]);

      // 2) Traer usuarios en lote
      const userIds = [...new Set((pedidosData || []).map(p => p?.id_usuario).filter(Boolean))];
      const usersData = await Promise.all(userIds.map(id => getUsuarioById(id)));
      const usersMap = (usersData || []).reduce((acc, u) => {
        if (u && u.id != null) acc[u.id] = u;
        return acc;
      }, {});

      // 3) Mapear filas seguras para la UI
      const mappedData = (pedidosData || []).map(job => {
        const usuario = usersMap[job?.id_usuario] || {};
        const habilidad = (habilidadesData || []).find(h => h?.id === job?.id_habilidad) || {};

        let fechaHoraFmt = 'Fecha a convenir';
        if (job?.fecha) {
          const d = new Date(job.fecha);
          if (!Number.isNaN(d.getTime())) {
            fechaHoraFmt = d
              .toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
              .replace(',', '') + 'hs';
          }
        }

        return {
          id: job?.id ?? `tmp-${Math.random().toString(36).slice(2)}`,
          nombre: `${usuario?.nombre || 'Usuario'} ${usuario?.apellido || ''}`.trim(),
          telefono: usuario?.telefono || 'N/A',
          direccion: usuario?.direccion || 'No especificada',
          fecha: job?.fecha ?? null,
          fechaHora: fechaHoraFmt,
          servicio: job?.descripcion ?? '',
          habilidad: habilidad?.nombre || 'General',
          estado: job?.estado ?? 'pendiente',
          montoTotal: job?.tarifa ?? 0,
          clienteConfirmo:
            job?.estado === 'aprobado_por_usuario' || job?.estado === 'finalizado',
        };
      });

      setJobs(mappedData);
    } catch (error) {
      console.error('Error al obtener los trabajos:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔁 Carga inicial
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // 🔔 Re-fetch cuando Login notifica cambio de usuario (sin romper estructura)
  useEffect(() => {
    const onAuthChanged = () => {
      // fuerza un nuevo ciclo de carga
      setLoading(true);
      fetchJobs();
    };
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
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
    } catch (error) {
      console.error('Error al rechazar la solicitud:', error);
    }
  };

  // Derivación de vistas
  const ahora = new Date();
  const solicitudesData = jobs.filter(
    (job) => job.estado === 'pendiente' && (!job.fecha || parseCustomDate(job.fecha) > ahora)
  );
  const confirmadosData = jobs.filter(
    (job) =>
      (job.estado === 'aprobado_por_prestador' || job.estado === 'aprobado_por_usuario') &&
      (!job.fecha || parseCustomDate(job.fecha) > ahora)
  );
  const realizadosData = jobs.filter((job) =>
    job.estado === "finalizado"
      ? job.fecha && parseCustomDate(job.fecha) < ahora
      : job.estado === "cancelado"
  );  

  useEffect(() => {
    console.log("realizadosData:", realizadosData);
  }, [realizadosData]);

  // ⛔️ Bloqueá todo hasta terminar la carga
  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader color="#b67747ff" size="xl" />
      </Center>
    );
  }

  function RequireRole({ role, children }) {
  const token = localStorage.getItem("token");
  const userRole = (localStorage.getItem("role") || "").toLowerCase().trim();

  // si no hay token, redirige a login (por si PrivateRoute no se ejecuta primero)
  if (!token) return <Navigate to="/login" replace />;

  // si la ruta exige un rol concreto y no coincide, mandamos al home por rol
  if (role && userRole !== role) {
    const fallback = userRole === "admin" ? "/admin/prestadores" : "/solicitudes";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

  return (
    <Router>
  <div className="App">
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* ----- RUTA ADMIN ----- */}
      <Route
      path="/admin/prestadores"
      element={
      <RequireRole role="admin">
        <MostrarPrestadores />
      </RequireRole>
      }
      />
      <Route
        path="/admin/servicios"
        element={
          <RequireRole role="admin">
            <AdminServicos />
          </RequireRole>
        }
      />
      <Route
        path="/admin/habilidades"
        element={
          <RequireRole role="admin">
            <AdminHabilidades />
          </RequireRole>
        }
      />
      <Route
        path="/admin/perfil"
        element={
          <RequireRole role="admin">
            <PerfilAdmin/>
          </RequireRole>
        }
      />


      {/* ----- RUTAS PRESTADOR ----- */}
      <Route
        path="/solicitudes"
        element={
          <PrivateRoute>
            <Solicitudes
              data={solicitudesData}
              aprobar={profesionalEnviaPresupuesto}
              rechazar={rechazarSolicitud}
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/confirmados"
        element={
          <PrivateRoute>
            <Confirmados
              data={confirmadosData}
              rechazar={rechazarSolicitud}
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/realizados"
        element={
          <PrivateRoute>
            <Realizados data={realizadosData} />
          </PrivateRoute>
        }
      />
      <Route
        path="/habilidades"
        element={
          <PrivateRoute>
            <Habilidades />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />
      <Route
        path="/calificaciones"
        element={
          <PrivateRoute>
            <Calificaciones />
          </PrivateRoute>
        }
      />
    </Routes>
  </div>
</Router>
  );
}

export default App;
