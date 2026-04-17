export const queryKeys = {
    notes: {
        all: ['notes'] as const,
        detail: (id: string) => ['notes', id] as const,
    },
}
