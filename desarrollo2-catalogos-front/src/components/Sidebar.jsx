import React, { useState } from "react";
import { Box, ScrollArea, Stack, Group, Avatar, Text, NavLink, Divider } from "@mantine/core";
import {
  IconListDetails,
  IconBolt,
  IconUser,
  IconLogout,
  IconChecks,
  IconRosetteDiscountCheckFilled,
  IconCreditCard,
  IconStar,
  IconTools,
  IconTool
} from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmLogoutModal from "./LogOut";

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);



  const userName = localStorage.getItem("userName") || "Usuario";
  const userFoto = localStorage.getItem("userFoto"); // 1. Leemos la URL de la foto
  const initials = userName ? userName[0].toUpperCase() : "";

  const role = (localStorage.getItem("role") || "").toLowerCase().trim();
  const isAdmin = role === "admin";

  const doLogout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("role");
      localStorage.removeItem("prestador_id");
      sessionStorage.clear();
    } finally {
      setLoading(false);
      setLogoutOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <Box
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 12px -4px rgba(0,0,0,0.12)",
      }}
    >
    <ScrollArea type="never" style={{ flex: 1 }}>
      <Box p="md">
        <Group align="center" gap="md" wrap="nowrap">
          {/* 2. Pasamos la URL de la foto al Avatar */}
          <Avatar src={userFoto} radius="xl" color="#b67747ff">
            {initials} {/* Mantenemos las iniciales como fallback */}
          </Avatar>
          <Text size="sm" fw={600} truncate="end">
            ¡Bienvenid@ {userName}!
          </Text>
        </Group>

          {isAdmin ? (
            // ====== MENÚ ADMIN ======
            <>
              <NavLink
                label="Prestadores"
                leftSection={<IconListDetails size={18} />}
                mt="xs"
                onClick={() => navigate("/admin/prestadores")}
                active={pathname.startsWith("/admin/prestadores")}
                color="#b67747ff"
              />
              <NavLink
                label="Servicios"
                leftSection={<IconTool size={18} />}
                mt="xs"
                onClick={() => navigate("/admin/servicios")}
                active={pathname.startsWith("/admin/servicios")}
                color="#b67747ff"
              />
              <NavLink
                label="Habilidades"
                leftSection={<IconBolt size={18} />}
                mt="xs"
                onClick={() => navigate("/admin/habilidades")}
                active={pathname.startsWith("/admin/habilidades")}
                color="#b67747ff"
              />
              <NavLink
                label="Vínculos Prestadores"
                leftSection={<IconTools size={18} />}
                mt="xs"
                onClick={() => navigate("/admin/vinculos")}
                active={pathname.startsWith("/admin/vinculos")}
                color="#b67747ff"
              />
            </>
          ) : (
            // ====== MENÚ PRESTADOR (TU MENÚ ORIGINAL) ======
            <>
              <NavLink
                label="Solicitudes"
                leftSection={<IconListDetails size={18} />}
                mt="xs"
                onClick={() => navigate("/solicitudes")}
                active={pathname.startsWith("/solicitudes")}
                color="#b67747ff"
              />
              <NavLink
                label="Confirmados"
                leftSection={<IconChecks size={18} />}
                mt="xs"
                onClick={() => navigate("/confirmados")}
                active={pathname.startsWith("/confirmados")}
                color="#b67747ff"
              />
              <NavLink
                label="Realizados"
                leftSection={<IconRosetteDiscountCheckFilled size={18} />}
                mt="xs"
                onClick={() => navigate("/realizados")}
                active={pathname.startsWith("/realizados")}
                color="#b67747ff"
              />
              <Divider my="md" />
              <NavLink
                label="Habilidades"
                leftSection={<IconBolt size={18} />}
                onClick={() => navigate("/habilidades")}
                active={pathname.startsWith("/habilidades")}
                color="#b67747ff"
              />
              <NavLink
                label="Calificaciones"
                leftSection={<IconStar size={18} />}
                onClick={() => navigate("/calificaciones")}
                active={pathname.startsWith("/calificaciones")}
                color="#b67747ff"
              />
              <Divider my="md" />
              <NavLink
                label="Ir a Pagos"
                leftSection={<IconCreditCard size={18} />}
                color="#b67747ff"
              />
            </>
          )}
        </Box>
      </ScrollArea>

      <Box
        p="md"
        style={{ borderTop: "1px solid var(--mantine-color-gray-3)", paddingBottom: 16 }}
      >
        <NavLink
          label="Mi Perfil"
          leftSection={<IconUser size={18} />}
          mb={6}
          onClick={() => navigate(isAdmin ? "/admin/perfil" : "/perfil")}
          active={isAdmin ? pathname.startsWith("/admin/perfil") : pathname.startsWith("/perfil")}
          color="#b67747ff"
        />

        <NavLink
          label="Cerrar Sesión"
          leftSection={<IconLogout size={18} />}
          color="red"
          variant="subtle"
          onClick={() => setLogoutOpen(true)}
        />
      </Box>

      <ConfirmLogoutModal
        opened={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={doLogout}
        loading={loading}
      />
    </Box>
  );
}
