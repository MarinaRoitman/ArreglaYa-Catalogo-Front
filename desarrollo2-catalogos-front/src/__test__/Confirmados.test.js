import React from "react";
import "../setupMantineTest";
import { render, screen } from "../test.utils";
import Confirmados from "../pages/Confirmados";

import * as mantineHooks from "@mantine/hooks";
jest.spyOn(mantineHooks, "useMediaQuery");


jest.mock("../components/LayoutTrabajosPendientes", () => ({ children }) => (
  <div data-testid="layout">{children}</div>
));

jest.mock("../components/Filterbar", () => () => (
  <div data-testid="filterbar">Filterbar</div>
));

jest.mock("../components/TableComponent", () => ({ rows }) => (
  <div data-testid="table">
    {rows.map((r) => (
      <div key={r.id}>{r.nombre}</div>
    ))}
  </div>
));

// ======= TESTS ========

describe("Confirmados", () => {
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

    render(<Confirmados data={data} rechazar={jest.fn()} />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByText("Martina")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
  });

  test("muestra mensaje cuando no hay datos", () => {
    mantineHooks.useMediaQuery.mockReturnValue(false);

    render(<Confirmados data={[]} rechazar={jest.fn()} />);

    expect(screen.getByText("No se encontraron resultados")).toBeInTheDocument();
  });

  test("muestra el título correctamente", () => {
    mantineHooks.useMediaQuery.mockReturnValue(false);

    render(<Confirmados data={data} rechazar={jest.fn()} />);

    expect(screen.getByText("Confirmados")).toBeInTheDocument();
  });
});
