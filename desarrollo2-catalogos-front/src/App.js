import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Solicitudes from './pages/Solicitudes';
import Habilidades from './pages/Habilidades';
import Perfil from './pages/Perfil';
import Realizados from './pages/Realizados';
import Confirmados from "./pages/Confirmados";

import PrivateRoute from './PrivateRoutes';

import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/solicitudes"element={<PrivateRoute><Solicitudes /></PrivateRoute>}/>
          <Route path="/confirmados" element={<PrivateRoute><Confirmados /></PrivateRoute>}/>
          <Route path="/habilidades" element={<PrivateRoute><Habilidades /></PrivateRoute>}/>
          <Route path="/realizados" element={<PrivateRoute><Realizados /></PrivateRoute>}/>
          <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;