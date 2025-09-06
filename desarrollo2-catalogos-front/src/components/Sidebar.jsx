import React from "react";
import { Box, ScrollArea, Group, Avatar, Text, NavLink, Divider } from "@mantine/core";
import { IconHome, IconListDetails, IconCheck, IconBolt, IconUser, IconLogout } from "@tabler/icons-react";

export default function Sidebar() {
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
          <Group align="center" gap="md">
            <Avatar radius="xl" />
            <Text size="sm">Usuario</Text>
          </Group>

          <NavLink
            label="Trabajos"
            leftSection={<IconHome size={18} />}
            variant="filled"
            mt="md"
          />
          <NavLink
            label="Pendientes"
            leftSection={<IconListDetails size={18} />}
            active
            mt="xs"
          />
          <NavLink
            label="Realizadas"
            leftSection={<IconCheck size={18} />}
            mt="xs"
          />

          <Divider my="md" />
          <NavLink label="Habilidades" leftSection={<IconBolt size={18} />} />
        </Box>
      </ScrollArea>

      <Box
        p="md"
        style={{
          borderTop: "1px solid var(--mantine-color-gray-3)",
          paddingBottom: 16,
        }}
      >
        <NavLink label="Mi Perfil" leftSection={<IconUser size={18} />} mb={6} />
        <NavLink
          label="Log out"
          leftSection={<IconLogout size={18} />}
          color="red"
          variant="subtle"
        />
      </Box>
    </Box>
  );
}
