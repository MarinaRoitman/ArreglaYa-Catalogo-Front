import React from "react";
import { render, screen, fireEvent, waitFor } from "../test.utils";
import ModalServicio from "../components/ModalServicio";

// Mock de las APIs
jest.mock("../Api/rubros", () => ({
createRubro: jest.fn(),
updateRubro: jest.fn(),
}));

import { createRubro, updateRubro } from "../Api/rubros";

const baseRubros = [
{ id: 1, nombre: "Plomería" },
{ id: 2, nombre: "Electricidad" },
];

describe("ModalServicio", () => {
beforeEach(() => {
jest.clearAllMocks();
});

// ============================================================
// RENDER BÁSICO
// ============================================================
it("renderiza correctamente en modo creación", () => {
render(
    <ModalServicio
    opened={true}
    rubro={null}
    rubros={baseRubros}
    onClose={() => {}}
    />
);

expect(screen.getByText("Nuevo rubro")).toBeInTheDocument();
expect(screen.getByLabelText(/Nombre del rubro/i)).toBeInTheDocument();

// Botón deshabilitado porque está vacío
expect(screen.getByRole("button", { name: /Crear rubro/i })).toBeDisabled();
});

// ============================================================
// VALIDACIONES
// ============================================================
it("muestra error si el nombre está vacío al intentar guardar", () => {
render(<ModalServicio opened={true} rubros={baseRubros} />);

fireEvent.click(screen.getByRole("button", { name: /Crear rubro/i }));

expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
});

it("muestra error de duplicado si el nombre ya existe", () => {
render(<ModalServicio opened={true} rubros={baseRubros} />);

const input = screen.getByLabelText(/Nombre del rubro/i);

fireEvent.change(input, { target: { value: "Plomería" } });

expect(
    screen.getByText(/Ya existe un rubro con ese nombre/i)
).toBeInTheDocument();

expect(screen.getByRole("button", { name: /Crear rubro/i })).toBeDisabled();
});

it("solo permite letras y espacios", () => {
render(<ModalServicio opened={true} rubros={baseRubros} />);

const input = screen.getByLabelText(/Nombre del rubro/i);

fireEvent.change(input, { target: { value: "Plomeria123" } });

// No debería cambiar el valor
expect(input.value).toBe("");
});

// ============================================================
// CREAR RUBRO
// ============================================================
it("crea un rubro nuevo cuando los datos son válidos", async () => {
const handleSaved = jest.fn();

createRubro.mockResolvedValueOnce({});

render(
    <ModalServicio
    opened={true}
    rubros={baseRubros}
    onSaved={handleSaved}
    />
);

const input = screen.getByLabelText(/Nombre del rubro/i);
fireEvent.change(input, { target: { value: "Carpintería" } });

fireEvent.click(screen.getByRole("button", { name: /Crear rubro/i }));

await waitFor(() => {
    expect(createRubro).toHaveBeenCalledWith({ nombre: "Carpintería" });
    expect(handleSaved).toHaveBeenCalled();
});
});

// ============================================================
// EDITAR RUBRO
// ============================================================
it("actualiza un rubro existente en modo edición", async () => {
const handleSaved = jest.fn();
updateRubro.mockResolvedValueOnce({});

const rubroEditar = { id: 5, nombre: "Jardinería" };

render(
    <ModalServicio
    opened={true}
    rubro={rubroEditar}
    rubros={baseRubros}
    onSaved={handleSaved}
    />
);

const input = screen.getByLabelText(/Nombre del rubro/i);

fireEvent.change(input, { target: { value: "Jardinería y Parques" } });

fireEvent.click(screen.getByRole("button", { name: /Guardar cambios/i }));

await waitFor(() => {
    expect(updateRubro).toHaveBeenCalledWith(5, {
    nombre: "Jardinería y Parques",
    });
    expect(handleSaved).toHaveBeenCalled();
});
});

// ============================================================
// ERRORES DEL SERVIDOR
// ============================================================
it("muestra error si el servidor devuelve un conflicto/duplicado", async () => {
createRubro.mockRejectedValueOnce(new Error("duplicado"));

render(<ModalServicio opened={true} rubros={baseRubros} />);

const input = screen.getByLabelText(/Nombre del rubro/i);
fireEvent.change(input, { target: { value: "Lavado" } });

fireEvent.click(screen.getByRole("button", { name: /Crear rubro/i }));

await waitFor(() => {
    expect(
    screen.getByText(/Ya existe un rubro con ese nombre/i)
    ).toBeInTheDocument();
});
});
});
