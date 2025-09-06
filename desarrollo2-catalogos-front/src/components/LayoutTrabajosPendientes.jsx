import React from "react";
import { AppShell, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import HeaderBar from "./Header";
import Sidebar from "./Sidebar";

export default function LayoutTrabajosPendientes({ children }) {
const [opened, { toggle }] = useDisclosure();

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
    styles={{ main: { background: "#CCC1B6" } }}
>
    <AppShell.Header style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
    <HeaderBar opened={opened} toggle={toggle} />
    </AppShell.Header>

    {opened && (
    <Box
        pos="fixed"
        inset={0}
        bg="rgba(0,0,0,.35)"
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
