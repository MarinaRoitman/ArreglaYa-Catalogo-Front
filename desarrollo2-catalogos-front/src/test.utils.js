import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router-dom";

function render(ui, { route = "/" , ...options } = {}) {
  return rtlRender(
    <MemoryRouter initialEntries={[route]}>
      <MantineProvider>
        {ui}
      </MantineProvider>
    </MemoryRouter>,
    options
  );
}

export * from "@testing-library/react";
export { render };
