# VanillaBrick

VanillaBrick is an experimental **vanilla-JavaScript UI micro-framework** built around "bricks":
small, self-contained components (grids, forms, background services, etc.) wired together by
a powerful event bus and an extensible plugin system. Early alpha: APIs will break.

---

## Table of contents
- [Overview & Why](docs/01-overview.md)
- [Architecture & Core Controllers](docs/02-architecture.md)
- [Contracts & Conventions](docs/03-contracts.md)
- [Extensions](docs/04-extensions.md)
- [Configuration & Bootstrap](docs/05-configuration.md)
- [Quick Start](docs/06-quickstart.md)
- [Services & Nexus (planned)](docs/07-services.md)
- [Roadmap](docs/08-roadmap.md)
- [Contributing](docs/09-contributing.md)
- [License](docs/10-license.md)

---

## Demo
- Grid demo (work in progress): https://pere-gr.github.io/vanillabrick/
  - `grid` brick kind.
  - `columns` extension: header rendering + sorting.
  - `rows` extension: body rendering.
  - `store` extension: in-memory data with `store.data:*` events.
  - Click on a sortable header -> raises `store:data:sort` -> rows re-render.
