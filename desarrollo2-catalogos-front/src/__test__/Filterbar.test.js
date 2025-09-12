// src/__test__/Filterbar.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import Filterbar from "../components/Filterbar";

const Wrapper = ({ children }) => <MantineProvider>{children}</MantineProvider>;

describe("Filterbar (UI e interacciones)", () => {
  it("renderiza todos los inputs y dispara los setters al escribir", () => {
    const setFNombre = jest.fn();
    const setFTel = jest.fn();
    const setFDir = jest.fn();
    const setFFecha = jest.fn();
    const setFServ = jest.fn();
    const setFHab = jest.fn();

    render(
      <Filterbar
        fNombre=""
        setFNombre={setFNombre}
        fTel=""
        setFTel={setFTel}
        fDir=""
        setFDir={setFDir}
        fFecha=""
        setFFecha={setFFecha}
        fServ=""
        setFServ={setFServ}
        fHab=""
        setFHab={setFHab}
      />,
      { wrapper: Wrapper }
    );

    // Labels de todos los campos
    expect(screen.getByLabelText(/Nombre y Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha y Hora/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Servicio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Habilidad/i)).toBeInTheDocument();

    // Simular escritura en cada input y verificar que se llama el setter correspondiente
    fireEvent.change(screen.getByLabelText(/Nombre y Apellido/i), { target: { value: "Juan" } });
    expect(setFNombre).toHaveBeenCalledWith("Juan");

    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: "123" } });
    expect(setFTel).toHaveBeenCalledWith("123");

    fireEvent.change(screen.getByLabelText(/Dirección/i), { target: { value: "Calle Falsa" } });
    expect(setFDir).toHaveBeenCalledWith("Calle Falsa");

    fireEvent.change(screen.getByLabelText(/Fecha y Hora/i), { target: { value: "2025-09-10" } });
    expect(setFFecha).toHaveBeenCalledWith("2025-09-10");

    fireEvent.change(screen.getByLabelText(/Servicio/i), { target: { value: "Plomería" } });
    expect(setFServ).toHaveBeenCalledWith("Plomería");

    fireEvent.change(screen.getByLabelText(/Habilidad/i), { target: { value: "Caños" } });
    expect(setFHab).toHaveBeenCalledWith("Caños");
  });
});
