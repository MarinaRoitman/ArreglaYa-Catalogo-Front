import React from "react";
import { render, screen } from "@testing-library/react";
import RegisterPage from "../pages/RegisterPage";

jest.mock("@mantine/core", () => ({
  Group: ({ children }) => <div>{children}</div>,
  Stack: ({ children }) => <div>{children}</div>,
  ThemeIcon: ({ children }) => <div>{children}</div>,

  Modal: ({ opened, children }) => (opened ? <div data-testid="modal">{children}</div> : null),

  // Botones
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  ActionIcon: ({ children, ...props }) => <button {...props}>{children}</button>,

  // Tipografía
  Text: ({ children, ...props }) => <span {...props}>{children}</span>,
}));


jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => () => {}, 
  };
});


jest.mock("@tabler/icons-react", () => ({
  IconCheck: () => <span>✔</span>,
  IconAlertCircle: () => <span>⚠</span>,
  IconEye: () => <span>👁</span>,
  IconEyeOff: () => <span>🚫</span>,
}));

jest.mock("../Api/api", () => ({
  API_URL: "http://mock.api/",
}));

jest.mock("../../src/Form.css", () => ({}), { virtual: true });

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({}),
});

describe("RegisterPage", () => {
  test("renderiza título y botón Guardar", () => {
    render(<RegisterPage />);
    expect(screen.getByText(/Arregla Ya/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar/i })).toBeInTheDocument();
  });
});
