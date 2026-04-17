import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../test/renderWithProviders";
import { notesStore, defaultSeed } from "../test/handlers";
import { NoteEditPage } from "./NoteEditPage";

function HomeProbe() {
  return <div data-testid="home-page">Home</div>;
}

describe("NoteEditPage", () => {
  it("prefills the form and submits updated values", async () => {
    const user = userEvent.setup();
    const target = defaultSeed[0];

    renderWithProviders(
      <Routes>
        <Route path="/:id/edit" element={<NoteEditPage />} />
        <Route path="/" element={<HomeProbe />} />
      </Routes>,
      { initialEntries: [`/${target.id}/edit`] },
    );

    const titleInput = await screen.findByLabelText<HTMLInputElement>(/title/i);
    await waitFor(() => expect(titleInput.value).toBe(target.title));

    const contentInput = screen.getByLabelText<HTMLTextAreaElement>(/content/i);
    expect(contentInput.value).toBe(target.content);

    await user.clear(titleInput);
    await user.type(titleInput, "Shopping list (updated)");
    await user.clear(contentInput);
    await user.type(contentInput, "Eggs, bread, milk, butter");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    const updated = notesStore.notes.find((n) => n.id === target.id);
    expect(updated?.title).toBe("Shopping list (updated)");
    expect(updated?.content).toBe("Eggs, bread, milk, butter");
  });

  it("shows a not-found message when the note does not exist", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/:id/edit" element={<NoteEditPage />} />
      </Routes>,
      { initialEntries: ["/00000000-0000-0000-0000-000000000000/edit"] },
    );

    expect(await screen.findByText(/note not found/i)).toBeInTheDocument();
  });
});
