import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ModalCotizar from "../components/ModalCotizar";

jest.mock("@mantine/core", () => {
  const Mock = ({ children }) => <div>{children}</div>;
  return {
    __esModule: true,
    Modal: ({ opened, children }) =>
      opened ? <div role="dialog">{children}</div> : null,
    TextInput: (props) => (
      <input
        aria-label={props.label}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
      />
    ),
    Group: Mock,
    Button: ({ children, ...props }) => (
      <button {...props}>{children}</button>
    ),
    Text: ({ children }) => <span>{children}</span>,
    Divider: Mock,
    Grid: Object.assign(Mock, { Col: Mock }),
    Flex: Mock,
  };
});


jest.mock("@tabler/icons-react", () => {
  const Icon = () => <span>icon</span>;
  return {
    IconUser: Icon,
    IconTool: Icon,
    IconMapPin: Icon,
    IconCalendar: Icon,
  };
});

const mockRow = {
  nombre: "Cliente Test",
  servicio: "Plomería",
  direccion: "Calle 123",
  fechaHora: "2025-06-01 15:00",
  montoTotal: 1500,
};

describe("ModalCotizar", () => {
  test("renderiza con datos del pedido", () => {
    render(
      <ModalCotizar
        opened={true}
        onClose={() => {}}
        row={mockRow}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByText("Cliente Test")).toBeInTheDocument();
    expect(screen.getByText("Plomería")).toBeInTheDocument();
    expect(screen.getByText("Calle 123")).toBeInTheDocument();
    expect(screen.getByText("2025-06-01 15:00")).toBeInTheDocument();

    // tarifa inicial cargada
    const tarifa = screen.getByLabelText("Tarifa propuesta");
    expect(tarifa.value).toBe("1500");
  });

  test("muestra error si la tarifa es inválida", () => {
    render(
      <ModalCotizar opened={true} row={mockRow} onClose={() => {}} onSubmit={() => {}} />
    );

    const input = screen.getByLabelText("Tarifa propuesta");

    fireEvent.change(input, { target: { value: "12,345" } }); // inválido por decimales

    expect(input.value).toBe("12.345"); // reemplaza coma por punto
  });

  test("llama a onSubmit con tarifa válida", () => {
    const submitMock = jest.fn();

    render(
      <ModalCotizar
        opened={true}
        row={mockRow}
        onClose={() => {}}
        onSubmit={submitMock}
      />
    );

    const input = screen.getByLabelText("Tarifa propuesta");
    fireEvent.change(input, { target: { value: "2000" } });

    const button = screen.getByRole("button", { name: /Enviar presupuesto/i });
    fireEvent.click(button);

    expect(submitMock).toHaveBeenCalledWith({
      montoTotal: 2000,
      fecha: null,
    });
  });

  test("no envía si tarifa está vacía", () => {
    const submitMock = jest.fn();

    render(
      <ModalCotizar
        opened={true}
        row={mockRow}
        onClose={() => {}}
        onSubmit={submitMock}
      />
    );

    const input = screen.getByLabelText("Tarifa propuesta");
    fireEvent.change(input, { target: { value: "" } });

    const button = screen.getByRole("button", { name: /Enviar presupuesto/i });
    fireEvent.click(button);

    expect(submitMock).not.toHaveBeenCalled();
  });
});
