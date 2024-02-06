---
title: "Custom Group Cell Component"
enterprise: true
---

The example below demonstrates how to implement a simple custom group cell renderer.

- The example has a custom icon which represents whether the group is open
- Reacts to the row events if the group is expanded from another source
- Cleans up event listeners when it's disposed of

<grid-example title='Group Renderers' name='custom-group-renderer' type='mixed' options='{"enterprise": true, "modules": ["clientside", "rowgrouping"]}'></grid-example>
