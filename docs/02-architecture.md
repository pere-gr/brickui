# Architecture & Core Controllers

## Bricks
- Fields: `id`, `host` (`brick` | `service`), `kind` (e.g. `grid`, `form`, `service`).
- Controllers per brick: `options`, `events`, `extensions`, `runtime`, `status`. DOM is optional (headless bricks allowed).
- Runtime controller wraps execution for safety/debug (zero-bind; `this` inside APIs/handlers/helpers exposes `{ brick, ext }`).

## Event bus
- Naming: exactly `namespace:type:target`; no wildcards when firing. Examples: `brick:status:ready`, `store:data:set`, `store:data:sort`, `dom:click:my-btn`.
- Phases: `before` (validate/cancel), `on` (core), `after` (react/cleanup).
- Sync and async dispatch: `fire()` and `fireAsync()`.

## Options controller
- Flattened key/value store with dotted paths (`grid.columns`, etc.).
- API: `get`, `set` / `setAsync`, `setSilent`, `has`, `all`.
- Extensions can provide default options applied silently during install.

## Extensions controller
- Installs extensions that match the brick by `for` rules (`{ host, kind }` + wildcards) and `requires`.
- Steps: apply defaults, expose `ns` API, run `init`, register events, manage `destroy`.

## Lifecycle
- Ready: brick fires `brick:status:ready` after extensions are applied.
- Destroy: brick fires `brick:status:destroyed` and extensions get `destroy`.

---
Previous: [Overview & Why VanillaBrick](01-overview.md) | Next: [Contracts & Conventions](03-contracts.md)
