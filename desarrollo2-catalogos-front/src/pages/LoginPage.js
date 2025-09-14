import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  ThemeIcon,
  Loader,
  Center,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

const BASE_URL = "https://api.desarrollo2-catalogos.online";

export default function LoginPage() {
  const [formData, setFormData] = useState({ usuario: "", contrasena: "" });
  const [modalMsg, setModalMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/solicitudes";

  // 🚀 Si ya hay token (post-reload o usuario que entra a /login logueado), redirigí solo
  const hasToken = !!localStorage.getItem("token");
  useEffect(() => {
    if (hasToken) {
      const target = localStorage.getItem("postLoginPath") || "/solicitudes";
      localStorage.removeItem("postLoginPath");
      navigate(target, { replace: true });
    }
  }, [hasToken, navigate]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
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

      // Guardar token
      localStorage.setItem("token", token);

      // Decodificar JWT y sanear el sub -> puede venir "12:1"; nos quedamos con "12"
      const [, payload] = token.split(".");
      const jsonPayload = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
      const rawSub = String(jsonPayload?.sub ?? "");
      const prestadorId = rawSub.split(":")[0];
      localStorage.setItem("prestador_id", prestadorId);

      // Guardar nombre visible (opcional)
      try {
        const prestadorRes = await fetch(`${BASE_URL}/prestadores/${prestadorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (prestadorRes.ok) {
          const prestador = await prestadorRes.json();
          localStorage.setItem("userName", prestador?.nombre || "Usuario");
        }
      } catch {
        /* silencioso */
      }

      // 🧭 Guardar destino y recargar con loader
      localStorage.setItem("postLoginPath", from);
      setIsRefreshing(true);
      window.location.reload();
    } catch (err) {
      setModalMsg(err.message || "Error al iniciar sesión");
      setModalOpen(true);
    }
  };

  // Mostrar loader si estamos refrescando o si ya hay token (redirigiendo)
  if (isRefreshing || hasToken) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader color="#93755E" size="xl" />
      </Center>
    );
  }

  return (
    <>
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

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        centered
        radius="lg"
        size="sm"
        overlayProps={{ opacity: 0.4, blur: 3 }}
        withCloseButton={false}
        styles={{
          content: { padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" },
        }}
      >
        <Stack align="center" gap="md">
          <ThemeIcon size={60} radius="xl" color="red" variant="light">
            <IconAlertCircle size={40} color="#93755E" />
          </ThemeIcon>

        <Text ta="center" fw={700} fz="lg">
            {modalMsg}
          </Text>

          <Group justify="center" mt="sm">
            <Button
              onClick={() => setModalOpen(false)}
              color="#93755E"
              radius="md"
              size="md"
              variant="filled"
            >
              Cerrar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
