// src/__test__/HabilidadesFilterbar.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import HabilidadesFilterbar from "../components/HabilidadesFilter";

const Wrapper = ({ children }) => <MantineProvider>{children}</MantineProvider>;

describe("HabilidadesFilterbar (UI e interacciones)", () => {
it("renderiza los inputs y llama a los setters además de setPage al escribir", () => {
const setFNombre = jest.fn();
const setFServicio = jest.fn();
const setPage = jest.fn();

render(
    <HabilidadesFilterbar
    fNombre=""
    setFNombre={setFNombre}
    fServicio=""
    setFServicio={setFServicio}
    setPage={setPage}
    />,
    { wrapper: Wrapper }
);

// Verificar que los dos campos se renderizan
expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
expect(screen.getByLabelText(/Servicio/i)).toBeInTheDocument();

// Escribir en "Nombre"
fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Juan" } });
expect(setPage).toHaveBeenCalledWith(1);
expect(setFNombre).toHaveBeenCalledWith("Juan");

// Escribir en "Servicio"
fireEvent.change(screen.getByLabelText(/Servicio/i), { target: { value: "Electricidad" } });
expect(setPage).toHaveBeenCalledWith(1);
expect(setFServicio).toHaveBeenCalledWith("Electricidad");
});

it("no rompe si setPage no se pasa como prop", () => {
const setFNombre = jest.fn();
const setFServicio = jest.fn();

render(
    <HabilidadesFilterbar
    fNombre=""
    setFNombre={setFNombre}
    fServicio=""
    setFServicio={setFServicio}
    />,
    { wrapper: Wrapper }
);

fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Test" } });
expect(setFNombre).toHaveBeenCalledWith("Test");
});
});
