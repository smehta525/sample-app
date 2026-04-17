import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";

type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  initialEntries?: string[];
  path?: string;
};

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ["/"],
    path,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const content = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : (
    ui
  );

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{content}</MemoryRouter>
    </QueryClientProvider>,
    renderOptions,
  );

  return { ...utils, queryClient };
}
