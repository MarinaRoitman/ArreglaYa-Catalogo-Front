import { render, screen, fireEvent, waitFor } from "../test.utils";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: {} }),
}));

global.fetch = jest.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renderiza los inputs y botones", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
  });

  it("muestra error si las credenciales son inválidas", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "fake@mail.com", name: "usuario" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "wrong", name: "contrasena" },
    });

    fireEvent.click(screen.getByText(/Iniciar Sesión/i));

    await waitFor(() =>
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument()
    );
  });

  it("guarda token y navega al iniciar sesión correctamente", async () => {
    const fakeToken =
      "aaa." +
      btoa(JSON.stringify({ sub: 123 })) +
      ".ccc"; // payload con sub=123
    const mockUser = { nombre: "Martina" };

fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ access_token: fakeToken }), 
});
fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ id: "123", nombre: "Martina", foto: "" }), 
});

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "marti@mail.com", name: "usuario" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "1234", name: "contrasena" },
    });

    fireEvent.click(screen.getByText(/Iniciar Sesión/i));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe(fakeToken);
      expect(localStorage.getItem("prestador_id")).toBe("123");
      expect(localStorage.getItem("userName")).toBe("Usuario");
      expect(localStorage.getItem("userFoto")).toBe("");
      expect(mockNavigate).toHaveBeenCalledWith("/solicitudes", { replace: true });
    });
  });

  it("muestra modal con error genérico si falla fetch", async () => {
    fetch.mockRejectedValueOnce(new Error("Falla de red"));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "test@mail.com", name: "usuario" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "1234", name: "contrasena" },
    });

    fireEvent.click(screen.getByText(/Iniciar Sesión/i));

    await waitFor(() =>
      expect(screen.getByText(/Falla de red/i)).toBeInTheDocument()
    );
  });
});
