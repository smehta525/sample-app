import { http, HttpResponse } from 'msw'
import type { Note } from '../api/notes'

type NoteInputBody = { title?: unknown; content?: unknown }

export type NotesStore = {
    notes: Note[]
    reset: (seed?: Note[]) => void
}

function cloneNotes(notes: Note[]): Note[] {
    return notes.map((n) => ({ ...n }))
}

export function createNotesStore(seed: Note[] = []): NotesStore {
    const store: NotesStore = {
        notes: cloneNotes(seed),
        reset(next = []) {
            store.notes = cloneNotes(next)
        },
    }
    return store
}

export const defaultSeed: Note[] = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Shopping list',
        content: 'Eggs, bread, milk',
        createdAt: '2026-04-01T12:00:00.000Z',
        updatedAt: '2026-04-10T08:30:00.000Z',
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Ideas',
        content: 'Write more tests.',
        createdAt: '2026-04-02T09:00:00.000Z',
        updatedAt: '2026-04-12T15:00:00.000Z',
    },
]

export function createHandlers(store: NotesStore) {
    return [
        http.get('/api/notes', () => {
            return HttpResponse.json(store.notes)
        }),

        http.get('/api/notes/:id', ({ params }) => {
            const note = store.notes.find((n) => n.id === params.id)
            if (!note) {
                return HttpResponse.json(
                    { title: 'Not Found', status: 404, detail: 'Note not found' },
                    { status: 404 },
                )
            }
            return HttpResponse.json(note)
        }),

        http.post('/api/notes', async ({ request }) => {
            const body = (await request.json()) as NoteInputBody
            const title = typeof body.title === 'string' ? body.title : ''
            const content = typeof body.content === 'string' ? body.content : ''
            const now = new Date().toISOString()
            const note: Note = {
                id: crypto.randomUUID(),
                title,
                content,
                createdAt: now,
                updatedAt: now,
            }
            store.notes = [...store.notes, note]
            return HttpResponse.json(note, {
                status: 201,
                headers: { Location: `/api/notes/${note.id}` },
            })
        }),

        http.put('/api/notes/:id', async ({ params, request }) => {
            const body = (await request.json()) as NoteInputBody
            const index = store.notes.findIndex((n) => n.id === params.id)
            if (index === -1) {
                return HttpResponse.json(
                    { title: 'Not Found', status: 404, detail: 'Note not found' },
                    { status: 404 },
                )
            }
            const existing = store.notes[index]
            const updated: Note = {
                ...existing,
                title: typeof body.title === 'string' ? body.title : existing.title,
                content:
                    typeof body.content === 'string' ? body.content : existing.content,
                updatedAt: new Date().toISOString(),
            }
            const next = [...store.notes]
            next[index] = updated
            store.notes = next
            return HttpResponse.json(updated)
        }),

        http.delete('/api/notes/:id', ({ params }) => {
            const index = store.notes.findIndex((n) => n.id === params.id)
            if (index === -1) {
                return HttpResponse.json(
                    { title: 'Not Found', status: 404, detail: 'Note not found' },
                    { status: 404 },
                )
            }
            store.notes = store.notes.filter((n) => n.id !== params.id)
            return new HttpResponse(null, { status: 204 })
        }),
    ]
}

export const notesStore = createNotesStore()
export const handlers = createHandlers(notesStore)
