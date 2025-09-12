// src/__test__/Header.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // por si en el futuro el header usa navegación
import { MantineProvider } from "@mantine/core";
import Header from "../components/Header";

describe("Header (UI e interacciones básicas)", () => {
  const Wrapper = ({ children }) => (
    <MantineProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </MantineProvider>
  );

  it("renderiza Burger y la imagen principal", () => {
    const toggleMock = jest.fn();

    render(<Header opened={false} toggle={toggleMock} />, { wrapper: Wrapper });

    // Imagen con alt
    const logo = screen.getByAltText(/Arregla Ya/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/ArreglaYaIcon.jpeg");

    // Burger button
    const burger = screen.getByRole("button");
    expect(burger).toBeInTheDocument();

    // Click en burger llama a toggle
    fireEvent.click(burger);
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  it("muestra Burger en estado 'opened' cuando la prop es true", () => {
    const toggleMock = jest.fn();
    render(<Header opened={true} toggle={toggleMock} />, { wrapper: Wrapper });

    // El botón sigue presente
    const burger = screen.getByRole("button");
    expect(burger).toBeInTheDocument();
  });
});
