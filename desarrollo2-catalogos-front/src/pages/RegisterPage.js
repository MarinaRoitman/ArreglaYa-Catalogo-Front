import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormComboBox from '../components/ZonasComboBox';
import { API_URL } from '../Api/api';
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

  const [zonas, setZonas] = useState([]);

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await fetch(`${API_URL}zonas/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Error al obtener zonas");
        }

        const data = await response.json();
        setZonas(data); 
      } catch (error) {
        console.error("Error cargando zonas:", error.message);
        alert("Error cargando zonas: " + error.message);
      }
    };

    fetchZonas();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="form-container">
      <div className="logo-container">
        <h2>Arregla Ya</h2>
        <p>Servicios a domicilio</p>
      </div>

      <form className="form-grid">
        <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
        <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />

        <input type="email" name="mail" placeholder="Mail" value={formData.mail} onChange={handleChange} required />
        <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />

        <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required />
        <input type="text" name="usuario" placeholder="Usuario" value={formData.usuario} onChange={handleChange} required />

        {/* Combo de zonas poblado con GET */}
        <FormComboBox
          className="full-width"
          name="id_zona"
          value={formData.id_zona}
          onChange={handleChange}
          placeholder="Seleccione una zona"
          required
          options={zonas.map(z => ({ value: z.id, label: z.nombre }))}
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
