---
title: "Highlighting Changes"
---

This page concerns bringing the users attention to a cell.

[Flashing Cells](#flashing-cells) is a quick and easy way to highlight a cell.

[Animated Cells](/#animated-cells) highlight changed values in interesting ways.


## Flashing Cells

Set Column attribute `enableCellChangeFlash=true` to flash data changes on that Column.

Alternatively flash cells using the grid API `flashCells(params)`. The params takes a list of columns and rows to flash, the flashDelay and the fadeDelay values.

<api-documentation source='grid-api/api.json' section='refresh' names='["flashCells"]'></api-documentation>

Below note the following:

- All columns have `enableCellChangeFlash=true` so changes to the columns values will flash.
- Clicking **Update Some Data** will update a bunch of data. The grid will then flash the cells where data has changed.
- Clicking **Flash One Cell** provides the API `flashCells()` with one column and one row to flash one cell.
- Clicking **Flash Two Rows** provides the API `flashCells()` with two row nodes only to flash the two rows.
- Clicking **Flash Two Columns** provides the API `flashCells()` with two columns only to flash the two columns.

<grid-example title='Flashing Data Changes' name='flashing-data-changes' type='generated' options='{  }'></grid-example>

### How Flashing Works

Each time the call value is changed, the grid adds the CSS class `ag-cell-data-changed` for 500ms by default, and then then CSS class `ag-cell-data-changed-animation` for 1,000ms by default. The grid provided themes use this to apply a background color.

If you want to override the flash background color, this has to be done by overriding the relevant CSS class. There are two ways to change how long a cell remains "flashed".

1. Change the `cellFlashDelay` and `cellFadeDelay` configs in the gridOptions
1. When calling `flashCells()`, pass the `flashDelay` and `fadeDelay` values (in milliseconds) as params.

The example below demonstrates flashing delay changes. The following can be noted:


- The `cellFlashDelay` value has been changed to 2000ms, so cells will remain in their "flashed" state for 2 seconds.
- The `cellFadeDelay` value has been changed to 500ms, so the fading animation will happen faster than what it normally would (1 second).
- Clicking **Update Some Data** will update some data to demonstrate the changes mentioned above.
- Clicking **Flash Two Rows** will pass a custom `flashDelay` of 3000ms and a custom `fadeDelay` delay of 2000ms to demonstrate default values can be overridden.
- The example demonstrates how to change the default colour of the flash using the `--ag-value-change-value-highlight-background-color` CSS variable.

<grid-example title='Changing Flashing Delay' name='flashing-delay-changes' type='generated' options='{  }'></grid-example>

### Filtering & Aggregations

One exception to the above is changes due to filtering. If you are [Row Grouping](/grouping/) the data with [Aggregations](/aggregation/), then the aggregated values will change as filtering adds and removes rows contained within the groups. It typically doesn't make sense to flash these changes when it's due to a filter change, as filtering would impact many (possibly all) cells at once, thus not usefully bringing the users attention to any particular cell. If you do not like this exception and would like to flash changes even when it's the result of a filter change, then set grid property `allowShowChangeAfterFilter=true`.

## Animated Cells

Interesting animations for data changes can be achieved using [Cell Components](/component-cell-renderer/). You can create your own or use one of the provided Show Change Cell Components. The grid provides two such components out of the box:


1. **Animate Show Changed**: The previous value is temporarily shown beside the old value with a directional arrow showing increase or decrease in value. The old value is then faded out. Set with `cellRenderer="agAnimateShowChangeCellRenderer"`
2. **Animate Slide Cell**: The previous value shown in a faded fashion and slides, giving a ghosting effect as the old value fades and slides away. Set with `cellRenderer="agAnimateSlideCellRenderer"`.

The example below demonstrates these.

- Columns A, B are editable.
- Columns C and D are updated via clicking the button.
- Changes to any of the first 4 columns results in animations in the Total and Average column.
- The example demonstrates setting custom colours for up and down changes using the `--ag-value-change-delta-up-color` and `--ag-value-change-delta-down-color` CSS Variables.

<grid-example title='Animation Renderers' name='animation-renderers' type='generated' options='{ "exampleHeight": 530 }'></grid-example>
