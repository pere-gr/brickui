# Quick Start

Clone the repo and open the demo HTML file:

```bash
git clone https://github.com/pere-gr/VanillaBrick.git
cd VanillaBrick
# open index.html in a browser
```

Minimal example (adapted from the demo):

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>VanillaBrick demo</title>
  <link rel="stylesheet" href="./demos/demo.css" />
  <script defer src="./dist/VanillaBrick.js"></script>
  <!-- Optional: your own script (set options, etc.) -->
  <script defer src="./demos/demo.js"></script>
</head>
<body>
  <h1>VanillaBrick demo</h1>
  <table id="grid1" class="vb vb-grid" brick-kind="grid">
    <thead></thead>
    <tbody></tbody>
  </table>
  <script type="application/json" data-brick>
  { "grid1": { "wire": { "master": true } } }
  </script>
</body>
</html>
```

What happens on load:
1. JSON configs in `data-brick` blocks are parsed into `VanillaBrick.configs`.
2. `.vb` elements are found and a `VanillaBrick.brick` is created for each.
3. Matching extensions (dom, store, grid, columns, rows, etc.) are applied.
4. `brick:status:ready` is fired.

Accessing the instance:
```js
const grid = VanillaBrick.base.getBrick('grid1');
grid.columns.sort('code');        // triggers store:data:sort
grid.store.set(newRowsArray);     // triggers store:data:set + re-render
```

---
Previous: [Configuration & Bootstrap](05-configuration.md) | Next: [Services & Nexus (planned)](07-services.md)
