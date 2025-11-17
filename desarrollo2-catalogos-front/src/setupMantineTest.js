// Fix para Mantine en JSDOM

jest.mock("@mantine/hooks", () => {
  const hooks = jest.requireActual("@mantine/hooks");

  return {
    ...hooks,
    useIsomorphicEffect: (fn) => fn(),
  };
});

jest.mock("@mantine/core", () => {
  const core = jest.requireActual("@mantine/core");

  return {
    ...core,
    useProviderColorScheme: () => ({
      colorScheme: "light",
      toggleColorScheme: () => {},
    }),
  };
});

// ======================================================
// FIX GLOBAL ResizeObserver para Mantine ScrollArea
// ======================================================
class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

