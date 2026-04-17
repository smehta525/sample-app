import { setupServer } from 'msw/node'
import { handlers, notesStore, defaultSeed } from './handlers'

export const server = setupServer(...handlers)

export function resetNotesStore(): void {
    notesStore.reset(defaultSeed)
}

export { notesStore, defaultSeed }
