# Contracts & Conventions

## Event naming
Events **must** have 3 segments: `namespace:type:target`.

| Segment       | Description            | Rules                                |
|---------------|------------------------|--------------------------------------|
| Namespace     | Domain/owner of event  | Required, lowercase, no `*`          |
| Type          | Verb/action            | Required, lowercase, no `*`          |
| Target        | Specific instance      | Required, no `*` when firing; wildcards allowed in listeners |

Invalid: `my:event` (too short), `grid:cell:click:row:1` (too long).  
Valid: `grid:click:cell-1`.

## Reserved events
| Event                   | When                                              |
|-------------------------|---------------------------------------------------|
| `brick:status:ready`    | After brick is initialized and extensions applied |
| `brick:status:destroyed`| Just before brick is dismantled                   |

## Lifecycle phases
1. **`before`**: Validate/cancel (`ev.cancel = true`), prepare data.
2. **`on`**: Core action (skipped if canceled).
3. **`after`**: Cleanup, logging, UI updates reacting to the change.

---
Previous: [Architecture & Core Controllers](02-architecture.md) | Next: [Extensions](04-extensions.md)
