import React from "react";
import { render, screen, fireEvent } from "../test.utils";

jest.mock("@mantine/core", () => {
  const original = jest.requireActual("@mantine/core");

  const mockSetColorScheme = jest.fn();
  const mockUseComputedColorScheme = jest.fn();

  return {
    ...original,
    useMantineColorScheme: () => ({
      setColorScheme: mockSetColorScheme,
    }),
    useComputedColorScheme: mockUseComputedColorScheme,

    __mockSetColorScheme: mockSetColorScheme,
    __mockUseComputedColorScheme: mockUseComputedColorScheme,
  };
});

import Header from "../components/Header";
import {
  __mockSetColorScheme,
  __mockUseComputedColorScheme,
} from "@mantine/core";

const localStorageSetItemMock = jest.fn();
Object.defineProperty(window, "localStorage", {
  value: {
    setItem: localStorageSetItemMock,
  },
});

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el logo en light mode", () => {
    __mockUseComputedColorScheme.mockReturnValue("light");

    render(<Header opened={false} toggle={() => {}} />);

    const img = screen.getByRole("img", { name: /Arregla Ya/i });
    expect(img).toHaveAttribute("src", "/ArreglaYaIcon.jpeg");
  });

  it("renderiza el logo en dark mode", () => {
    __mockUseComputedColorScheme.mockReturnValue("dark");

    render(<Header opened={false} toggle={() => {}} />);

    const img = screen.getByRole("img", { name: /Arregla Ya/i });
    expect(img).toHaveAttribute("src", "/ArreglaYaDark.png");
  });

it("ejecuta toggle al hacer click en el Burger", () => {
  __mockUseComputedColorScheme.mockReturnValue("light");

  const toggleMock = jest.fn();

  render(<Header opened={false} toggle={toggleMock} />);

  // Encontrar todos los botones
  const buttons = screen.getAllByRole("button");

  // El Burger NO tiene aria-label → ese es el que queremos
  const burger = buttons.find((b) => !b.getAttribute("aria-label"));

  expect(burger).toBeInTheDocument();

  fireEvent.click(burger);

  expect(toggleMock).toHaveBeenCalledTimes(1);
});

  it("cambia light → dark al clickear el botón de tema", () => {
    __mockUseComputedColorScheme.mockReturnValue("light");

    render(<Header opened={false} toggle={() => {}} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Cambiar modo de color/i })
    );

    expect(__mockSetColorScheme).toHaveBeenCalledWith("dark");
    expect(localStorageSetItemMock).toHaveBeenCalledWith(
      "mantine-color-scheme",
      "dark"
    );
  });

  it("cambia dark → light al clickear el botón de tema", () => {
    __mockUseComputedColorScheme.mockReturnValue("dark");

    render(<Header opened={false} toggle={() => {}} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Cambiar modo de color/i })
    );

    expect(__mockSetColorScheme).toHaveBeenCalledWith("light");
    expect(localStorageSetItemMock).toHaveBeenCalledWith(
      "mantine-color-scheme",
      "light"
    );
  });
});

