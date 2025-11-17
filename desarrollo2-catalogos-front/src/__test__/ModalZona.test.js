import React from "react";
import { render, screen, fireEvent, waitFor } from "../test.utils";
import ModalZona from "../components/ModalZona";

jest.mock("../Api/zonas", () => ({
  createZona: jest.fn(),
  updateZona: jest.fn(),
}));

import { createZona, updateZona } from "../Api/zonas";

const zonasBase = [
  { id: 1, nombre: "Almagro" },
  { id: 2, nombre: "Palermo" },
];

describe("ModalZona", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // RENDER BÁSICO
  // ============================================================
  it("renderiza correctamente en modo creación", () => {
    render(<ModalZona opened={true} zonas={zonasBase} />);

    expect(screen.getByText("Nueva zona")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /Crear zona/i });
    expect(btn).toBeDisabled(); // campo vacío
  });

  // ============================================================
  // VALIDACIÓN - vacío
  // ============================================================
  it("muestra error si el nombre está vacío", () => {
    render(<ModalZona opened={true} zonas={zonasBase} />);

    const input = screen.getByLabelText(/Nombre/i);
    fireEvent.change(input, { target: { value: "" } });

    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
  });

  // ============================================================
  // VALIDACIÓN - duplicado
  // ============================================================
  it("muestra error si el nombre ya existe", () => {
    render(<ModalZona opened={true} zonas={zonasBase} />);

    const input = screen.getByLabelText(/Nombre/i);
    fireEvent.change(input, { target: { value: "Palermo" } });

    expect(
      screen.getByText(/ya existe una zona con ese nombre/i)
    ).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /Crear zona/i });
    expect(btn).toBeDisabled();
  });

  // ============================================================
  // VALIDACIÓN - solo letras
  // ============================================================
  it("no permite números u otros caracteres", () => {
    render(<ModalZona opened={true} zonas={zonasBase} />);

    const input = screen.getByLabelText(/Nombre/i);
    fireEvent.change(input, { target: { value: "Zona123" } });

    // No debería permitirlo
    expect(input.value).toBe("");
  });

  // ============================================================
  // CREAR ZONA
  // ============================================================
  it("crea una zona nueva cuando es válido", async () => {
    const onSaved = jest.fn();
    createZona.mockResolvedValueOnce({});

    render(<ModalZona opened={true} zonas={zonasBase} onSaved={onSaved} />);

    const input = screen.getByLabelText(/Nombre/i);
    fireEvent.change(input, { target: { value: "Caballito" } });

    fireEvent.click(screen.getByRole("button", { name: /Crear zona/i }));

    await waitFor(() => {
      expect(createZona).toHaveBeenCalledWith("Caballito");
      expect(onSaved).toHaveBeenCalled();
    });
  });

  // ============================================================
  // EDITAR ZONA
  // ============================================================
  it("actualiza una zona existente en modo edición", async () => {
    const onSaved = jest.fn();
    updateZona.mockResolvedValueOnce({});

    const zonaEditar = { id: 5, nombre: "Villa Crespo" };

    render(
      <ModalZona
        opened={true}
        zona={zonaEditar}
        zonas={zonasBase}
        onSaved={onSaved}
      />
    );

    const input = screen.getByLabelText(/Nombre/i);
    fireEvent.change(input, {
      target: { value: "Villa Crespo Norte" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(updateZona).toHaveBeenCalledWith(5, {
        nombre: "Villa Crespo Norte",
      });
      expect(onSaved).toHaveBeenCalled();
    });
  });

  // ============================================================
  // EDITAR → no ha cambiado → no llama API
  // ============================================================
  it("no llama updateZona si el nombre no cambió", async () => {
    const zonaEditar = { id: 3, nombre: "Recoleta" };

    render(
      <ModalZona opened={true} zona={zonaEditar} zonas={zonasBase} />
    );

    const btn = screen.getByRole("button", { name: /Guardar cambios/i });
    expect(btn).toBeDisabled(); // no hay cambios aún

    fireEvent.click(btn);

    expect(updateZona).not.toHaveBeenCalled();
  });

  // ============================================================
  // ERRORES DEL SERVIDOR
  // ============================================================
    it("muestra mensaje si la API falla", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // ⬅️ silencia el error

    createZona.mockRejectedValueOnce(new Error("Error server"));

    render(<ModalZona opened={true} zonas={zonasBase} />);

    const input = screen.getByLabelText(/Nombre/i);
    fireEvent.change(input, { target: { value: "NuevaZona" } });

    fireEvent.click(screen.getByRole("button", { name: /Crear zona/i }));

    await waitFor(() => {
        expect(screen.getByText(/Error server/i)).toBeInTheDocument();
    });

    console.error.mockRestore();
});
});
