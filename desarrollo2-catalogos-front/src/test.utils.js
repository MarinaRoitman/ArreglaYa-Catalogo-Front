import { MantineProvider } from "@mantine/core";
import { render as rtlRender } from "@testing-library/react";

function render(ui, options) {
  return rtlRender(<MantineProvider>{ui}</MantineProvider>, options);
}

export * from "@testing-library/react"; // re-exporta screen, fireEvent, waitFor, etc.
export { render };
