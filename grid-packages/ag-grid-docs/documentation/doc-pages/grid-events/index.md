---
title: "Grid Events"
---

This is a list of the events that the grid raises. You can register callbacks for these events through the `GridOptions` interface.

The name of the callback is constructed by prefixing the event name with `on`. For example, the callback for the `cellClicked` event is `gridOptions.onCellClicked`.

[[note]]
| TypeScript users can take advantage of the events' interfaces. You can construct the interface name by suffixing the event name with `Event`. For example, the `cellClicked` event uses the interface `CellClickedEvent`.

<api-documentation source='events.json'></api-documentation>