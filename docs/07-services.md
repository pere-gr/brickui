# Services & Nexus (planned)

Bricks can be used as **services**: no DOM, only state + events + extensions. Idea: build higher-level bricks that coordinate others (master/detail, shared stores, form-grid sync, etc.).

Example vision: a `Nexus` service that links bricks automatically based on IDs/roles:

```js
grid.options.set('nexus.links', [
  { id: 0, kind: 'master' },
  { id: 2, source: 0, kind: 'slave' }
]);
```

Not implemented yet, but the architecture (bricks + extensions + events) is designed for it.

---
Previous: [Quick Start](06-quickstart.md) | Next: [Roadmap](08-roadmap.md)
