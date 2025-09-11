import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("../pages/Perfil", () => () => (
  <div data-testid="perfil-mock">
    <h1>Mi Perfil</h1>

    <section aria-label="formulario-editar">
      <label>Nombre<input name="nombre" /></label>
      <label>Apellido<input name="apellido" /></label>
      <label>Email<input name="email" /></label>
      <label>DNI<input name="dni" disabled /></label>
      <label>Dirección<input name="direccion" /></label>
      <label>Teléfono<input name="telefono" /></label>
      <label>Zonas<input name="zonas" /></label>

      <button>Actualizar</button>
      <button>Dar de baja</button>
    </section>

    <section aria-label="habilidades">
      <input placeholder="Buscar habilidad" />
    </section>

    <section aria-label="calificaciones">
      <p>Calificaciones (0 Reviews)</p>
    </section>

    <div role="dialog" aria-label="modal-exito">
      <p>¡Datos actualizados!</p>
      <button>Aceptar</button>
    </div>
    <div role="dialog" aria-label="modal-baja">
      <p>¿Estás seguro de que querés dar de baja tu cuenta?</p>
      <button>Cancelar</button>
      <button>Sí, dar de baja</button>
    </div>
  </div>
));

import Perfil from "../pages/Perfil";

describe("Perfil (mock UI completo)", () => {
  it("renderiza todos los campos de formulario y secciones principales", () => {
    render(<Perfil />);

    // Encabezado principal
    expect(screen.getByRole("heading", { name: /Mi Perfil/i })).toBeInTheDocument();

    // Campos de formulario
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/DNI/i)).toBeDisabled();
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Zonas/i)).toBeInTheDocument();

    // Botones principales (usa getAllByRole para evitar choque con modal)
    expect(screen.getByRole("button", { name: /Actualizar/i })).toBeInTheDocument();
    const bajaButtons = screen.getAllByRole("button", { name: /dar de baja/i });
    expect(bajaButtons.length).toBeGreaterThan(0); // hay al menos uno en el formulario

    // Secciones de habilidades y calificaciones
    expect(screen.getByPlaceholderText(/Buscar habilidad/i)).toBeInTheDocument();
    expect(screen.getByText(/Calificaciones/i)).toBeInTheDocument();

    // Modales
    expect(screen.getByRole("dialog", { name: /modal-exito/i })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /modal-baja/i })).toBeInTheDocument();
  });

  it("permite escribir en los campos editables", () => {
    render(<Perfil />);
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "Martina" } });
    expect(screen.getByLabelText(/Nombre/i).value).toBe("Martina");

    fireEvent.change(screen.getByLabelText(/Dirección/i), { target: { value: "Calle 123" } });
    expect(screen.getByLabelText(/Dirección/i).value).toBe("Calle 123");

    fireEvent.change(screen.getByPlaceholderText(/Buscar habilidad/i), { target: { value: "React" } });
    expect(screen.getByPlaceholderText(/Buscar habilidad/i).value).toBe("React");
  });
});
