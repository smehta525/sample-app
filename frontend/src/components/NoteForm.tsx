import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import type { NoteInput } from "../api/notes";

type NoteFormProps = {
  initialValues?: NoteInput;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (values: NoteInput) => void;
};

type FieldErrors = {
  title?: string;
  content?: string;
};

const TITLE_MAX = 200;

function validate(values: NoteInput): FieldErrors {
  const errors: FieldErrors = {};
  const title = values.title.trim();
  const content = values.content.trim();
  if (!title) errors.title = "Title is required.";
  else if (title.length > TITLE_MAX)
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  if (!content) errors.content = "Content is required.";
  return errors;
}

export function NoteForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  submitError,
  onSubmit,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    const values = { title, content };
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({ title: title.trim(), content: content.trim() });
  }

  const showErrors = attempted;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <label
          htmlFor="note-title"
          className="block text-sm font-medium text-slate-700"
        >
          Title
        </label>
        <input
          id="note-title"
          name="title"
          type="text"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(showErrors && errors.title)}
          aria-describedby={
            showErrors && errors.title ? "note-title-error" : undefined
          }
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {showErrors && errors.title && (
          <p id="note-title-error" className="mt-1 text-sm text-red-600">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="note-content"
          className="block text-sm font-medium text-slate-700"
        >
          Content
        </label>
        <textarea
          id="note-content"
          name="content"
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-invalid={Boolean(showErrors && errors.content)}
          aria-describedby={
            showErrors && errors.content ? "note-content-error" : undefined
          }
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {showErrors && errors.content && (
          <p id="note-content-error" className="mt-1 text-sm text-red-600">
            {errors.content}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
        <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}
