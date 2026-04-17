# AMIS 4630 Sample App

This is a sample app for AMIS 4630. It is a simple app that allows users to create, read, update, and delete (CRUD) notes. The app is built using React frontend and .NET backend. The app uses Entity Framework Core for data access and Azure SQL Database for data storage. The app is deployed on Azure using GitHub Actions for continuous integration and continuous deployment (CI/CD).

## Getting Started

See [docs/notes-feature.md](docs/notes-feature.md) for architecture, API reference, and local setup.

### Quick start

- Backend: `cd backend && dotnet run --project Notes.Api`
- Frontend: `cd frontend && npm install && npm run dev`
