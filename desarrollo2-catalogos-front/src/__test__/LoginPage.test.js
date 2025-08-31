import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

test("renderiza los inputs de login", () => {
render(
<MemoryRouter>
    <LoginPage />
</MemoryRouter>
);

// Cambié Usuario → Email
expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
expect(screen.getByPlaceholderText(/Contraseña/i)).toBeInTheDocument();
expect(
screen.getByRole("button", { name: /Iniciar Sesión/i })
).toBeInTheDocument();
});

test("permite escribir en los inputs", () => {
render(
<MemoryRouter>
    <LoginPage />
</MemoryRouter>
);

const emailInput = screen.getByPlaceholderText(/Email/i);
const contrasenaInput = screen.getByPlaceholderText(/Contraseña/i);

fireEvent.change(emailInput, { target: { value: "martina@mail.com" } });
fireEvent.change(contrasenaInput, { target: { value: "1234" } });

expect(emailInput.value).toBe("martina@mail.com");
expect(contrasenaInput.value).toBe("1234");
});

test("ejecuta el submit con datos ingresados", () => {
render(
<MemoryRouter>
    <LoginPage />
</MemoryRouter>
);

const emailInput = screen.getByPlaceholderText(/Email/i);
const contrasenaInput = screen.getByPlaceholderText(/Contraseña/i);
const boton = screen.getByRole("button", { name: /Iniciar Sesión/i });

fireEvent.change(emailInput, { target: { value: "martina@mail.com" } });
fireEvent.change(contrasenaInput, { target: { value: "1234" } });
fireEvent.click(boton);

expect(emailInput.value).toBe("martina@mail.com");
expect(contrasenaInput.value).toBe("1234");
});