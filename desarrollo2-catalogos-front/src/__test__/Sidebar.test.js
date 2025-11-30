import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../components/Sidebar";
import { MemoryRouter } from "react-router-dom";

jest.mock("@mantine/core", () => ({
  Box: ({ children }) => <div>{children}</div>,
  ScrollArea: ({ children }) => <div>{children}</div>,
  Group: ({ children }) => <div>{children}</div>,
  Avatar: ({ children }) => <div>{children}</div>,
  Text: ({ children }) => <span>{children}</span>,
  NavLink: ({ label, onClick }) => (
    <button onClick={onClick}>{label}</button>
  ),
  Divider: () => <div />,
}));

jest.mock("../components/LogOut", () => () => <div data-testid="logout-modal" />);
jest.mock("../components/ModalReprocesarEventos", () => () => <div data-testid="reprocesar-modal" />);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/" }),
}));

describe("Sidebar navegación simple", () => {
  beforeEach(() => {
    localStorage.setItem("role", "prestador");
    localStorage.setItem("userName", "Martina");

    mockNavigate.mockClear();
  });

  test("Navega a Solicitudes", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Solicitudes"));
    expect(mockNavigate).toHaveBeenCalledWith("/solicitudes");
  });

  test("Navega a Confirmados", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Confirmados"));
    expect(mockNavigate).toHaveBeenCalledWith("/confirmados");
  });

  test("Navega a Realizados", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Realizados"));
    expect(mockNavigate).toHaveBeenCalledWith("/realizados");
  });

  test("Navega a Cancelados", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Cancelados"));
    expect(mockNavigate).toHaveBeenCalledWith("/cancelados");
  });
});
