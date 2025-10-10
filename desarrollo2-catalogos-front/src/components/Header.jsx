import React from "react";
import {
  Group,
  Burger,
  Image,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import { IconSun, IconMoonStars } from "@tabler/icons-react";

export default function Header({ opened, toggle }) {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light", { getInitialValueInEffect: true });

  const toggleTheme = () => {
    const next = computed === "dark" ? "light" : "dark";
    setColorScheme(next);
    try {
      localStorage.setItem("mantine-color-scheme", next);
    } catch {}
  };

  // ✅ Elegir logo según tema
  const logoSrc = computed === "dark" ? "/ArreglaYaDark.png" : "/ArreglaYaIcon.jpeg";

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" />

      <Group justify="center" style={{ flex: 1, minWidth: 0 }}>
        <Image
          src={logoSrc}
          alt="Arregla Ya"
          h={45}
          mah="100%"
          fit="contain"
        />
      </Group>

      <ActionIcon
        onClick={toggleTheme}
        variant="subtle"
        title="Cambiar modo de color"
        aria-label="Cambiar modo de color"
      >
        {computed === "dark" ? <IconSun size={22} /> : <IconMoonStars size={22} />}
      </ActionIcon>
    </Group>
  );
}
