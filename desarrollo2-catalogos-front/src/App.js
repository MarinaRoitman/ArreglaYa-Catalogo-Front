import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Solicitudes from './pages/Solicitudes';
import Confirmados from './pages/Confirmados';
import Realizados from './pages/Realizados';
import Habilidades from './pages/Habilidades';
import Perfil from './pages/Perfil';
import PrivateRoute from './PrivateRoutes';
import './App.css'; 
import './Form.css';
import allJobsData from './SolicitudesPersonas.json';

// Función para parsear fechas (la usaremos para filtrar)
const parseCustomDate = (dateString) => {
  if (!dateString || !dateString.includes(' ')) return new Date('Invalid Date');
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  const hour = timePart.replace('hs', '');
  return new Date(`${year}-${month}-${day}T${hour}:00:00`);
};

function App() {
  const [jobs, setJobs] = useState(allJobsData);

// Esta función se llama desde el modal de Solicitudes
  const profesionalEnviaPresupuesto = (id, { tiempoEstimado, montoTotal }) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === id
          ? { ...job, tiempoEstimado, montoTotal } // Solo agrega el presupuesto.
          : job
      )
    );
    // ¡HEMOS QUITADO EL setTimeout QUE CONFIRMABA AUTOMÁTICAMENTE!
  };

  const rechazarSolicitud = (id) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
  };

// --- LÓGICA DE FILTRADO (CORREGIDA) ---
  const ahora = new Date();

  // Solicitudes: Trabajos SIN presupuesto y con fecha futura.
  const solicitudesData = jobs.filter(job =>
    job.montoTotal === null && parseCustomDate(job.fechaHora) > ahora
  );

  // Confirmados: Trabajos CON presupuesto y con fecha futura.
  const confirmadosData = jobs.filter(job =>
    job.montoTotal !== null && parseCustomDate(job.fechaHora) > ahora
  );

  // Realizados: Trabajos con fecha PASADA que ya tuvieron un presupuesto.
  const realizadosData = jobs.filter(job =>
    job.montoTotal !== null && parseCustomDate(job.fechaHora) < ahora
  );
  
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