import React from "react";
import { render } from "../test.utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import RegisterPage from "../pages/RegisterPage";
import { getPrestadores } from "../Api/prestadores";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

jest.mock("../Api/prestadores", () => ({
  getPrestadores: jest.fn(),
}));

global.fetch = jest.fn();

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra modal si el email ya existe", async () => {
    getPrestadores.mockResolvedValue([{ email: "test@gmail.com" }]);

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@gmail.com" }
    });

    const modalMsg = await screen.findByText("El email ya está registrado.");
    expect(modalMsg).toBeInTheDocument();
  });

  test("realiza registro exitoso", async () => {
    getPrestadores.mockResolvedValue([]);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<RegisterPage />);  

    fireEvent.change(screen.getByPlaceholderText("Nombre"), {
      target: { value: "Martina" },
    });

    fireEvent.change(screen.getByPlaceholderText("Apellido"), {
      target: { value: "Gomez" },
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "nuevo@gmail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Teléfono"), {
      target: { value: "1234567890" },
    });

    fireEvent.change(screen.getByPlaceholderText("DNI"), {
      target: { value: "12345678" },
    });

    fireEvent.change(screen.getByPlaceholderText("Estado / Provincia"), {
      target: { value: "Buenos Aires" },
    });

    fireEvent.change(screen.getByPlaceholderText("Ciudad"), {
      target: { value: "Quilmes" },
    });

    fireEvent.change(screen.getByPlaceholderText("Calle"), {
      target: { value: "Mitre" },
    });

    fireEvent.change(screen.getByPlaceholderText("Número/Altura"), {
      target: { value: "123" },
    });

    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "Pass@1234" },
    });

    fireEvent.change(screen.getByPlaceholderText("Repita la contraseña"), {
      target: { value: "Pass@1234" },
    });

    fireEvent.click(screen.getByText("Guardar"));

    const successMsg = await screen.findByText(
      "Registro exitoso. Ya podés iniciar sesión."
    );

    expect(successMsg).toBeInTheDocument();
  });
});
