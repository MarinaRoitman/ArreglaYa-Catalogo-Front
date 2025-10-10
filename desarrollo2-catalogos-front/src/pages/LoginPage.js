import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
// Cambiá a true si querés volver al modo "recargar toda la app" después del login
const HARD_RELOAD_AFTER_LOGIN = false;

export default function LoginPage() {
  const [formData, setFormData] = useState({ usuario: "", contrasena: "" });
  const [modalMsg, setModalMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

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

    // 1) Guardar token
    localStorage.setItem("token", token);

    // 2) Decodificar JWT: sub y role
    const [, payload] = token.split(".");
    const jsonPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

const roleRaw = jsonPayload?.role ?? jsonPayload?.rol ?? jsonPayload?.r ?? "";
const role = String(roleRaw).toLowerCase().trim();
localStorage.setItem("role", role);

// Guardá prestador_id SOLO si NO es admin y el sub es numérico
const sub = String(jsonPayload?.sub ?? "");
const maybeId = sub.includes(":") ? sub.split(":")[0] : sub;
const isNumericId = /^\d+$/.test(maybeId);
if (role !== "admin" && isNumericId) {
  localStorage.setItem("prestador_id", maybeId);
} else {
  localStorage.removeItem("prestador_id"); // limpia restos si venías de otra sesión
}

    

    // 3) (Opcional) traer nombre visible (solo si hay prestadorId)
// 3) Nombre visible
if (role === "admin") {
  // Mock para admin (o podés usar jsonPayload.sub si preferís)
  localStorage.setItem("userName", "Admin");
} else {
  // Si es prestador y guardamos su id, traemos el nombre
  const storedPrestadorId = localStorage.getItem("prestador_id");
  if (storedPrestadorId) {
    try {
      const prestadorRes = await fetch(`${BASE_URL}/prestadores/${storedPrestadorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (prestadorRes.ok) {
        const prestador = await prestadorRes.json();
        localStorage.setItem("userName", prestador?.nombre || "Usuario");
      }
    } catch {
      /* ignore */
    }
  }
}

    setIsRefreshing(true);

    if (HARD_RELOAD_AFTER_LOGIN) {
      const defaultHome = role === "admin" ? "/admin/prestadores" : "/solicitudes";
      const intended = location.state?.from?.pathname;
      localStorage.setItem("postLoginPath", intended || defaultHome);
      window.location.reload();
      return;
    }

    try { window.dispatchEvent(new Event("auth-changed")); } catch {}

    const defaultHome = role === "admin" ? "/admin/prestadores" : "/solicitudes";
    const intended = location.state?.from?.pathname;
    const nextPath = intended || defaultHome;

    localStorage.setItem("postLoginPath", nextPath);
    navigate(nextPath, { replace: true });

    setTimeout(() => setIsRefreshing(false), 300);

  } catch (err) {
    setModalMsg(err.message || "Error al iniciar sesión");
    setModalOpen(true);
  }
};

  // Mientras el login “sella” sesión o estamos haciendo transición, bloqueá la pantalla
  if (isRefreshing) {
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
