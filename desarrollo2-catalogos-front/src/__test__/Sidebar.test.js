import React from "react";
import "../setupMantineTest";
import { render, screen, fireEvent } from "../test.utils";
import Sidebar from "../components/Sidebar";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/solicitudes" }),
}));

jest.mock("../components/LogOut", () => ({
  __esModule: true,
  default: ({ opened, onConfirm }) =>
    opened ? (
      <div data-testid="logout-modal">
        <button onClick={onConfirm}>confirmar</button>
      </div>
    ) : null,
}));

beforeEach(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    const mockValues = {
      userName: "Martina",
      userFoto: "https://foto.com/martina.png",
      role: "prestador",
    };
    return mockValues[key];
  });

  Storage.prototype.removeItem = jest.fn();
  mockNavigate.mockClear();
});

describe("Sidebar", () => {
  test("muestra el nombre y avatar", () => {
    render(<Sidebar />);
    expect(screen.getByText("¡Bienvenid@ Martina!")).toBeInTheDocument();
  });

  test("muestra menú del prestador", () => {
    render(<Sidebar />);

    expect(screen.getByText("Solicitudes")).toBeInTheDocument();
    expect(screen.getByText("Confirmados")).toBeInTheDocument();
    expect(screen.getByText("Realizados")).toBeInTheDocument();
    expect(screen.getByText("Cancelados")).toBeInTheDocument();
  });

  test("muestra menú admin cuando role=admin", () => {
    Storage.prototype.getItem = jest.fn((key) => {
      const mockValues = {
        userName: "Admin",
        role: "admin",
        userFoto: "",
      };
      return mockValues[key];
    });

    render(<Sidebar />);

    expect(screen.getByText("Prestadores")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Habilidades")).toBeInTheDocument();
    expect(screen.getByText("Zonas")).toBeInTheDocument();
    expect(screen.getByText("Vínculos Prestadores")).toBeInTheDocument();
  });

  test("navega correctamente al tocar un item", () => {
    render(<Sidebar />);

    fireEvent.click(screen.getByText("Solicitudes"));

    expect(mockNavigate).toHaveBeenCalledWith("/solicitudes");
  });

  test("abre modal de logout", () => {
    render(<Sidebar />);

    fireEvent.click(screen.getByText("Cerrar Sesión"));

    expect(screen.getByTestId("logout-modal")).toBeInTheDocument();
  });

  test("ejecuta logout y redirige a login", () => {
    render(<Sidebar />);

    fireEvent.click(screen.getByText("Cerrar Sesión"));

    fireEvent.click(screen.getByText("confirmar"));

    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
