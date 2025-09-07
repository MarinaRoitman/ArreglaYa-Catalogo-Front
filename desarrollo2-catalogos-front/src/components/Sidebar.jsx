import React, { useState } from "react";
import { Box, ScrollArea, Group, Avatar, Text, NavLink, Divider } from "@mantine/core";
import { IconHome, IconListDetails, IconBolt, IconUser, IconLogout, IconChecks, IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmLogoutModal from "./LogOut";

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const initial = localStorage.getItem("userName") || "Usuario";
  const onlyName = initial.split(" ")[0]; 
  const [userName] = useState(onlyName);

  const initials = userName ? userName[0].toUpperCase() : "";

  const doLogout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      sessionStorage.clear();
    } finally {
      setLoading(false);
      setLogoutOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <Box style={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: "4px 0 12px -4px rgba(0,0,0,0.12)" }}>
      <ScrollArea type="never" style={{ flex: 1 }}>
        <Box p="md">
          <Group align="center" gap="md">
            <Avatar radius="xl" color="#b67747ff">{initials}</Avatar>
            <Text size="sm" fw={600}>¡Bienvenid@ {userName}!</Text>
          </Group>

          <NavLink label="Trabajos" leftSection={<IconHome size={18} />} variant="filled" mt="md" />
          <NavLink
            label="Solicitudes"
            leftSection={<IconListDetails size={18} />}
            mt="xs"
            onClick={() => navigate("/solicitudes")}
            active={pathname.startsWith("/solicitudes")}
          />
          <NavLink label="Confirmados" leftSection={<IconChecks size={18} />}  mt="xs" />
          <NavLink label="Realizados" leftSection={<IconRosetteDiscountCheckFilled size={18} />} mt="xs" />

          <Divider my="md" />
          <NavLink
            label="Habilidades"
            leftSection={<IconBolt size={18} />}
            onClick={() => navigate("/habilidades")}
            active={pathname.startsWith("/habilidades")}
          />
        </Box>
      </ScrollArea>

      <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-gray-3)", paddingBottom: 16 }}>
        <NavLink label="Mi Perfil" leftSection={<IconUser size={18} />} mb={6} />
        <NavLink
          label="Log out"
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
