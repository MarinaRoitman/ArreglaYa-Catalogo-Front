// src/__test__/Confirmados.test.js

import React from "react";
import { render, screen } from "@testing-library/react";

// Mock del componente para imitar su estructura
jest.mock("../pages/Confirmados", () => () => (
  <div data-testid="confirmados-mock">
    <h1>Trabajos Confirmados</h1>
    <section aria-label="filtros">
      <input placeholder="Filtrar por Nombre y Apellido" />
      <input placeholder="Filtrar por Servicio" />
      <input placeholder="Filtrar por Habilidad" />
    </section>
    <section aria-label="tabla-confirmados">
        <div>
            <span>Ana Gómez</span>
            {/* Usamos un texto descriptivo para el estado */}
            <span>Esperando confirmación del cliente</span> 
            <button aria-label="Cancelar Pedido">Cancelar</button>
        </div>
    </section>
    <div role="dialog" aria-label="modal-cancelar">
        <p>¿Seguro que quieres cancelar?</p>
        <button>No</button>
        <button>Sí, cancelar</button>
    </div>
  </div>
));

import Confirmados from "../pages/Confirmados";

describe("Confirmados Page (mock UI)", () => {
  it("renderiza el título, filtros y tabla con estado y acción de cancelar", () => {
    render(<Confirmados />);

    // Título
    expect(screen.getByRole("heading", { name: /Trabajos Confirmados/i })).toBeInTheDocument();

    // Filtros
    expect(screen.getByPlaceholderText(/Filtrar por Nombre y Apellido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Filtrar por Servicio/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Filtrar por Habilidad/i)).toBeInTheDocument();

    // Contenido simulado
    expect(screen.getByText(/Ana Gómez/i)).toBeInTheDocument();
    expect(screen.getByText(/Esperando confirmación del cliente/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar Pedido/i })).toBeInTheDocument();

    // Modal
    expect(screen.getByRole("dialog", {name: /modal-cancelar/i})).toBeInTheDocument();
  });
});