import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const LoginPage = () => {
  const [formData, setFormData] = useState({ usuario: "", contrasena: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/solicitudes";

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email: formData.usuario,
        password: formData.contrasena,
      }),
    });
    if (!res.ok) throw new Error("Credenciales inválidas");

    const data = await res.json();
    const token = data?.access_token || data?.token;
    if (!token) throw new Error("Sin token");

    localStorage.removeItem("prestador_id");

    localStorage.setItem("token", token);

    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    if (meRes.ok) {
      const me = await meRes.json();

      const prestadorId =
        me?.prestador_id ??
        me?.id ??
        me?.user_id ??
        me?.prestador?.id ?? 
        null;

      if (prestadorId != null) {
        localStorage.setItem("prestador_id", String(prestadorId));
      }


      const soloNombre = (me?.nombre || "Usuario").toString().trim();
      localStorage.setItem("userName", soloNombre);
    } else {

      localStorage.setItem("userName", (formData.usuario || "").split("@")[0] || "Usuario");
    }

    navigate(from, { replace: true });
  } catch (err) {
    console.error(err);
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
          type="text"
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
          <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
          <Link to="/registro" className="btn btn-secondary">Registrarse</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
