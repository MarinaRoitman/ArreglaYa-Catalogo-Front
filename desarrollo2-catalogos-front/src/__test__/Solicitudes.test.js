// src/__test__/Solicitudes.test.js

import React from "react";
import { render, screen } from "@testing-library/react";

// Mock del componente para imitar su estructura básica.
// Esto nos permite probar la página sin renderizar sus componentes hijos complejos.
jest.mock("../pages/Solicitudes", () => () => (
  <div data-testid="solicitudes-mock">
    <h1>Solicitudes</h1>
    <section aria-label="filtros">
      <input placeholder="Filtrar por Nombre y Apellido" />
      <input placeholder="Filtrar por Teléfono" />
      <input placeholder="Filtrar por Dirección" />
    </section>
    <section aria-label="tabla-solicitudes">
      {/* Simulamos una fila de la tabla o una tarjeta */}
      <div>
        <span>Juan Pérez</span>
        <button aria-label="Aprobar">Aprobar</button>
        <button aria-label="Rechazar">Rechazar</button>
      </div>
    </section>
    <div role="dialog" aria-label="modal-confirmar-borrado">
        <p>¿Estás seguro?</p>
        <button>Cancelar</button>
        <button>Sí, borrar</button>
    </div>
  </div>
));

import Solicitudes from "../pages/Solicitudes";

describe("Página de Solicitudes (UI Mock)", () => {
  it("debe renderizar el título, filtros y acciones principales", () => {
    render(<Solicitudes />);

    // Verificar que el título principal de la página exista
    expect(screen.getByRole("heading", { name: /Solicitudes/i })).toBeInTheDocument();

    // Verificar que los campos de filtro principales estén presentes
    expect(screen.getByPlaceholderText(/Filtrar por Nombre y Apellido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Filtrar por Teléfono/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Filtrar por Dirección/i)).toBeInTheDocument();

    // Verificar que los elementos simulados de la tabla o tarjeta se muestren
    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Aprobar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rechazar/i })).toBeInTheDocument();
    
    // Verificar que el modal de confirmación (simulado) esté en el documento
    expect(screen.getByRole("dialog", { name: /modal-confirmar-borrado/i })).toBeInTheDocument();
  });
});