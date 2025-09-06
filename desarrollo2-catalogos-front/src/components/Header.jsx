import React from "react";
import { Group, Burger, Image, Box } from "@mantine/core";

export default function Header({ opened, toggle }) {
  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" />
      <Group justify="center" style={{ flex: 1, minWidth: 0 }}>
        <Image
          src="/ArreglaYaIcon.jpeg"
          alt="Arregla Ya"
          h={45}
          mah="100%"
          fit="contain"
        />
      </Group>
      <Box w={36} />
    </Group>
  );
}
