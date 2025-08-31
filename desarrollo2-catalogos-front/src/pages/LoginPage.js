import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    usuario: "",
    contrasena: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.usuario,
          password: formData.contrasena,
        }),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await response.json();
      console.log("Login exitoso:", data);

      localStorage.setItem("token", data.access_token);

      alert("Usuario logueado con éxito");
    } catch (error) {
      console.error("Error en login:", error.message);

      alert("Error: Credenciales incorrectas, intentalo de nuevo");
    }
  };

  return (
    <div className="form-container">
      <div className="logo-container">
        <h2>Arregla Ya</h2>
        <p>Servicios a domicilio</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="usuario"
          placeholder="Email"
          value={formData.usuario}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={formData.contrasena}
          onChange={handleChange}
          required
        />
        <div className="btn-container">
          <button type="submit" className="btn btn-primary">
            Iniciar Sesión
          </button>
          <Link to="/registro" className="btn btn-secondary">
            Registrarse
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
