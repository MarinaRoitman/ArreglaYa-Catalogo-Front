import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("../pages/Habilidades", () => () => (
<div data-testid="habilidades-mock">
<h1>Mis Habilidades</h1>

<button>Nuevo</button>

<section aria-label="filtros">
    <label>
    Nombre
    <input name="fNombre" placeholder="Filtrar por nombre" />
    </label>
    <label>
    Servicio
    <input name="fServicio" placeholder="Filtrar por servicio" />
    </label>
</section>

<section aria-label="tabla-habilidades">
    <p>No hay habilidades cargadas</p>
    <button>Eliminar</button>
</section>

<section aria-label="paginacion">
    <button>Anterior</button>
    <button>Siguiente</button>
</section>

<div role="dialog" aria-label="modal-nuevo">
    <p>Agregar nueva habilidad</p>
    <button>Cancelar</button>
    <button>Guardar</button>
</div>
<div role="dialog" aria-label="modal-borrar">
    <p>¿Eliminar esta habilidad?</p>
    <button>Cancelar</button>
    <button>Sí, borrar</button>
</div>
</div>
));

import Habilidades from "../pages/Habilidades";

describe("Habilidades (mock UI completo)", () => {
it("renderiza encabezado, filtros, tabla y botones principales", () => {
render(<Habilidades />);

// Encabezado principal
expect(screen.getByRole("heading", { name: /Mis Habilidades/i })).toBeInTheDocument();

// Botón Nuevo
expect(screen.getByRole("button", { name: /Nuevo/i })).toBeInTheDocument();

// Filtros
expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
expect(screen.getByLabelText(/Servicio/i)).toBeInTheDocument();

// Tabla / Cards
expect(screen.getByText(/No hay habilidades cargadas/i)).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Eliminar/i })).toBeInTheDocument();

// Paginación
expect(screen.getByRole("button", { name: /Anterior/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Siguiente/i })).toBeInTheDocument();

// Modales
expect(screen.getByRole("dialog", { name: /modal-nuevo/i })).toBeInTheDocument();
expect(screen.getByRole("dialog", { name: /modal-borrar/i })).toBeInTheDocument();
});

it("permite escribir en los filtros", () => {
render(<Habilidades />);
fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: "React" } });
expect(screen.getByLabelText(/Nombre/i).value).toBe("React");

fireEvent.change(screen.getByLabelText(/Servicio/i), { target: { value: "Backend" } });
expect(screen.getByLabelText(/Servicio/i).value).toBe("Backend");
});
});
