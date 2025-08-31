import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormComboBox from '../components/ZonasComboBox';
import '../../src/Form.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    mail: '',
    telefono: '',
    direccion: '',
    usuario: '',
    contrasena: '',
    repitaContrasena: '',
    id_zona: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contrasena !== formData.repitaContrasena) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          direccion: formData.direccion,
          email: formData.mail,
          telefono: formData.telefono,
          password: formData.contrasena,
          id_zona: Number(formData.id_zona),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al registrar usuario");
      }

      const data = await response.json();
      console.log("Registro exitoso:", data);

      alert("Registro exitoso, ahora puedes iniciar sesión");
      navigate("/login");

    } catch (error) {
      console.error("Error en registro:", error.message);
      alert("Error en registro: " + error.message);
    }
  };

  return (
    <div className="form-container">
      <div className="logo-container">
        <h2>Arregla Ya</h2>
        <p>Servicios a domicilio</p>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
        <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />

        <input type="email" name="mail" placeholder="Mail" value={formData.mail} onChange={handleChange} required />
        <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />

        <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required />
        <input type="text" name="usuario" placeholder="Usuario" value={formData.usuario} onChange={handleChange} required />


        <FormComboBox
          className="full-width"
          name="id_zona"
          value={formData.id_zona}
          onChange={handleChange}
          placeholder="Seleccione una zona"
          required
        />


        <input className="full-width" type="password" name="contrasena" placeholder="Contraseña" value={formData.contrasena} onChange={handleChange} required />
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
