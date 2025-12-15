# Extensions

## Anatomy
- `for`: array of `{ host, kind }` rules (wildcards `*` allowed). Host defaults to `brick` if omitted.
- `requires`: namespaces that must exist on the brick (`dom`, `store`, etc.).
- `ns`: namespace exported to `brick[ns].*`.
- `options`: default options merged silently into the brick.
- `brick`: public API methods bound to the brick namespace.
- `extension`: internal helpers bound to the extension instance.
- `events`: subscriptions with phases (`before` / `on` / `after`).
- `init` / `destroy`: lifecycle hooks.

## Example
```js
VanillaBrick.extensions.columns = {
  for: [{ host: 'brick', kind: 'grid' }],
  requires: ['dom', 'store', 'grid'],
  ns: 'columns',
  options: {},
  brick: { get: function () {}, sort: function (field, dir) {} },
  extension: { _normalizeArray: function (value, fallback) {} },
  events: [
    { for: 'brick:status:ready', on: { fn: function (ev) { /* build <thead> */ } } },
    { for: 'store:data:sort:*',   after: { fn: function (ev) { /* update sort */ } } }
  ],
  init: function () { return true; },
  destroy: function () {}
};
```

## Install flow
1. Filter by `for` (host/kind) and `requires`.
2. Bind `extension.*` helpers to the extension instance.
3. Apply default `options` silently.
4. Bind `brick.*` API to `brick[ns].*`.
5. Call `init()`.
6. Register `events` with phase + priority.

## Current extensions (alpha)
- `dom` - resolve main DOM element and manage DOM listeners.
- `domCss` - helpers: `brick.css.addClass`, `removeClass`, `show`, `hide`, `setStyle`, etc.
- `domEvents` - map native DOM events to VanillaBrick events.
- `store` - in-memory data store for grids/forms (`store.data:*`).
- `grid` - base grid behavior.
- `columns` - header rendering + sorting.
- `rows` - body rendering on ready/data changes.

---
Previous: [Contracts & Conventions](03-contracts.md) | Next: [Configuration & Bootstrap](05-configuration.md)
