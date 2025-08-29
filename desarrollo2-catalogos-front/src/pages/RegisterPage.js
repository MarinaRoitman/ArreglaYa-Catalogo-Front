import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    mail: '',
    telefono: '',
    usuario: '',
    contrasena: '',
    repitaContrasena: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario de registro:', formData);
  };

  return (
    <div className="form-container">
      <div className="logo-container">
        <h2>Arregla Ya</h2>
        <p>Servicios a domicilio</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
        <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
        <input type="email" name="mail" placeholder="Mail" value={formData.mail} onChange={handleChange} required />
        <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
        <input type="text" name="usuario" placeholder="Usuario" value={formData.usuario} onChange={handleChange} required />
        <input type="password" name="contrasena" placeholder="Contraseña" value={formData.contrasena} onChange={handleChange} required />
        <input type="password" name="repitaContrasena" placeholder="Repita la Contraseña" value={formData.repitaContrasena} onChange={handleChange} required />
        <div className="btn-container">
          <button type="submit" className="btn btn-primary">Guardar</button>
          <Link to="/login" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;