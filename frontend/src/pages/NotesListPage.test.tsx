import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/renderWithProviders";
import { notesStore } from "../test/handlers";
import { NotesListPage } from "./NotesListPage";

describe("NotesListPage", () => {
  it("renders notes returned by the API", async () => {
    renderWithProviders(<NotesListPage />);

    expect(
      await screen.findByRole("heading", { name: "Shopping list" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ideas" })).toBeInTheDocument();
  });

  it("deletes a note after confirmation", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();

    renderWithProviders(<NotesListPage />);

    const shoppingHeading = await screen.findByRole("heading", {
      name: "Shopping list",
    });
    const row = shoppingHeading.closest("li");
    expect(row).not.toBeNull();

    await user.click(
      within(row as HTMLElement).getByRole("button", { name: /delete/i }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Shopping list" }),
      ).not.toBeInTheDocument();
    });
    expect(
      notesStore.notes.find((n) => n.title === "Shopping list"),
    ).toBeUndefined();

    confirmSpy.mockRestore();
  });
});
