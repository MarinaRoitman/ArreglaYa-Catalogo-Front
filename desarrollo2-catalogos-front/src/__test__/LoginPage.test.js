import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("@mantine/core", () => {
  const React = require("react");
  return {
    Modal: ({ opened, children }) => (opened ? <div role="dialog">{children}</div> : null),
    Text: ({ children }) => <p>{children}</p>,
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    Group: ({ children }) => <div>{children}</div>,
    Stack: ({ children }) => <div>{children}</div>,
    ThemeIcon: ({ children }) => <div>{children}</div>,
    Loader: () => <div aria-label="loader" />,
    Center: ({ children }) => <div>{children}</div>,
  };
});

jest.mock("../Api/api", () => ({
  API_URL: "https://api.example/",
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
    Link: ({ to, children, ...rest }) => (
      <a href={typeof to === "string" ? to : to?.pathname || "#"} {...rest}>
        {children}
      </a>
    ),
  };
});

// Componente a testear
import LoginPage from "../pages/LoginPage";

// Helpers para token JWT
function makeJwtWithPayload(payloadObj) {
  const base64 = btoa(JSON.stringify(payloadObj)).replace(/\+/g, "-").replace(/\//g, "_");
  return `aaa.${base64}.bbb`;
}

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpio LS entre tests
    localStorage.clear();
    // Reseteo fetch
    global.fetch = jest.fn();
  });

  it("renderiza inputs y botones principales", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar Sesión/i })).toBeInTheDocument();
    // Link de registro
    expect(screen.getByRole("link", { name: /Registrarse/i })).toBeInTheDocument();
  });

  it("muestra modal de error si no se ingresa email", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/Ingresá tu email/i);
  });

  it("login ADMIN: guarda id de admin y navega a /admin/prestadores", async () => {
    // 1) login OK -> devuelve token con role: "admin"
    const token = makeJwtWithPayload({ role: "admin" });
    const loginEmail = "admin@example.com";

    // 2) /auth/login
    global.fetch.mockImplementationOnce(async (url, opts) => {
      if (String(url).includes("/auth/login") && opts?.method === "POST") {
        return new Response(JSON.stringify({ access_token: token }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not mocked", { status: 404 });
    });

    // 3) findAdminByEmail: primero intenta /admins/?email=...
    const adminRow = {
      id: 9,
      email: loginEmail,
      nombre: "Jaguar",
      apellido: "Admin",
    };

    global.fetch.mockImplementationOnce(async (url) => {
      if (String(url).includes("/admins/?email=")) {
        return new Response(JSON.stringify([adminRow]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not mocked", { status: 404 });
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Completar y enviar
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: loginEmail },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    // Navega a /admin/prestadores
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/prestadores", { replace: true });
    });

    // Chequear localStorage
    expect(localStorage.getItem("token")).toBe(token);
    expect(localStorage.getItem("login_email")).toBe(loginEmail);
    expect(localStorage.getItem("role")).toBe("admin");

    // id admin correcto
    expect(localStorage.getItem("id")).toBe(String(adminRow.id));

    // no debe arrastrar prestador_id
    expect(localStorage.getItem("prestador_id")).toBeNull();

    // userName guardado (usa nombre si existe)
    expect(localStorage.getItem("userName")).toBe("Jaguar");
  });

  it("login PRESTADOR: guarda prestador_id y navega a /solicitudes", async () => {
    // Token con role != admin
    const token = makeJwtWithPayload({ role: "user" });
    const loginEmail = "prestador@example.com";

    // 1) /auth/login OK
    global.fetch.mockImplementationOnce(async (url, opts) => {
      if (String(url).includes("/auth/login") && opts?.method === "POST") {
        return new Response(JSON.stringify({ access_token: token }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not mocked", { status: 404 });
    });

    // 2) findPrestadorByEmail: /prestadores/?email=...
    const prestadorRow = {
      id: 5,
      email: loginEmail,
      nombre: "Martina",
      apellido: "P.",
    };

    global.fetch.mockImplementationOnce(async (url) => {
      if (String(url).includes("/prestadores/?email=")) {
        return new Response(JSON.stringify([prestadorRow]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not mocked", { status: 404 });
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: loginEmail },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/solicitudes", { replace: true });
    });

    // LocalStorage esperado
    expect(localStorage.getItem("token")).toBe(token);
    expect(localStorage.getItem("login_email")).toBe(loginEmail);
    expect(localStorage.getItem("role")).toBe("user");

    // id admin NO debe quedar
    expect(localStorage.getItem("id")).toBeNull();
    // prestador_id correcto
    expect(localStorage.getItem("prestador_id")).toBe(String(prestadorRow.id));
    // userName desde nombre
    expect(localStorage.getItem("userName")).toBe("Martina");
  });

  it("muestra modal si /auth/login responde error", async () => {
    global.fetch.mockImplementationOnce(async (url, opts) => {
      if (String(url).includes("/auth/login") && opts?.method === "POST") {
        return new Response("Credenciales inválidas", { status: 401 });
      }
      return new Response("not mocked", { status: 404 });
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "x@y.z" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/Credenciales inválidas|Error/i);
  });
});
