import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { server, resetNotesStore } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => resetNotesStore())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
