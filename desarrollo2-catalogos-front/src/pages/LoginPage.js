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
import { API_URL } from "../Api/api";

const HARD_RELOAD_AFTER_LOGIN = false;

/* ========== Helpers ========== */
function parseJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(txt || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : {};
}

async function findAdminByEmail(email, token) {
  const e = (email || "").trim().toLowerCase();
  if (!e) return null;

  // 1) Intento con query param (si el back lo soporta)
  try {
    const data = await fetchJson(`${API_URL}admins/?email=${encodeURIComponent(e)}`, token);
    if (Array.isArray(data)) {
      return data.find((a) => (a?.email || "").trim().toLowerCase() === e) || null;
    }
    if (data && (data.email || "").trim().toLowerCase() === e) return data;
  } catch { /* fallback */ }

  // 2) Fallback: listar y filtrar
  try {
    const all = await fetchJson(`${API_URL}admins/`, token);
    if (Array.isArray(all)) {
      return all.find((a) => (a?.email || "").trim().toLowerCase() === e) || null;
    }
  } catch { /* noop */ }

  return null;
}

async function findPrestadorByEmail(email, token) {
  const e = (email || "").trim().toLowerCase();
  if (!e) return null;

  try {
    const data = await fetchJson(`${API_URL}prestadores/?email=${encodeURIComponent(e)}`, token);
    if (Array.isArray(data)) {
      return data.find((p) => (p?.email || "").trim().toLowerCase() === e) || null;
    }
    if (data && (data.email || "").trim().toLowerCase() === e) return data;
  } catch { /* fallback */ }

  try {
    const all = await fetchJson(`${API_URL}prestadores/`, token);
    if (Array.isArray(all)) {
      return all.find((p) => (p?.email || "").trim().toLowerCase() === e) || null;
    }
  } catch { /* noop */ }

  return null;
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
      // Usamos el email del formulario como "fuente de verdad"
      const loginEmail = String(formData.usuario || "").trim().toLowerCase();
      if (!loginEmail) throw new Error("Ingresá tu email.");

      // 0) Login
      const res = await fetch(`${API_URL}auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: loginEmail, password: formData.contrasena }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Credenciales inválidas");
      }

      const data = await res.json();
      const token = data?.access_token || data?.token;
      if (!token) throw new Error("No se recibió token");

      // 1) Guardar token y email canónico de login
      localStorage.setItem("token", token);
      localStorage.setItem("login_email", loginEmail);

      // 2) Extraer SOLO el rol del token (no IDs, no email)
      const payload = parseJwt(token) || {};
      const roleRaw = payload.role ?? payload.rol ?? payload.r ?? "";
      const role = String(roleRaw || "").toLowerCase().trim();
      localStorage.setItem("role", role || "");

      // 3) Limpiar llaves confusas SIEMPRE
      localStorage.removeItem("id_admin");
      localStorage.removeItem("admin_id");
      localStorage.removeItem("id");
      localStorage.removeItem("prestador_id");

      // 4) Resolver perfil por email
      let userName = "Usuario";

      if (role === "admin") {
        const admin = await findAdminByEmail(loginEmail, token);
        if (!admin) throw new Error("No se encontró el administrador por email.");

        if (admin.id != null) {
          localStorage.setItem("id", String(admin.id)); // id correcto de admin

        }
        userName =
          admin.nombre ||
          `${admin.nombre || ""} ${admin.apellido || ""}`.trim() ||
          "Admin";

        const fotoUrl = admin.foto || admin.foto_url || "";
        localStorage.setItem("userFoto", fotoUrl);

        localStorage.removeItem("prestador_id");
      } else {
        const prestador = await findPrestadorByEmail(loginEmail, token);
        if (prestador && prestador.id != null) {
          localStorage.setItem("prestador_id", String(prestador.id)); // id correcto de prestador
          userName =
            prestador.nombre ||
            `${prestador.nombre || ""} ${prestador.apellido || ""}`.trim() ||
            "Usuario";
          
          const fotoUrl = prestador.foto || prestador.foto_url || "";
          localStorage.setItem("userFoto", fotoUrl);
        } else {
          userName = "Usuario";
        }
        localStorage.removeItem("id"); // no arrastrar id admin
      }

      localStorage.setItem("userName", userName);

      // 5) Señalizar cambio y navegar
      setIsRefreshing(true);

      const defaultHome = role === "admin" ? "/admin/prestadores" : "/solicitudes";
      const intended = location.state?.from?.pathname;
      const nextPath = intended || defaultHome;

      if (HARD_RELOAD_AFTER_LOGIN) {
        localStorage.setItem("postLoginPath", nextPath);
        window.location.reload();
        return;
      }

      try {
        window.dispatchEvent(new Event("auth-changed"));
      } catch {}

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
