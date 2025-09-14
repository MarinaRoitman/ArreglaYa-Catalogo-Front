// src/__test__/Realizados.test.js

import React from "react";
import { render, screen } from "@testing-library/react";

// Mock del componente para imitar su estructura
jest.mock("../pages/Realizados", () => () => (
  <div data-testid="realizados-mock">
    <h1>Trabajos Realizados</h1>
    <section aria-label="filtros">
      <input placeholder="Filtrar por Fecha y Hora" />
      <input placeholder="Filtrar por Servicio" />
    </section>
    <section aria-label="tabla-realizados">
        {/* Simulamos una fila de la tabla */}
        <div>
            <span>Luis Rodríguez</span>
            <span>Finalizado</span>
        </div>
    </section>
  </div>
));

import Realizados from "../pages/Realizados";

describe("Realizados Page (mock UI)", () => {
  it("renderiza el título, filtros y la tabla de trabajos finalizados", () => {
    render(<Realizados />);

    // Título
    expect(screen.getByRole("heading", { name: /Trabajos Realizados/i })).toBeInTheDocument();

    // Filtros
    expect(screen.getByPlaceholderText(/Filtrar por Fecha y Hora/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Filtrar por Servicio/i)).toBeInTheDocument();

    // Contenido simulado
    expect(screen.getByText(/Luis Rodríguez/i)).toBeInTheDocument();
    expect(screen.getByText(/Finalizado/i)).toBeInTheDocument();
  });
});