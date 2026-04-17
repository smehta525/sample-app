# Notes Feature

## Overview

A simple CRUD app for personal notes. The frontend is a React 19 + Vite + Tailwind v4 SPA that talks to a .NET 10 ASP.NET Core Web API backed by Entity Framework Core. Locally the API uses SQLite (file-based, zero setup); in the cloud it targets Azure SQL. A developer can clone the repo, run the backend and frontend, and exercise the full create/read/update/delete flow against either provider.

## Architecture

### Backend (`backend/Notes.Api`)

- [Domain/Note.cs](backend/Notes.Api/Domain/Note.cs) — the `Note` entity (`Id`, `Title`, `Content`, `CreatedAt`, `UpdatedAt`).
- [Data/NotesDbContext.cs](backend/Notes.Api/Data/NotesDbContext.cs) and [Data/Configurations/NoteConfiguration.cs](backend/Notes.Api/Data/Configurations/NoteConfiguration.cs) — `DbContext` + fluent entity config.
- [Controllers/NotesController.cs](backend/Notes.Api/Controllers/NotesController.cs) — the five REST endpoints.
- [Contracts/NoteContracts.cs](backend/Notes.Api/Contracts/NoteContracts.cs) — `NoteDto`, `CreateNoteRequest`, `UpdateNoteRequest`.
- [Extensions/ServiceCollectionExtensions.cs](backend/Notes.Api/Extensions/ServiceCollectionExtensions.cs) — provider selection wiring.
- [Migrations/Sqlite/](backend/Notes.Api/Migrations/Sqlite) and [Migrations/SqlServer/](backend/Notes.Api/Migrations/SqlServer) — per-provider migrations.

### Dual-provider mechanism

`Database:Provider` in [appsettings.json](backend/Notes.Api/appsettings.json) (or env var) picks the EF Core provider at startup: `Sqlite` (default) or `SqlServer`. [Data/ProviderNamespacedMigrationsAssembly.cs](backend/Notes.Api/Data/ProviderNamespacedMigrationsAssembly.cs) routes EF Core to the matching `Migrations/{Sqlite,SqlServer}` namespace so each provider has its own migration history. [Data/NotesDbContextFactory.cs](backend/Notes.Api/Data/NotesDbContextFactory.cs) supports the same switch for design-time tooling (`dotnet ef`).

### Frontend (`frontend/src`)

- [src/api/notes.ts](frontend/src/api/notes.ts), [src/api/queryKeys.ts](frontend/src/api/queryKeys.ts) — typed fetch client + TanStack Query keys.
- [src/components/](frontend/src/components) — `Layout`, `Button`, `NoteForm`.
- [src/pages/](frontend/src/pages) — `NotesListPage`, `NoteCreatePage`, `NoteEditPage` wired via React Router in [src/App.tsx](frontend/src/App.tsx).
- [src/test/](frontend/src/test) — Vitest setup, MSW server, and test render helpers.

TanStack Query owns server state (caching, invalidation on mutation); React Router handles navigation between list/create/edit views.

## API Reference

Base path: `/api/notes`.

| Method | Path    | Request body        | Response body | Status codes  |
| ------ | ------- | ------------------- | ------------- | ------------- |
| GET    | `/`     | —                   | `NoteDto[]`   | 200           |
| GET    | `/{id}` | —                   | `NoteDto`     | 200, 404      |
| POST   | `/`     | `CreateNoteRequest` | `NoteDto`     | 201, 400      |
| PUT    | `/{id}` | `UpdateNoteRequest` | `NoteDto`     | 200, 400, 404 |
| DELETE | `/{id}` | —                   | —             | 204, 404      |

Shapes:

```ts
NoteDto            = { id: string; title: string; content: string; createdAt: string; updatedAt: string }
CreateNoteRequest  = { title: string;  // required, max 200
                       content: string } // required
UpdateNoteRequest  = { title: string;  // required, max 200
                       content: string } // required
```

Validation failures return RFC 7807 `ValidationProblemDetails` with 400.

## Database Providers

### Local (SQLite)

Default. The API creates `notes.db` at the `Notes.Api/` project root on first run. No connection string needed. Migrations live in [Migrations/Sqlite/](backend/Notes.Api/Migrations/Sqlite).

### Cloud (Azure SQL)

Set:

```
Database__Provider=SqlServer
ConnectionStrings__SqlServer=<your Azure SQL connection string>
```

Migrations live in [Migrations/SqlServer/](backend/Notes.Api/Migrations/SqlServer).

### Adding a migration

Run from `backend/Notes.Api/`:

```bash
# SQLite
dotnet ef migrations add <Name> -o Migrations/Sqlite -- --provider Sqlite

# SQL Server
dotnet ef migrations add <Name> -o Migrations/SqlServer -- --provider SqlServer
```

The `--` passes the `--provider` switch through to [NotesDbContextFactory](backend/Notes.Api/Data/NotesDbContextFactory.cs).

## Running Locally

1. **Backend**

   ```bash
   cd backend
   dotnet run --project Notes.Api
   ```

   API at http://localhost:5270.

2. **Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   App at http://localhost:5173. Vite proxies `/api` to the backend — see [frontend/vite.config.ts](frontend/vite.config.ts).

## Testing

- **Backend:** `dotnet test backend/Notes.sln` — xUnit + `WebApplicationFactory` running against SQLite ([backend/Notes.Api.Tests/](backend/Notes.Api.Tests)).
- **Frontend:** `cd frontend && npm test` — Vitest + React Testing Library with MSW ([frontend/src/test/](frontend/src/test)).
- **Typecheck / build:** `cd frontend && npm run typecheck` and `npm run build`.
- **Format:** `dotnet format backend/Notes.sln`.

## Known Limitations / Follow-ups

- No authentication or authorization yet.
- `Database.Migrate()` runs at startup **only in Development** — production should apply migrations from CI.
- The Azure SQL connection string in config is a placeholder.
- No infrastructure (Bicep) or CI workflows are checked in yet.
- No Playwright end-to-end tests yet.
