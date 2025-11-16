import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../pages/LoginPage";

/* ========= MOCKS ========= */

jest.mock("@mantine/core", () => ({
  Modal: ({ opened, children }) => (opened ? <div role="dialog">{children}</div> : null),
  Text: ({ children }) => <p>{children}</p>,
  Button: ({ children, ...p }) => <button {...p}>{children}</button>,
  Group: ({ children }) => <div>{children}</div>,
  Stack: ({ children }) => <div>{children}</div>,
  ThemeIcon: ({ children }) => <div>{children}</div>,
  Loader: () => <div>Loading...</div>,
  Center: ({ children }) => <div>{children}</div>,
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

// fetch mock sin errores ni backend real
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ access_token: "aaa.bbb.ccc" }),
  })
);

/* ========= TESTS ========= */

describe("LoginPage cobertura mejorada sin errores", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    global.fetch.mockClear();
    localStorage.clear();
  });

  test("inputs actualizan estado", () => {
    render(<LoginPage />);

    const email = screen.getByPlaceholderText(/Email/i);
    const pass = screen.getByPlaceholderText(/Contraseña/i);

    fireEvent.change(email, { target: { value: "test@mail.com" } });
    fireEvent.change(pass, { target: { value: "1234" } });

    expect(email.value).toBe("test@mail.com");
    expect(pass.value).toBe("1234");
  });

  test("submit sin email -> muestra modal", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("cerrar modal funciona", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    const closeButton = await screen.findByText(/Cerrar/i);
    fireEvent.click(closeButton);

    // Verificamos que el modal desaparezca
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("submit válido llama a fetch", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "valid@mail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
