import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createNote, type NoteInput } from "../api/notes";
import { queryKeys } from "../api/queryKeys";
import { NoteForm } from "../components/NoteForm";

export function NoteCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: NoteInput) => createNote(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
      navigate("/");
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">New note</h1>
      <NoteForm
        submitLabel="Save"
        isSubmitting={mutation.isPending}
        submitError={mutation.error?.message ?? null}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </div>
  );
}
