# Configuration & Bootstrap

## Inline configs
- Any `<script type="application/json" data-brick>` block is parsed at bootstrap.
- The JSON can define one or many bricks, keyed by `id`:
  ```html
  <script type="application/json" data-brick>
  {
    "grid1": { "wire": { "master": true, "slave": [] } },
    "form1": { "wire": { "master": true, "slave": ["grid1"] } }
  }
  </script>
  ```
- Parsed objects land in `VanillaBrick.configs[id]` (shallow merge if repeated).

## Bootstrap flow
1) Load all `data-brick` JSON blocks into `VanillaBrick.configs`.
2) Scan `.vb` elements and create a brick for each.
3) If an element has an `id`, `VanillaBrick.configs[id]` is merged into the options passed to the brick.
4) `host` defaults to `brick`; `kind` comes from the element (`brick-kind` / `data-kind` / `data-brick-kind`) unless overridden in options.

## Priority of options
- Options passed explicitly to the constructor / bootstrap win over configs.
- Configs act as defaults only.

## Manual creation
- `new VanillaBrick.brick(opts)` uses only `opts`; it does **not** auto-load `data-brick` blocks. Populate `VanillaBrick.configs` yourself if you need that behaviour.

## CSP notes
- JSON blocks (`type="application/json"`) are non-executable and CSP-friendly.
- If configs come from `.js`, ensure they populate `VanillaBrick.configs` before bootstrap runs.

---
Previous: [Extensions](04-extensions.md) | Next: [Quick Start](06-quickstart.md)
