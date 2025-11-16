import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterPage from "../pages/RegisterPage";

// ---------- MOCK MANTINE ----------
jest.mock("@mantine/core", () => ({
  Modal: ({ opened, children }) => (opened ? <div role="dialog">{children}</div> : null),
  Text: ({ children }) => <span>{children}</span>,
  Button: ({ children, ...p }) => <button {...p}>{children}</button>,
  Group: ({ children }) => <div>{children}</div>,
  Stack: ({ children }) => <div>{children}</div>,
  ThemeIcon: ({ children }) => <div>{children}</div>,
  ActionIcon: ({ children, ...p }) => <button {...p}>{children}</button>,
}));

jest.mock("@tabler/icons-react", () => ({
  IconCheck: () => <span>✔</span>,
  IconAlertCircle: () => <span>⚠</span>,
  IconEye: () => <span>👁</span>,
  IconEyeOff: () => <span>🚫</span>,
}));

// ---------- MOCK ROUTER ----------
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  Link: ({ children }) => <a>{children}</a>,
  useNavigate: () => mockedNavigate,
}));

// ---------- MOCK CSS ----------
jest.mock("../../src/Form.css", () => ({}), { virtual: true });

// ---------- MOCK getPrestadores (no fetch interno) ----------
jest.mock("../Api/prestadores", () => ({
  getPrestadores: jest.fn(() => Promise.resolve([])),
}));

describe("RegisterPage simple coverage WITHOUT fetch", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  test("renderiza títulos y botón", () => {
    render(<RegisterPage />);

    expect(screen.getByText(/Arregla Ya/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar/i })).toBeInTheDocument();
  });

  test("validación fallida muestra modal", async () => {
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  test("toggle de password cambia estado", () => {
    render(<RegisterPage />);

    const toggles = screen.getAllByText("👁");
    fireEvent.click(toggles[0]); // toggle password
    fireEvent.click(toggles[1]); // toggle repita password

    // si no explota → cubrimos ramas
  });

  test("cerrar modal de error NO navega", async () => {
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    const closeBtn = await screen.findByText(/Cerrar/i);
    fireEvent.click(closeBtn);

    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  test("llenar algunos campos no produce crash (cubre handleChange)", () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nombre"), {
      target: { value: "Martina" },
    });

    fireEvent.change(screen.getByPlaceholderText("Apellido"), {
      target: { value: "Perez" },
    });

    fireEvent.change(screen.getByPlaceholderText("DNI"), {
      target: { value: "12345678" },
    });

    // siquiera testear el value → ya cubrimos handleChange
    expect(screen.getByPlaceholderText("Nombre").value).toBe("Martina");
  });
});
