import React from "react";
import "../setupMantineTest";
import { render, screen, fireEvent } from "../test.utils";
import Solicitudes from "../pages/Solicitudes";

import * as mantineHooks from "@mantine/hooks";

jest.spyOn(mantineHooks, "useMediaQuery");

jest.mock("../components/LayoutTrabajosPendientes", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

jest.mock("../components/TableComponent", () => ({ rows, aprobar, rechazar }) => (
  <div data-testid="table">
    {rows.map((r) => (
      <div key={r.id}>
        <span>{r.nombre}</span>
        <button onClick={() => aprobar(r)}>Aprobar</button>
        <button onClick={() => rechazar(r.id)}>Rechazar</button>
      </div>
    ))}
  </div>
));

jest.mock("../components/CardsMobile", () => ({ rows, aprobar, rechazar }) => (
  <div data-testid="cards-mobile">
    {rows.map((r) => (
      <div key={r.id}>
        <span>{r.nombre}</span>
        <button onClick={() => aprobar(r)}>Aprobar</button>
        <button onClick={() => rechazar(r.id)}>Rechazar</button>
      </div>
    ))}
  </div>
));

jest.mock("../components/Filterbar", () => () => (
  <div data-testid="filterbar">Filterbar</div>
));

jest.mock("../components/ModalBorrar", () => ({ opened, onConfirm }) =>
  opened ? (
    <div data-testid="modal-delete">
      <button onClick={onConfirm}>Confirmar</button>
    </div>
  ) : null
);

jest.mock("../components/ModalCotizar", () => ({ opened, row, onSubmit }) =>
  opened ? (
    <div data-testid="modal-cotizar">
      <span>{row?.nombre}</span>
      <button
        onClick={() => onSubmit({ montoTotal: 500, fecha: "2025-01-01" })}
      >
        Enviar
      </button>
    </div>
  ) : null
);

// ======= TESTS ========

describe("Solicitudes", () => {
  const data = [
    {
      id: 1,
      nombre: "Martina",
      telefono: "123",
      direccion: "Calle 1",
      fechaHora: "2025-01-01",
      servicio: "Plomería",
      habilidad: "Reparación",
    },
    {
      id: 2,
      nombre: "Juan",
      telefono: "555",
      direccion: "Calle 2",
      fechaHora: "2025-01-02",
      servicio: "Gas",
      habilidad: "Instalación",
    },
  ];

  test("muestra tabla en desktop", () => {
    mantineHooks.useMediaQuery.mockReturnValue(false);

    render(<Solicitudes data={data} aprobar={jest.fn()} rechazar={jest.fn()} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  test("filtra resultados por nombre", () => {
    mantineHooks.useMediaQuery.mockReturnValue(false);

    render(<Solicitudes data={data} aprobar={jest.fn()} rechazar={jest.fn()} />);

    expect(screen.getByText("Martina")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
  });


  test("envía cotización y llama aprobar()", () => {
    const aprobar = jest.fn();
    mantineHooks.useMediaQuery.mockReturnValue(false);

    render(<Solicitudes data={data} aprobar={aprobar} rechazar={jest.fn()} />);

    fireEvent.click(screen.getAllByText("Aprobar")[0]);
    fireEvent.click(screen.getByText("Enviar"));

    expect(aprobar).toHaveBeenCalledWith(1, {
      montoTotal: 500,
      fecha: "2025-01-01",
    });
  });

  test("abre modal de eliminar y ejecuta rechazar()", () => {
    const rechazar = jest.fn();
    mantineHooks.useMediaQuery.mockReturnValue(false);

    render(<Solicitudes data={data} aprobar={jest.fn()} rechazar={rechazar} />);

    fireEvent.click(screen.getAllByText("Rechazar")[0]);

    expect(screen.getByTestId("modal-delete")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirmar"));

    expect(rechazar).toHaveBeenCalledWith(1);
  });
});
