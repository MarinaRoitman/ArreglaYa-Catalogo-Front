import React from "react";
import { render, screen, fireEvent, waitFor } from "../test.utils";
import LoginPage from "../pages/LoginPage";
import { API_URL } from "../Api/api";

/* ============================================================
   MOCKS
============================================================ */

// mock navigate y location
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

// mock fetch global
global.fetch = jest.fn();

// mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k],
    setItem: (k, v) => (store[k] = v),
    removeItem: (k) => delete store[k],
    clear: () => (store = {}),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

/* ============================================================
   JWT MOCKS válidos
============================================================ */

// ADMIN → { "role": "admin" }
const ADMIN_JWT = "aaa.eyJyb2xlIjoiYWRtaW4ifQ.ccc";

// PRESTADOR → { "role": "prestador" }
const PRESTADOR_JWT = "aaa.eyJyb2xlIjoicHJlc3RhZG9yIn0.ccc";


/* ============================================================
   TESTS
============================================================ */

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  /* -------------------------------------------------------- */
  it("renderiza inputs y botón de login", () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  /* -------------------------------------------------------- */
  it("muestra modal cuando credenciales son incorrectas", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Credenciales incorrectas" }),
      headers: { get: () => "application/json" }
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    expect(
      await screen.findByText("Credenciales incorrectas")
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------------- */
  it("login ADMIN navega a /admin/prestadores y guarda id", async () => {
    // 1) Login OK → devuelve token admin
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: ADMIN_JWT }),
      headers: { get: () => "application/json" }
    });

    // 2) findAdminByEmail → devuelve admin
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 99, nombre: "Martina", email: "test@test.com" }],
      headers: { get: () => "application/json" }
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    // espera token
    await waitFor(() =>
      expect(localStorage.getItem("token")).toBe(ADMIN_JWT)
    );

    // role correcto
    expect(localStorage.getItem("role")).toBe("admin");

    // id correcto
    expect(localStorage.getItem("id")).toBe("99");

    // navegación
    expect(mockNavigate).toHaveBeenCalledWith("/admin/prestadores", {
      replace: true,
    });
  });

  /* -------------------------------------------------------- */
  it("login PRESTADOR navega a /solicitudes y guarda prestador_id", async () => {
    // 1) Login OK → token prestador
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: PRESTADOR_JWT }),
      headers: { get: () => "application/json" }
    });

    // 2) findPrestadorByEmail → prestador encontrado
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 10, nombre: "Pepe", email: "p@p.com" }],
      headers: { get: () => "application/json" }
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "p@p.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe(PRESTADOR_JWT);
    });

    expect(localStorage.getItem("role")).toBe("prestador");
    expect(localStorage.getItem("prestador_id")).toBe("10");

    expect(mockNavigate).toHaveBeenCalledWith("/solicitudes", {
      replace: true,
    });
  });

});
