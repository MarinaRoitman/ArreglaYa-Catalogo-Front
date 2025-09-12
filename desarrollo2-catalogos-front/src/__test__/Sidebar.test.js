import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("../components/Sidebar", () => () => (
<div data-testid="sidebar-mock">
<h1>Sidebar</h1>

<div>
    <span role="img" aria-label="avatar">🧑‍💻</span>
    <p>¡Bienvenid@ Usuario!</p>
</div>

<nav aria-label="links-principales">
    <button>Solicitudes</button>
    <button>Confirmados</button>
    <button>Realizados</button>
    <button>Habilidades</button>
    <button>Ir a Pagos</button>
</nav>

<footer>
    <button>Mi Perfil</button>
    <button>Log out</button>
</footer>

<div role="dialog" aria-label="modal-logout">
    <p>¿Seguro que querés cerrar sesión?</p>
    <button>Cancelar</button>
    <button>Confirmar</button>
</div>
</div>
));

import Sidebar from "../components/Sidebar";

describe("Sidebar (mock UI completo)", () => {
it("renderiza avatar, saludo y todos los links principales", () => {
render(<Sidebar />);


expect(screen.getByRole("heading", { name: /Sidebar/i })).toBeInTheDocument();
expect(screen.getByText(/Bienvenid@ Usuario/i)).toBeInTheDocument();


expect(screen.getByRole("button", { name: /Solicitudes/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Confirmados/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Realizados/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Habilidades/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Ir a Pagos/i })).toBeInTheDocument();


expect(screen.getByRole("button", { name: /Mi Perfil/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Log out/i })).toBeInTheDocument();


expect(screen.getByRole("dialog", { name: /modal-logout/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Confirmar/i })).toBeInTheDocument();
});

it("permite interactuar con los botones principales", () => {
render(<Sidebar />);

fireEvent.click(screen.getByRole("button", { name: /Solicitudes/i }));
fireEvent.click(screen.getByRole("button", { name: /Mi Perfil/i }));
fireEvent.click(screen.getByRole("button", { name: /Log out/i }));

expect(screen.getByRole("button", { name: /Solicitudes/i })).toBeInTheDocument();
expect(screen.getByRole("button", { name: /Log out/i })).toBeInTheDocument();
});
});
