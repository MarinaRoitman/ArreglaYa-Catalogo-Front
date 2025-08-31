import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";

describe("RegisterPage", () => {
test("renderiza todos los campos de entrada", () => {
render(
    <MemoryRouter>
    <RegisterPage />
    </MemoryRouter>
);

// Inputs básicos
expect(screen.getByPlaceholderText("Nombre")).toBeInTheDocument();
expect(screen.getByPlaceholderText("Apellido")).toBeInTheDocument();
expect(screen.getByPlaceholderText("Mail")).toBeInTheDocument();
expect(screen.getByPlaceholderText("Teléfono")).toBeInTheDocument();
expect(screen.getByPlaceholderText("Dirección")).toBeInTheDocument();
expect(screen.getByPlaceholderText("Usuario")).toBeInTheDocument();
expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
expect(
    screen.getByPlaceholderText("Repita la Contraseña")
).toBeInTheDocument();

// ComboBox
expect(screen.getByRole("combobox")).toBeInTheDocument();
expect(
    screen.getByText("Seleccione una zona")
).toBeInTheDocument();

// Botones
expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Cancelar" })).toBeInTheDocument();
});

test("permite completar el formulario", () => {
render(
    <MemoryRouter>
    <RegisterPage />
    </MemoryRouter>
);

fireEvent.change(screen.getByPlaceholderText("Nombre"), {
    target: { value: "Martina" },
});
fireEvent.change(screen.getByPlaceholderText("Apellido"), {
    target: { value: "Lopez" },
});
fireEvent.change(screen.getByPlaceholderText("Mail"), {
    target: { value: "marti@mail.com" },
});
fireEvent.change(screen.getByPlaceholderText("Teléfono"), {
    target: { value: "123456" },
});
fireEvent.change(screen.getByPlaceholderText("Dirección"), {
    target: { value: "CABA" },
});
fireEvent.change(screen.getByPlaceholderText("Usuario"), {
    target: { value: "martiuser" },
});
fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
    target: { value: "1234" },
});
fireEvent.change(screen.getByPlaceholderText("Repita la Contraseña"), {
    target: { value: "1234" },
});

// Guardar
fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
});
});
