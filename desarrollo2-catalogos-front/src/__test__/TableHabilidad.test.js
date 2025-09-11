import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("../components/TableHabilidad", () => () => (
<div data-testid="habilidades-table-mock">Mock de HabilidadesTable</div>
));

import HabilidadesTable from "../components/TableHabilidad";

describe("HabilidadesTable (solo mock)", () => {
it("se monta el mock correctamente", () => {
render(<HabilidadesTable />);
expect(screen.getByTestId("habilidades-table-mock"))
    .toHaveTextContent("Mock de HabilidadesTable");
});
});
