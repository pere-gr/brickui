# Roadmap

See [ROADMAP.md](../ROADMAP.md) for the deep dive. Current snapshot:

Short-term ideas:
- Split the monolithic `dist/VanillaBrick.js` into smaller `src/*` modules.
- Finish and document a stable **data store** API (remote/local, paging hooks).
- Add a simple **form** brick type reusing the same event/extension model.
- Introduce the first **service bricks** (Nexus-style master/detail wiring).
- More demos: master/detail with two grids bound by a service brick; form + grid linked via a shared store.

Non-goals (for now):
- No JSX / virtual DOM.
- No mandatory build step to *use* VanillaBrick (only to develop it).
- No heavy theming engine -- CSS classes + small helpers should be enough.

---
Previous: [Services & Nexus (planned)](07-services.md) | Next: [Contributing](09-contributing.md)
