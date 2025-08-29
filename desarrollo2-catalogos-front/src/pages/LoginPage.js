import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    usuario: '',
    contrasena: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario de login:', formData);
  };

  return (
    <div className="form-container">
      <div className="logo-container">
        <h2>Arregla Ya</h2>
        <p>Servicios a domicilio</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="usuario" placeholder="Usuario" value={formData.usuario} onChange={handleChange} required />
        <input type="password" name="contrasena" placeholder="Contraseña" value={formData.contrasena} onChange={handleChange} required />
        <div className="btn-container">
          <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
          <Link to="/registro" className="btn btn-secondary">Registrarse</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;