import { render, screen, fireEvent, waitFor } from "../test.utils";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

global.fetch = jest.fn();

describe("RegisterPage funcional", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/Nombre/i), {
      target: { value: "Martina", name: "nombre" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Apellido/i), {
      target: { value: "Lopez", name: "apellido" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "marti@mail.com", name: "email" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Teléfono/i), {
      target: { value: "123456789", name: "telefono" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Dirección/i), {
      target: { value: "Calle 123", name: "direccion" },
    });
    fireEvent.change(screen.getByPlaceholderText(/DNI/i), {
      target: { value: "45678901", name: "dni" },
    });
  };

  it("muestra error si las contraseñas no coinciden", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fillForm();
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "Password1!", name: "password" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
      target: { value: "OtraCosa1!", name: "repitaContrasena" },
    });

    fireEvent.click(screen.getByText(/Guardar/i));

    await waitFor(() =>
      expect(
        screen.getByText(/Las contraseñas no coinciden/i)
      ).toBeInTheDocument()
    );
  });

  it("muestra error si la contraseña es demasiado corta", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fillForm();
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "123", name: "password" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
      target: { value: "123", name: "repitaContrasena" },
    });

    fireEvent.click(screen.getByText(/Guardar/i));

    await waitFor(() =>
      expect(
        screen.getByText(/al menos 8 caracteres/i)
      ).toBeInTheDocument()
    );
  });

  it("muestra error si la contraseña no cumple complejidad", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fillForm();
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "soloLetras", name: "password" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
      target: { value: "soloLetras", name: "repitaContrasena" },
    });

    fireEvent.click(screen.getByText(/Guardar/i));

    await waitFor(() =>
      expect(
        screen.getByText(/incluir letras, números y caracteres especiales/i)
      ).toBeInTheDocument()
    );
  });

  it("registro exitoso → modal verde → navega a login", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fillForm();
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "Password1!", name: "password" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
      target: { value: "Password1!", name: "repitaContrasena" },
    });

    fireEvent.click(screen.getByText(/Guardar/i));

    await waitFor(() =>
      expect(
        screen.getByText(/Registro exitoso/i)
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(/Ir a Login/i));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("muestra error si el backend responde mal", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Email ya registrado" }),
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fillForm();
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "Password1!", name: "password" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
      target: { value: "Password1!", name: "repitaContrasena" },
    });

    fireEvent.click(screen.getByText(/Guardar/i));

    await waitFor(() =>
      expect(
        screen.getByText(/Error en el registro/i)
      ).toBeInTheDocument()
    );
    expect(screen.getByText(/Email ya registrado/i)).toBeInTheDocument();
  });
});
