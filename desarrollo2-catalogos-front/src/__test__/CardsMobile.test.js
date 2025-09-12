import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import CardsMobile from "../components/CardsMobile";

const Wrapper = ({ children }) => <MantineProvider>{children}</MantineProvider>;

const baseRows = [
{
id: 1,
nombre: "Juan Pérez",
telefono: "123456789",
direccion: "Calle Falsa 123",
fechaHora: "2025-09-10 14:00",
servicio: "Plomería",
habilidad: "Caños",
tiempoEstimado: "2h",
montoTotal: 1500,
clienteConfirmo: true,
},
];

describe("CardsMobile (UI e interacciones)", () => {
it("muestra campos básicos y botones de Aprobar/Rechazar en 'solicitudes'", () => {
const aprobar = jest.fn();
const rechazar = jest.fn();

render(
    <CardsMobile
    rows={baseRows}
    aprobar={aprobar}
    rechazar={rechazar}
    type="solicitudes"
    />,
    { wrapper: Wrapper }
);

// Datos principales
expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
expect(screen.getByText("123456789")).toBeInTheDocument();
expect(screen.getByText(/Calle Falsa 123/)).toBeInTheDocument();
expect(screen.getByText(/2025-09-10/)).toBeInTheDocument();

// Botones
const btnAprobar = screen.getByRole("button", { name: /Aprobar/i });
const btnRechazar = screen.getByRole("button", { name: /Rechazar/i });

fireEvent.click(btnAprobar);
expect(aprobar).toHaveBeenCalledWith(baseRows[0]);

fireEvent.click(btnRechazar);
expect(rechazar).toHaveBeenCalledWith(1);
});

it("muestra icono de confirmación en 'confirmados' si cliente confirmó", () => {
render(
    <CardsMobile rows={baseRows} type="confirmados" />,
    { wrapper: Wrapper }
);

// Debe estar el icono de cliente confirmado
expect(
    screen.getByRole("button", { name: /Cliente confirmó/i })
).toBeInTheDocument();
});

it("muestra icono de espera si cliente NO confirmó en 'confirmados'", () => {
render(
    <CardsMobile rows={[{ ...baseRows[0], clienteConfirmo: false }]} type="confirmados" />,
    { wrapper: Wrapper }
);

expect(
    screen.getByRole("button", { name: /Esperando confirmación/i })
).toBeInTheDocument();
});

it("muestra botón de calificar en 'realizados' cuando cliente confirmó", () => {
const calificar = jest.fn();
render(
    <CardsMobile
    rows={baseRows}
    type="realizados"
    calificar={calificar}
    />,
    { wrapper: Wrapper }
);

const btnCalificar = screen.getByRole("button", {
    name: /Realizado y Confirmado/i,
});
fireEvent.click(btnCalificar);
expect(calificar).toHaveBeenCalledWith(1);
});

it("muestra icono expirado si cliente no confirmó en 'realizados'", () => {
render(
    <CardsMobile
    rows={[{ ...baseRows[0], clienteConfirmo: false }]}
    type="realizados"
    />,
    { wrapper: Wrapper }
);

expect(
    screen.getByRole("button", { name: /Expirado sin confirmar/i })
).toBeInTheDocument();
});

it("incluye campos de tiempo y costo cuando type != 'solicitudes'", () => {
render(
    <CardsMobile rows={baseRows} type="confirmados" />,
    { wrapper: Wrapper }
);

expect(screen.getByText(/Tiempo Estimado:/i)).toBeInTheDocument();
expect(screen.getByText(/Costo Total:/i)).toBeInTheDocument();
});
});
