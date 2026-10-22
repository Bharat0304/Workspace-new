# Workspace Architecture Specification

High-level architecture documentation for the cognitive discipline system.

## Architectural Layers
The project operates in clean layers to ensure scalability and developer independence:
- **UI Template Layer**: Modular HTML fragments and entry files located inside `modules/<feature>/pages`.
- **Component Layer**: Reusable styles and state controller codes inside `modules/<feature>/components` and `shared/components`.
- **Services (Data) Layer**: Isolated methods that abstract data fetch operations. Communicates only with the central API client.
- **State Layer**: Module-specific structures containing state data and dispatch methods. No direct mutation of foreign states is allowed.

## Developer Workflows
- **Frontend Developer**: Edits local components and binds templates to mocks during beta trials.
- **Backend Developer**: Reference `ApiContracts.md` to write route controllers matching exact payload contract shapes.
- **Electron Developer**: Hooks into services layer to map notifications or inject system analytics overlays.
