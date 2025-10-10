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
const HARD_RELOAD_AFTER_LOGIN = false;

/* ========== Helpers ========== */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function extractAuthFromToken(token) {
  const data = parseJwt(token) || {};
  // rol
  const roleRaw = data.role ?? data.rol ?? data.r ?? "";
  const role = String(roleRaw || "").toLowerCase().trim();

  // email (si sub es email, usarlo; si no, usar email/correo/mail)
  const sub = data.sub != null ? String(data.sub) : "";
  const emailFromSub = EMAIL_RE.test(sub) ? sub : null;
  const email =
    emailFromSub ||
    data.email ||
    data.correo ||
    data.mail ||
    null;

  // id: preferimos id/user_id/admin_id; si no, sub cuando no es email
  const rawId = data.id ?? data.user_id ?? data.admin_id ?? (emailFromSub ? null : sub) ?? null;
  const id =
    rawId && (UUID_RE.test(String(rawId)) || /^\d+$/.test(String(rawId)))
      ? String(rawId)
      : null;

  // nombre visible (si lo trae el token)
  const name =
    data.name ||
    data.nombre ||
    data.first_name ||
    data.given_name ||
    null;

  return { role, email, id, name };
}

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
      // 0) Login
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

      // 2) Extraer identidad desde el token y normalizar almacenamiento
      const { role, id, name } = extractAuthFromToken(token);
      localStorage.setItem("role", role);
      
      // Limpiar llaves que generan confusión
      localStorage.removeItem("id_admin");
      localStorage.removeItem("admin_id");

      if (role === "admin") {
        // Admin: nunca usar prestador_id
        localStorage.removeItem("prestador_id");

        // Guardamos id SOLO si vino un id válido en el token
        if (id) {
          localStorage.setItem("id", id);
        } else {
          // si no hay id, dejamos que la pantalla de perfil lo resuelva por email
          localStorage.removeItem("id");
        }

        // Nombre visible
        localStorage.setItem("userName", name || "Admin");
      } else {
        // Prestador (u otros roles no admin)
        // No guardes 'id' de admin; en su lugar, si sub/id es numérico/uuid y sirve para prestador, podés guardarlo como prestador_id
        if (id) {
          localStorage.setItem("prestador_id", id);
        } else {
          localStorage.removeItem("prestador_id");
        }
        localStorage.removeItem("id"); // por si venías de una sesión admin

        // Intentar traer nombre del prestador
        if (id) {
          try {
            const prestadorRes = await fetch(`${BASE_URL}/prestadores/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (prestadorRes.ok) {
              const prestador = await prestadorRes.json();
              localStorage.setItem("userName", prestador?.nombre || name || "Usuario");
            } else {
              localStorage.setItem("userName", name || "Usuario");
            }
          } catch {
            localStorage.setItem("userName", name || "Usuario");
          }
        } else {
          localStorage.setItem("userName", name || "Usuario");
        }
      }

      // 3) Señalizar cambio de auth y navegar
      setIsRefreshing(true);

      if (HARD_RELOAD_AFTER_LOGIN) {
        const defaultHome = role === "admin" ? "/admin/prestadores" : "/solicitudes";
        const intended = location.state?.from?.pathname;
        localStorage.setItem("postLoginPath", intended || defaultHome);
        window.location.reload();
        return;
      }

      try {
        window.dispatchEvent(new Event("auth-changed"));
      } catch {}

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
