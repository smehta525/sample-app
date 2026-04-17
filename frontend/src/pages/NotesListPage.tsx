import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteNote, listNotes, type Note } from "../api/notes";
import { queryKeys } from "../api/queryKeys";
import { Button } from "../components/Button";

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function truncate(value: string, max = 140): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
}

export function NotesListPage() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.notes.all,
    queryFn: listNotes,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
    },
  });

  function handleDelete(note: Note) {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    deleteMutation.mutate(note.id);
  }

  if (isPending) {
    return <p className="text-sm text-slate-600">Loading notes…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Failed to load notes: {error.message}
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-600">No notes yet.</p>
        <Link
          to="/new"
          className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Create your first note
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((note) => (
        <li
          key={note.id}
          className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
        >
          <article aria-labelledby={`note-${note.id}-title`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id={`note-${note.id}-title`}
                  className="truncate text-base font-semibold text-slate-900"
                >
                  {note.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {truncate(note.content)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Updated {formatTimestamp(note.updatedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={`/${note.id}/edit`}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </Link>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(note)}
                  disabled={
                    deleteMutation.isPending &&
                    deleteMutation.variables === note.id
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
