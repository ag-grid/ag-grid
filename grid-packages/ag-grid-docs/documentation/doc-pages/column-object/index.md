---
title: "Column Object"
---

A `Column` object represents a column in the grid. The `Column` will contain a reference to the column definition your application provided as well as other column runtime information. The column contains methods and emits events.

<api-documentation source='reference.json'></api-documentation>

All events fired by the column are synchronous (events are normally asynchronous). The grid is also listening for these events internally. This means that when you receive an event, the grid may still have some work to do (e.g. if sort has changed, the grid UI may still have to do the sorting). It is best that you do not call any grid API functions while receiving events from the column (as the grid is still processing), but instead put your logic into a timeout and call the grid in another VM tick.

When adding event listeners to a column, they will stay with the column until the column is destroyed. Columns are destroyed when you add new columns to the grid. Column objects are NOT destroyed when the columns is removed from the DOM (e.g. column virtualisation removes the column due to horizontal scrolling, or the column is made invisible via the column API).

If you add listeners to columns in custom header components, be sure to remove the listener when the header component is destroyed.

```js
// add visibility listener to 'country' column
const listener = event => console.log('Column visibility changed', event);

const column = columnApi.getColumn('country');
column.addEventListener('visibleChanged', listener);

// sometime later, remove the listener
column.removeEventListener('visibleChanged', listener);
```
