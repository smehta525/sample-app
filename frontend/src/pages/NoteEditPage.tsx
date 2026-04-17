import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNote, updateNote, type NoteInput } from "../api/notes";
import { queryKeys } from "../api/queryKeys";
import { NoteForm } from "../components/NoteForm";

function isNotFound(error: unknown): boolean {
  return error instanceof Error && /404|not found/i.test(error.message);
}

export function NoteEditPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.notes.detail(id),
    queryFn: () => getNote(id),
    enabled: id.length > 0,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (values: NoteInput) => updateNote(id, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.notes.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
      navigate("/");
    },
  });

  if (query.isPending) {
    return <p className="text-sm text-slate-600">Loading note…</p>;
  }

  if (query.isError) {
    if (isNotFound(query.error)) {
      return (
        <div className="space-y-4">
          <p className="text-slate-700">Note not found.</p>
          <Link
            to="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to notes
          </Link>
        </div>
      );
    }
    return (
      <p role="alert" className="text-sm text-red-600">
        Failed to load note: {query.error.message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Edit note</h1>
      <NoteForm
        initialValues={{ title: query.data.title, content: query.data.content }}
        submitLabel="Save"
        isSubmitting={mutation.isPending}
        submitError={mutation.error?.message ?? null}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </div>
  );
}
