import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import FormComboBox from "../components/ZonasComboBox";

global.fetch = jest.fn();

describe("FormComboBox (UI e interacciones)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza placeholder y carga opciones desde la API", async () => {
    const mockData = [
      { id: 1, nombre: "Zona Norte" },
      { id: 2, nombre: "Zona Sur" },
    ];

    fetch.mockResolvedValueOnce({
      json: async () => mockData,
    });

    await act(async () => {
      render(
        <FormComboBox
          name="zona"
          value=""
          onChange={() => {}}
          placeholder="Seleccione una zona"
          required
        />
      );
    });

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText(/Seleccione una zona/i)).toBeInTheDocument();

    // 🔹 Ahora esperamos a que aparezcan las opciones
    await waitFor(() => {
      expect(screen.getByText("Zona Norte")).toBeInTheDocument();
      expect(screen.getByText("Zona Sur")).toBeInTheDocument();
    });
  });

  it("dispara onChange al seleccionar una opción", async () => {
    const mockData = [{ id: 5, nombre: "Centro" }];
    fetch.mockResolvedValueOnce({ json: async () => mockData });

    const handleChange = jest.fn();

    await act(async () => {
      render(
        <FormComboBox
          name="zona"
          value=""
          onChange={handleChange}
          placeholder="Elija zona"
        />
      );
    });

    await waitFor(() => screen.getByText("Centro"));

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "5" },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("acepta el atributo required", async () => {
    fetch.mockResolvedValueOnce({ json: async () => [] });

    await act(async () => {
      render(<FormComboBox name="zona" value="" onChange={() => {}} required />);
    });

    expect(screen.getByRole("combobox")).toHaveAttribute("required");
  });
});
