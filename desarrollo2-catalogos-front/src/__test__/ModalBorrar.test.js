// src/__test__/ConfirmDelete.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import ConfirmDelete from "../components/ModalBorrar";

describe("ConfirmDelete modal (UI e interacciones)", () => {
const wrapper = ({ children }) => <MantineProvider>{children}</MantineProvider>;

it("muestra título, mensaje y botones cuando está abierto", () => {
const onCancel = jest.fn();
const onConfirm = jest.fn();

render(
    <ConfirmDelete
    opened={true}
    onCancel={onCancel}
    onConfirm={onConfirm}
    />,
    { wrapper }
);

// Título
expect(screen.getByText(/Confirmar eliminación/i)).toBeInTheDocument();
// Mensaje de confirmación
expect(
    screen.getByText(/¿Seguro que querés realizar la operación\?/i)
).toBeInTheDocument();
// Botones
expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Eliminar/i })).toBeInTheDocument();
});

it("ejecuta callbacks al hacer clic en los botones", () => {
const onCancel = jest.fn();
const onConfirm = jest.fn();

render(
    <ConfirmDelete
    opened={true}
    onCancel={onCancel}
    onConfirm={onConfirm}
    />,
    { wrapper }
);

fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
expect(onCancel).toHaveBeenCalledTimes(1);

fireEvent.click(screen.getByRole("button", { name: /Eliminar/i }));
expect(onConfirm).toHaveBeenCalledTimes(1);
});

it("muestra el botón de eliminar en estado loading cuando loading=true", () => {
render(
    <ConfirmDelete
    opened={true}
    onCancel={() => {}}
    onConfirm={() => {}}
    loading={true}
    />,
    { wrapper }
);

const eliminarBtn = screen.getByRole("button", { name: /Eliminar/i });
// El botón debe estar en estado disabled/loading
expect(eliminarBtn).toBeDisabled();
});

it("no renderiza nada cuando opened=false", () => {
render(
    <ConfirmDelete
    opened={false}
    onCancel={() => {}}
    onConfirm={() => {}}
    />,
    { wrapper }
);

// El modal no se muestra
expect(screen.queryByText(/Confirmar eliminación/i)).not.toBeInTheDocument();
});
});
