# NetRack

NetRack is a web application for documenting and designing network rack infrastructure.

The application is intended to make it easier to create a structured representation of a rack, its devices and patch panels, including their physical positions and basic parameters.

## Features

- Creating a new network infrastructure project
- Entering project information and location
- Configuring rack parameters
- Adding and editing network devices
- Adding and editing patch panels
- Assigning devices and patch panels to rack units (U)
- Detecting invalid rack positions and overlapping devices
- Reviewing the complete project in the summary step

## Technology

The project is built with:

- React
- TypeScript
- Vite
- CSS

## Project structure

```text
src/
├── components/
│   ├── Dashboard.tsx
│   ├── DeviceEditorModal.tsx
│   ├── DevicesStep.tsx
│   ├── PatchPanelEditorModal.tsx
│   ├── PatchPanelStep.tsx
│   ├── ProjectStep.tsx
│   ├── RackStep.tsx
│   ├── SummaryStep.tsx
│   └── WizardStep.tsx
├── pages/
│   └── NewProject.tsx
├── App.tsx
├── App.css
├── constants.ts
└── types.ts
```

## Requirements

- Node.js 20 or newer
- npm

Check your installed versions:

```bash
node --version
npm --version
```

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

## Production build

Create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Environment variables

Environment-specific configuration should be stored in `.env` files.

Do not commit real credentials or secrets to the repository.

Use `.env.example` as a template for required variables.

## Validation

Before creating a project, NetRack validates the rack configuration, including:

- project name
- project location
- rack name
- device positions
- patch panel positions
- rack height limits
- overlapping devices and patch panels

## Roadmap

Potential future development areas include:

- persistent project storage
- project import/export
- visual rack diagram
- network connection mapping
- cable documentation
- port-to-port connections
- device model database
- PDF documentation export
- user authentication
- multi-project management

## License

This project is currently distributed under the MIT License.

See [LICENSE](LICENSE) for details.
