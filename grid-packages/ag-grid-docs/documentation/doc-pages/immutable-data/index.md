---
title: "Client-Side Data - Immutable Data"
---

Immutable Data, along with the `immutableData` property, is no longer something exposed in the grid. This page explains why we not longer have this property and what to do instead.

In versions of AG Grid prior to v17.0.0, there was a property `immutableData` which when set to `true`, got the grid to treat changes to Row Data as if the data was coming from an immutable store. The grid would use `getRowNodeId()` to get ID's for the rows, and then use object comparison to see if the row had changed, and hence needed to be updated.

This was a "gotcha" for most developers, as it was not intuitive you had to turn Immutable Data on.

It was also a property we found poorly named.

Instead we have now changed `getRowNodeId()` to be called [getRowId()](/row-ids/), and when `getRowId()` is implemented, `immutableData=true` is set behind the scenes.

So going forward, if you want the old Immutable Data behaviour, just provide a `getRowId()` callback.

`getRowNodeId()` is now deprecated. If you want this old behaviour (i.e. getRowId() but without Immutable Data) then set the grid property `resetRowDataOnUpdate=true`.
