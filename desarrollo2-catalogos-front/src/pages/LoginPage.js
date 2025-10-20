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
import { listAdmins } from '../Api/admins'; 
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
  const roleRaw = data.role ?? data.rol ?? data.r ?? "";
  const role = String(roleRaw || "").toLowerCase().trim();

  const sub = data.sub != null ? String(data.sub) : "";
  const emailFromSub = EMAIL_RE.test(sub) ? sub : null;
  const email =
    emailFromSub ||
    data.email ||
    data.correo ||
    data.mail ||
    null;

  const rawId = data.id ?? data.user_id ?? data.admin_id ?? (emailFromSub ? null : sub) ?? null;
  const id =
    rawId && (UUID_RE.test(String(rawId)) || /^\d+$/.test(String(rawId)))
      ? String(rawId)
      : null;

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

      localStorage.setItem("token", token);

      const { role, id, name } = extractAuthFromToken(token);
      const email = extractAuthFromToken(token).email;
      localStorage.setItem("role", role);
      
      localStorage.removeItem("id_admin");
      localStorage.removeItem("admin_id");

    if (role === "admin") {
      console.log("--- DEBUG: Flujo de Admin detectado.");
      localStorage.removeItem("prestador_id");
      console.log("--- DEBUG: Buscando por email:", email);

      if (email) {
        try {
          console.log(`--- DEBUG: Llamando a listAdmins() para encontrar email: ${email}...`);
          const allAdmins = await listAdmins(); 
          
          const adminDetails = Array.isArray(allAdmins)
            ? allAdmins.find((a) => (a?.email || "").toLowerCase().trim() === email.toLowerCase().trim())
            : null;

          console.log("--- DEBUG: Admin encontrado:", adminDetails);

          if (adminDetails) {
            const adminName = `${adminDetails?.nombre || ''} ${adminDetails?.apellido || ''}`.trim() || name || 'Admin';
            const adminFoto = adminDetails?.foto || adminDetails?.foto_url || '';
            const adminId = adminDetails?.id || adminDetails?.id_admin || null; 
            localStorage.setItem("userName", adminName);
            localStorage.setItem("userFoto", adminFoto);
            
            if (adminId) {
              localStorage.setItem("id", String(adminId)); 
            } else {
              localStorage.removeItem("id"); 
            }
            
            console.log("--- DEBUG: ¡Éxito! localStorage actualizado con:", { userName: adminName, userFoto: adminFoto, id: adminId });
          } else {
            console.warn("--- DEBUG: El email del token no se encontró en listAdmins(). Usando defaults.");
            localStorage.setItem("userName", name || "Admin");
            localStorage.removeItem("userFoto");
            localStorage.removeItem("id");
          }

        } catch (error) {
          console.error("--- DEBUG: ERROR al llamar a listAdmins() ---", error);
          localStorage.setItem("userName", name || "Admin");
          localStorage.removeItem("userFoto");
          localStorage.removeItem("id");
        }
      } else {
        console.warn("--- DEBUG: Admin logueado SIN EMAIL en el token. Usando defaults.");
        localStorage.removeItem("id");
        localStorage.setItem("userName", name || "Admin");
        localStorage.removeItem("userFoto");
      }


      } else {
        if (id) {
          localStorage.setItem("prestador_id", id);
        } else {
          localStorage.removeItem("prestador_id");
        }
        localStorage.removeItem("id"); 

        if (id) {
          try {
            const prestadorRes = await fetch(`${BASE_URL}/prestadores/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (prestadorRes.ok) {
              const prestador = await prestadorRes.json();
              localStorage.setItem("userName", prestador?.nombre || name || "Usuario");
              localStorage.setItem("userFoto", prestador?.foto || ""); 
              localStorage.setItem("userName", name || "Usuario");
            }
          } catch {
            localStorage.setItem("userName", name || "Usuario");
          }
        } else {
          localStorage.setItem("userName", name || "Usuario");
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
