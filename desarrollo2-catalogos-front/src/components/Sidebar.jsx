import React, { useState } from "react";
import { Box, ScrollArea,  Group, Avatar, Text, NavLink, Divider } from "@mantine/core";
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
  IconTool,
  IconMapPin,
  IconCircleXFilled,
  IconReload,
} from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmLogoutModal from "./LogOut";
import ModalReprocesarEventos from "./ModalReprocesarEventos";
import { crearEvento } from "../Api/procesarEvento";


export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const userName = localStorage.getItem("userName") || "Usuario";
  const role = (localStorage.getItem("role") || "").toLowerCase().trim();
  const isAdmin = role === "admin";

  const userFoto = isAdmin ? null : localStorage.getItem("userFoto"); // 🔥 admin NO usa foto
  const initials = userName ? userName[0].toUpperCase() : "";


  const doLogout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("role");
      localStorage.removeItem("prestador_id");
      localStorage.removeItem("userFoto");
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
          {isAdmin ? (
            <Avatar radius="xl" color="#b67747ff">{initials}</Avatar>
          ) : (
            <Avatar src={userFoto} radius="xl" color="#b67747ff">{initials}</Avatar>
          )}

          <Box style={{ display: "flex", flexDirection: "column", maxWidth: 150, paddingBottom: 10 }}>
            <Text size="sm" color="#885a37ff" fw={700}>
              ¡Bienvenid@!
            </Text>

            <Text
              size="sm"
              fw={600}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,       
                WebkitBoxOrient: "vertical",
                lineHeight: 1.2,
                marginTop: 2,
              }}
            >
              {userName}
            </Text>
          </Box>
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
                label="Zonas"
                leftSection={<IconMapPin size={18} />}
                mt="xs"
                onClick={() => navigate("/admin/zonas")}
                active={pathname.startsWith("/admin/zonas")}
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
              <NavLink
                label="Re-procesar Eventos"
                leftSection={<IconReload size={18} />}
                mt="xs"
                color="#b67747ff"
                onClick={async () => {
                  try {
                    setLoading(true);

                    const res = await crearEvento();

                    // Si el backend devuelve { message: "Reprocesamiento de eventos..." }
                    const mensaje =
                      (typeof res === "object" && res.message) ||
                      "Reprocesamiento iniciado.";

                    setModalMessage(mensaje);
                    setModalOpen(true);

                  } catch (err) {
                    console.error(err);
                    setModalMessage("Error al re-procesar eventos.");
                    setModalOpen(true);
                  } finally {
                    setLoading(false);
                  }
                }}
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
              <NavLink
                label="Cancelados"
                leftSection={<IconCircleXFilled size={18} />}
                mt="xs"
                onClick={() => navigate("/cancelados")}
                active={pathname.startsWith("/cancelados")}
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
              component="a"
              href="https://desarrollo-aplicaciones-front-rkjc7l3lb.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
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
      <ModalReprocesarEventos
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
      />

    </Box>
  );
}
