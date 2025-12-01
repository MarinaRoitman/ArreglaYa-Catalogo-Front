import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  AppShell,
  Paper,
  Group,
  Text,
  TextInput,
  Stack,
  Divider,
  LoadingOverlay,
  Alert,
  Avatar,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import { getAdminById, listAdmins } from "../Api/admins";

/* ================ Utils ================ */
function parseJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function resolveAdminIdSync() {
  const keys = ["id", "id_admin", "admin_id"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v && String(v).trim()) return String(v).trim();
  }
  const token = localStorage.getItem("token");
  const data = token ? parseJwt(token) : null;
  const candidate = data?.id ?? data?.id_admin ?? data?.admin_id;
  return candidate != null ? String(candidate) : null;
}

function normalizeAdmin(raw = {}) {
  const nombre =
    raw.nombre ??
    raw.first_name ??
    raw.name ??
    (raw.nombreCompleto ? String(raw.nombreCompleto).split(" ")[0] : "") ??
    "";

  const apellido =
    raw.apellido ??
    raw.last_name ??
    raw.surname ??
    (raw.nombreCompleto ? String(raw.nombreCompleto).split(" ").slice(1).join(" ") : "") ??
    "";

  const email = raw.email ?? raw.correo ?? raw.mail ?? "";
  const id = raw.id ?? raw.id_admin ?? raw.admin_id ?? null;

  return { id, nombre, apellido, email };
}

export default function AdminPerfil() {
  const navigate = useNavigate();

  const [navOpened, setNavOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [form, setForm] = useState({ nombre: "", apellido: "", email: "" });

  const idAdminSync = useMemo(() => resolveAdminIdSync(), []);

  const discoverIdByEmail = useCallback(async () => {
    const token = localStorage.getItem("token");
    const data = token ? parseJwt(token) : null;
    const emailFromToken = data?.sub || data?.email;
    if (!emailFromToken) return null;

    const all = await listAdmins();
    const match = Array.isArray(all)
      ? all.find(
          (a) =>
            (a?.email || "").toLowerCase().trim() ===
            emailFromToken.toLowerCase().trim()
        )
      : null;

    if (match?.id != null) {
      localStorage.setItem("id", String(match.id));
      return String(match.id);
    }
    return null;
  }, []);

  const loadMe = useCallback(async () => {
    setInfo("");
    try {
      setLoading(true);

      let targetId = idAdminSync;
      if (!targetId) targetId = await discoverIdByEmail();

      if (!targetId) {
        setError("No se pudo determinar tu usuario (id). Iniciá sesión nuevamente.");
        return;
      }

      const data = await getAdminById(targetId);
      const norm = normalizeAdmin(data);

      if (!norm.id) {
        setError("Admin no encontrado.");
        return;
      }

      setForm({ nombre: norm.nombre, apellido: norm.apellido, email: norm.email });
    } catch (e) {
      if (e?.code === "AUTH") {
        navigate("/login", { replace: true });
        return;
      }
      const msg = e?.message || "";
      if (/no encontrado/i.test(msg)) {
        setError("Admin no encontrado.");
      } else {
        setError(msg || "Error al cargar el perfil.");
      }
    } finally {
      setLoading(false);
    }
  }, [idAdminSync, discoverIdByEmail, navigate]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  /* ========== Iniciales del admin ========== */
  const getInitials = (nombre, apellido) =>
    `${(nombre?.[0] || "").toUpperCase()}${(apellido?.[0] || "").toUpperCase()}`;

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 280, breakpoint: "sm", collapsed: { mobile: !navOpened } }}
      padding="md"
    >
      <AppShell.Header>
        <Header opened={navOpened} toggle={() => setNavOpened((o) => !o)} />
      </AppShell.Header>

      <AppShell.Navbar p="0">
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Paper p="lg" radius="md" withBorder pos="relative">
          <LoadingOverlay visible={loading} zIndex={1000} />

          <Stack gap="md">
            <Text fw={600} size="lg">
              Mi Perfil (Admin)
            </Text>

            {(error || info) && (
              <Alert
                color={error ? "red" : "green"}
                icon={<IconAlertCircle size={16} />}
                variant="light"
              >
                {error || info}
              </Alert>
            )}

            {/* Avatar con iniciales */}
            <Stack align="center" gap="md">
              <Avatar color="#b67747ff" size={120} radius="100%">
                {getInitials(form.nombre, form.apellido)}
              </Avatar>
            </Stack>

            <Divider />

            {/* Datos del Admin */}
            <Stack gap="sm">
              <Group grow>
                <TextInput label="Nombre" value={form.nombre} readOnly />
                <TextInput label="Apellido" value={form.apellido} readOnly />
              </Group>
              <TextInput label="Email" value={form.email} readOnly />
            </Stack>
          </Stack>
        </Paper>
      </AppShell.Main>
    </AppShell>
  );
}
