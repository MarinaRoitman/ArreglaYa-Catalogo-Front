import React from "react";
import { Avatar, Stack, Text } from "@mantine/core";

const MOCK_PHOTO = "https://i.pravatar.cc/240?u=admin"; // mock por ahora

export default function AdminProfilePhoto({
nombre = "",
apellido = "",
fotoUrl, 
}) {
const initials = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();
const src = (typeof fotoUrl === "string" && fotoUrl.trim()) ? fotoUrl.trim() : MOCK_PHOTO;

return (
<Stack gap="xs" align="center">
    <Avatar src={src} alt="Foto de perfil" size={120} radius="xl">
    {initials}
    </Avatar>
    <Text size="sm" c="dimmed">
    Foto de perfil
    </Text>
</Stack>
);
}
