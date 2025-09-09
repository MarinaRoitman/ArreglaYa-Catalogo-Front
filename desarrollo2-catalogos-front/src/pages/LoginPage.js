import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const BASE_URL = "https://api.desarrollo2-catalogos.online";

const LoginPage = () => {
  const [formData, setFormData] = useState({ usuario: "", contrasena: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/solicitudes";

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Login
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          email: formData.usuario,
          password: formData.contrasena,
        }),
      });

      if (!res.ok) throw new Error("Credenciales inválidas");

      const data = await res.json();
      const token = data?.access_token || data?.token;
      if (!token) throw new Error("No se recibió token");

      // 2. Guardar token
      localStorage.setItem("token", token);

      // 3. Decodificar JWT para sacar prestador_id
      const [, payload] = token.split(".");
      const jsonPayload = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
      const prestadorId = jsonPayload.sub; // en tu token venía así
      localStorage.setItem("prestador_id", prestadorId);

      // 4. Llamar a /prestadores/{prestador_id}
      const prestadorRes = await fetch(`${BASE_URL}/prestadores/${prestadorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (prestadorRes.ok) {
        const prestador = await prestadorRes.json();
        console.log("Datos prestador:", prestador);

        // 5. Guardar nombre u otros datos
        localStorage.setItem("userName", prestador.nombre || "Usuario");
      }

      // 6. Redirigir
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Error en login:", err.message);
      alert("Error: Credenciales incorrectas, intentá de nuevo");
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
          type="email"
          name="usuario"
          placeholder="Email"
          value={formData.usuario}
          onChange={handleChange}
          required
          autoComplete="username"
        />
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={formData.contrasena}
          onChange={handleChange}
          required
          autoComplete="current-password"
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
