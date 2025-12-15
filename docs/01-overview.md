# Overview & Why VanillaBrick

VanillaBrick is an experimental **vanilla-JavaScript UI micro-framework** built around "bricks":
small, self-contained components (grids, forms, background services, etc.) wired together by
a powerful event bus and an extensible plugin system. Status: early alpha (APIs will break).
Goal: a playground for enterprise-style components and headless services with strong lifecycle/events, zero runtime deps, and a single JS file.

## Why VanillaBrick?
- Flip control: everything interesting is an **event** with 3 phases: `before` -> `on` -> `after`.
- Events follow a strict `namespace:type:target` format; listeners can use `*`.
- Behaviour lives in extensions and services, keeping bricks small and composable.
- Works with or without DOM (UI bricks and headless services).
- Plain JS, no runtime deps, single JS file to use.

## Feature snapshot
- Bricks with `id`, `host` (`brick`/`service`) and `kind` (grid, form, service, etc.).
- Controllers per brick: options, events, extensions, runtime, status. DOM is optional.
- Event bus with phases (`before`/`on`/`after`), strict naming, sync/async fire.
- Extension system: `for` rules (host/kind), `requires`, `ns`, API, defaults, init/destroy, events.
- Auto-bootstrap from DOM: `.vb` elements become bricks; the `dom` extension wires the root.
- Demo: grid with columns/rows/store (sorting via `store:data:sort`).

---
Next: [Architecture & Core Controllers](02-architecture.md)
