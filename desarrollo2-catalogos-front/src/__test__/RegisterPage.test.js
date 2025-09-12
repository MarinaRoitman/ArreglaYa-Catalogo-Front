import { render, screen, fireEvent, waitFor } from "../test.utils";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

global.fetch = jest.fn();

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el formulario", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByText(/Guardar/i)).toBeInTheDocument();
  });


  it("muestra modal de éxito y navega al login", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

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
      target: { value: "123456", name: "telefono" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Dirección/i), {
      target: { value: "Calle 123", name: "direccion" },
    });
    fireEvent.change(screen.getByPlaceholderText(/DNI/i), {
      target: { value: "45678901", name: "dni" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "1234", name: "password" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
      target: { value: "1234", name: "repitaContrasena" },
    });

    fireEvent.click(screen.getByText(/Guardar/i));

    await waitFor(() =>
      expect(
        screen.getByText(/Registro exitoso/i)
      ).toBeInTheDocument()
    );

    // clic en el botón del modal
    fireEvent.click(screen.getByText(/Ir a Login/i));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("muestra modal de error si el registro falla", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Email ya existe" }),
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

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
      target: { value: "123456", name: "telefono" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Dirección/i), {
      target: { value: "Calle 123", name: "direccion" },
    });
    fireEvent.change(screen.getByPlaceholderText(/DNI/i), {
      target: { value: "45678901", name: "dni" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "1234", name: "password" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
      target: { value: "1234", name: "repitaContrasena" },
    });

    fireEvent.click(screen.getByText(/Guardar/i));

    await waitFor(() =>
      expect(
        screen.getByText(/Error en el registro/i)
      ).toBeInTheDocument()
    );
    expect(screen.getByText(/Email ya existe/i)).toBeInTheDocument();
  });
});
