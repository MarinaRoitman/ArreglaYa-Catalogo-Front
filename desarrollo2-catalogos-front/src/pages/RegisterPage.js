import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../Api/api';
import '../../src/Form.css';

const RegisterPage = () => {
const navigate = useNavigate();

const [formData, setFormData] = useState({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  dni: '',
  password: '',
  repitaContrasena: '',
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.repitaContrasena) {
    alert("Las contraseñas no coinciden");
    return;
  }

  try {
    const response = await fetch(`${API_URL}auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: formData.nombre,
        apellido: formData.apellido,
        direccion: formData.direccion,
        dni: formData.dni,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al registrar usuario");
    }

    alert("Registro exitoso. Ahora podés iniciar sesión.");
    navigate("/login");

  } catch (error) {
    console.error("Error en el registro:", error.message);
    alert("Error en el registro: " + error.message);
  }
};

return (
  <div className="form-container">
    <div className="logo-container">
      <h2>Arregla Ya</h2>
      <p>Servicios a domicilio</p>
    </div>

    <form className="form-grid" onSubmit={handleSubmit}>
      <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
      <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
      <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required />
      <input type="text" name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} required />

      <input className="full-width" type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
      <input className="full-width" type="password" name="repitaContrasena" placeholder="Repita la Contraseña" value={formData.repitaContrasena} onChange={handleChange} required />

      <div className="btn-container">
        <button type="submit" className="btn btn-primary">Guardar</button>
        <Link to="/login" className="btn btn-secondary">Cancelar</Link>
      </div>
    </form>
  </div>
);
};

export default RegisterPage;
