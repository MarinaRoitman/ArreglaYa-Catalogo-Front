import React from "react";
import { AppShell, Box, useComputedColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import HeaderBar from "./Header";
import Sidebar from "./Sidebar";

export default function LayoutTrabajosPendientes({ children }) {
const [opened, { toggle }] = useDisclosure();
const scheme = useComputedColorScheme("light", { getInitialValueInEffect: true });

return (
<AppShell
    header={{ height: 64, zIndex: 300 }}
    navbar={{
    width: 240,
    breakpoint: "sm",
    collapsed: { mobile: !opened },
    offset: false,
    zIndex: 400,
    }}
    padding="lg"
    styles={(theme) => ({
    // Fondo del área principal
    main: {
        background: scheme === "dark" ? theme.colors.dark[7] : "#CCC1B6",
    },
    })}
>
    <AppShell.Header style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
    <HeaderBar opened={opened} toggle={toggle} />
    </AppShell.Header>

    {opened && (
    <Box
        pos="fixed"
        inset={0}
        // leve ajuste del overlay para dark
        bg={scheme === "dark" ? "rgba(0,0,0,.55)" : "rgba(0,0,0,.35)"}
        style={{ zIndex: 350 }}
        onClick={toggle}
    />
    )}

    <AppShell.Navbar p={0} withBorder={false} offset={false} zIndex={400}>
    <Sidebar />
    </AppShell.Navbar>

    <AppShell.Main>{children}</AppShell.Main>
</AppShell>
);
}
