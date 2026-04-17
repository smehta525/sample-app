import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../test/renderWithProviders";
import { notesStore } from "../test/handlers";
import { NoteCreatePage } from "./NoteCreatePage";

function LocationProbe() {
  return <div data-testid="home-page">Home</div>;
}

describe("NoteCreatePage", () => {
  it("submits a new note and navigates home", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/new" element={<NoteCreatePage />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>,
      { initialEntries: ["/new"] },
    );

    await user.type(screen.getByLabelText(/title/i), "Grocery run");
    await user.type(screen.getByLabelText(/content/i), "Pick up coffee beans");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    const created = notesStore.notes.find((n) => n.title === "Grocery run");
    expect(created).toBeDefined();
    expect(created?.content).toBe("Pick up coffee beans");
  });

  it("shows validation errors when required fields are missing", async () => {
    const user = userEvent.setup();

    renderWithProviders(<NoteCreatePage />);

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/content is required/i)).toBeInTheDocument();
  });
});
