// src/__test__/CardsHabilidad.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import CardsHabilidad from "../components/CardsHabilidad";

const Wrapper = ({ children }) => <MantineProvider>{children}</MantineProvider>;

describe("CardsHabilidad (UI e interacciones)", () => {
  const sampleRows = [
    { id: 1, nombre: "Plomería", servicio: "Reparaciones" },
    { id: 2, nombre: "Electricidad", servicio: "Instalaciones" },
  ];

  it("renderiza las cards con nombres y servicios", () => {
    render(<CardsHabilidad rows={sampleRows} />, { wrapper: Wrapper });

    expect(screen.getByText("Plomería")).toBeInTheDocument();
    expect(screen.getByText("Reparaciones")).toBeInTheDocument();
    expect(screen.getByText("Electricidad")).toBeInTheDocument();
    expect(screen.getByText("Instalaciones")).toBeInTheDocument();
  });

  it("dispara onEdit y onDelete al hacer click en los iconos", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(
      <CardsHabilidad rows={sampleRows} onEdit={onEdit} onDelete={onDelete} />,
      { wrapper: Wrapper }
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // primer ActionIcon (editar)
    expect(onEdit).toHaveBeenCalledWith(sampleRows[0]);

    fireEvent.click(buttons[1]); // segundo ActionIcon (borrar)
    expect(onDelete).toHaveBeenCalledWith(sampleRows[0].id);
  });

  it("no rompe si no se pasan onEdit ni onDelete", () => {
    render(<CardsHabilidad rows={sampleRows} />, { wrapper: Wrapper });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    // No se espera error aun sin callbacks
  });
});
