---
title: "Client-Side Data - Immutable Data"
---

Immutable Data, along with the `immutableData` property, is no longer something exposed in the grid.

Since v17 of AG Grid, if you want Immutable Data behaviour, then implement `getRowId()`, as this will
turn on Immutable Data in the background.
