import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";

jest.mock("@mantine/core", () => {
  return {
    Modal: ({ opened, children }) =>
      opened ? <div data-testid="modal">{children}</div> : null,

    Button: ({ children, onClick }) => (
      <button onClick={onClick}>{children}</button>
    ),

    Group: ({ children }) => <div>{children}</div>,
    Stack: ({ children }) => <div>{children}</div>,
    Text: ({ children }) => <p>{children}</p>,

    PasswordInput: ({ placeholder, value, onChange }) => (
      <input
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    ),

    ThemeIcon: ({ children }) => <div>{children}</div>,
  };
});


jest.mock("../Api/prestadores", () => ({
  getPrestadores: jest.fn().mockResolvedValue([]),
}));


jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));


global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

describe("RegisterPage — test simple sin APIs ni Mantine real", () => {
  test("completa registro exitoso sin errores", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // ------- Inputs -------
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

    // ------- Select provincia -------
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Buenos Aires" },
    });

    // ------- Dirección -------
    fireEvent.change(screen.getByPlaceholderText("Ciudad"), {
      target: { value: "La Plata" },
    });

    fireEvent.change(screen.getByPlaceholderText("Calle"), {
      target: { value: "Calle 10" },
    });

    fireEvent.change(screen.getByPlaceholderText("Número/Altura"), {
      target: { value: "123" },
    });

    // ------- Passwords -------
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "Clave123!" },
    });

    fireEvent.change(screen.getByPlaceholderText("Repita la contraseña"), {
      target: { value: "Clave123!" },
    });

    // ------- Enviar -------
    fireEvent.click(screen.getByText("Guardar"));

    // ------- Modal aparece -------
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });
});
