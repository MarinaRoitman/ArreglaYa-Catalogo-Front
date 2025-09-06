import React, { useState } from "react";
import { Box, ScrollArea, Group, Avatar, Text, NavLink, Divider } from "@mantine/core";
import { IconHome, IconListDetails, IconBolt, IconUser, IconLogout, IconChecks,IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import ConfirmLogoutModal from "./LogOut";

export default function Sidebar() {
const navigate = useNavigate();
const [logoutOpen, setLogoutOpen] = useState(false);
const [loading, setLoading] = useState(false);

const doLogout = async () => {
  try {
    setLoading(true);
    // Opcional: await api.post('/auth/logout')
    localStorage.removeItem("token");      
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
          <Avatar radius="xl" />
          <Text size="sm">Usuario</Text>
        </Group>

        <NavLink label="Trabajos" leftSection={<IconHome size={18} />} variant="filled" mt="md" />
        <NavLink label="Solicitudes" leftSection={<IconListDetails size={18} />} active mt="xs" />
        <NavLink label="Confirmados" leftSection={<IconChecks size={18} />}  mt="xs" />
        <NavLink label="Realizados" leftSection={<IconRosetteDiscountCheckFilled size={18} />} mt="xs" />

        <Divider my="md" />
        <NavLink label="Habilidades" leftSection={<IconBolt size={18} />} />
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
