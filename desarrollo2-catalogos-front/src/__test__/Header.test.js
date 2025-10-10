import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../components/Header";

/* 🎭 Mock completo de Mantine */
jest.mock("@mantine/core", () => ({
  Group: ({ children }) => <div>{children}</div>,
  Burger: ({ onClick }) => (
    <button onClick={onClick} aria-label="burger-button">Burger</button>
  ),
  Image: ({ src, alt }) => <img src={src} alt={alt} />,
  ActionIcon: ({ onClick, children }) => (
    <button onClick={onClick} aria-label="Cambiar modo de color">
      {children}
    </button>
  ),
  useMantineColorScheme: () => ({
    setColorScheme: jest.fn(),
  }),
  useComputedColorScheme: () => "light",
}));

describe("Header component", () => {
  test("renderiza el logo correcto con tema claro", () => {
    render(<Header opened={false} toggle={jest.fn()} />);
    const logo = screen.getByAltText(/Arregla Ya/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/ArreglaYaIcon.jpeg");
  });

  test("llama a toggle al hacer clic en el Burger", () => {
    const toggleMock = jest.fn();
    render(<Header opened={false} toggle={toggleMock} />);
    fireEvent.click(screen.getByLabelText("burger-button"));
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  test("muestra el botón para cambiar el tema", () => {
    render(<Header opened={false} toggle={jest.fn()} />);
    const themeButton = screen.getByLabelText(/Cambiar modo de color/i);
    expect(themeButton).toBeInTheDocument();
  });
});
