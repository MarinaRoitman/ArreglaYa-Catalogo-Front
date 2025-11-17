import React from "react";
import { render, screen, fireEvent, waitFor } from "../test.utils";
import RegisterPage from "../pages/RegisterPage";
import { getPrestadores } from "../Api/prestadores";
import { act } from "react-dom/test-utils";

jest.mock("../Api/prestadores", () => ({
  getPrestadores: jest.fn(),
}));

// mock useNavigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

// mock fetch global
global.fetch = jest.fn();

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
  });

  /* -------------------------------------------------- */
  it("renderiza inputs y botón Guardar", () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText("Nombre")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Apellido")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Guardar/i })
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  it("muestra error si falta completar datos", async () => {
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    expect(
      await screen.findByText("El nombre es obligatorio.")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  it("muestra error si el email ya está registrado", async () => {
    getPrestadores.mockResolvedValueOnce([{ email: "test@test.com" }]);

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nombre"), {
      target: { value: "Martina" },
    });
    fireEvent.change(screen.getByPlaceholderText("Apellido"), {
      target: { value: "Perez" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Teléfono"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("DNI"), {
      target: { value: "12345678" },
    });

    fireEvent.change(screen.getByPlaceholderText("Estado / Provincia"), {
      target: { value: "Buenos Aires" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ciudad"), {
      target: { value: "CABA" },
    });
    fireEvent.change(screen.getByPlaceholderText("Calle"), {
      target: { value: "Calle Falsa" },
    });
    fireEvent.change(screen.getByPlaceholderText("Número/Altura"), {
      target: { value: "123" },
    });

    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "Marti123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
      target: { value: "Marti123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    expect(
      await screen.findByText("El email ya está registrado.")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  it("muestra modal de éxito cuando el registro es exitoso", async () => {
    getPrestadores.mockResolvedValueOnce([]);

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "ok" }),
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nombre"), {
      target: { value: "Martina" },
    });
    fireEvent.change(screen.getByPlaceholderText("Apellido"), {
      target: { value: "Perez" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "marti@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Teléfono"), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("DNI"), {
      target: { value: "12345678" },
    });

    fireEvent.change(screen.getByPlaceholderText("Estado / Provincia"), {
      target: { value: "Buenos Aires" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ciudad"), {
      target: { value: "CABA" },
    });
    fireEvent.change(screen.getByPlaceholderText("Calle"), {
      target: { value: "Calle Falsa" },
    });
    fireEvent.change(screen.getByPlaceholderText("Número/Altura"), {
      target: { value: "123" },
    });

    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "Marti123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
      target: { value: "Marti123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    expect(
      await screen.findByText("Registro exitoso. Ya podés iniciar sesión.")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  it("toggle del ojo de contraseña funciona", () => {
    render(<RegisterPage />);

    const buttons = screen.getAllByRole("button");
    // simplemente chequear que se pueda clickeaar sin romper
    fireEvent.click(buttons[1]);
  });
});
