---
title: "Angular Component using RxJs Example"
frameworks: ["angular"]
---

## With updated rows only supplied to the grid.

A simple example where the grid receives the initial data from a subscription, and updates via another.

In this example the grid only receives the updated rows and uses the [Transaction](/data-update/) method of row updates.

<grid-example title='RxJS - With updated rows only supplied to the grid' name='rxjs-row' type='angular' options='{ "showImportsDropdown": false, "exampleHeight": 435, "showResult": true }'></grid-example>

## With full data set supplied to the grid, with changed data within.

A simple example where the grid receives the initial data from a subscription, and updates via another.

In this example the grid only receives the the full row data via the 2nd subscription but makes uses of the [Immutable Data](/immutable-data/) method of row updates for improved performance.

<grid-example title='RxJS - With full data set supplied to the grid' name='rxjs-bulk' type='angular' options='{ "showImportsDropdown": false, "exampleHeight": 435, "showResult": true }'></grid-example>
