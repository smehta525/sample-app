import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { NotesListPage } from "./pages/NotesListPage";
import { NoteCreatePage } from "./pages/NoteCreatePage";
import { NoteEditPage } from "./pages/NoteEditPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<NotesListPage />} />
        <Route path="new" element={<NoteCreatePage />} />
        <Route path=":id/edit" element={<NoteEditPage />} />
      </Route>
    </Routes>
  );
}
