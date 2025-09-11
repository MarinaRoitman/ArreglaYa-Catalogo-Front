import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import LogOut from "../components/LogOut";

describe("LogOut modal (UI e interacciones)", () => {
const Wrapper = ({ children }) => (
<MantineProvider>{children}</MantineProvider>
);

it("muestra título y mensaje cuando está abierto", () => {
render(
    <Wrapper>
    <LogOut opened={true} onCancel={() => {}} onConfirm={() => {}} />
    </Wrapper>
);

const dialog = screen.getByRole("dialog");
expect(
    screen.getByRole("heading", { name: /Cerrar sesión/i, level: 2, hidden: true })
).toBeInTheDocument();

// Mensaje de confirmación
expect(
    screen.getByText(/¿Seguro que querés salir\?/i)
).toBeInTheDocument();

// Botones
expect(
    screen.getByRole("button", { name: /^Cancelar$/i })
).toBeInTheDocument();
expect(
    screen.getByRole("button", { name: /^Cerrar sesión$/i })
).toBeInTheDocument();
});

it("dispara onCancel y onConfirm", () => {
const handleCancel = jest.fn();
const handleConfirm = jest.fn();

render(
    <Wrapper>
    <LogOut
        opened={true}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
    />
    </Wrapper>
);

fireEvent.click(screen.getByRole("button", { name: /^Cancelar$/i }));
fireEvent.click(screen.getByRole("button", { name: /^Cerrar sesión$/i }));

expect(handleCancel).toHaveBeenCalledTimes(1);
expect(handleConfirm).toHaveBeenCalledTimes(1);
});

it("muestra el botón de confirmación en estado loading", () => {
render(
    <Wrapper>
    <LogOut opened={true} onCancel={() => {}} onConfirm={() => {}} loading />
    </Wrapper>
);

const confirmBtn = screen.getByRole("button", { name: /^Cerrar sesión$/i });
expect(confirmBtn).toHaveAttribute("data-loading");
});
});
