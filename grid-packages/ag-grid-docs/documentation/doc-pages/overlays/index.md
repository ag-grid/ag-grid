---
title: "Overlays"
---

At present, there are two overlays for the grid. These are displayed in the following situations when using the [Client-Side Row Model](/client-side-model/):

- **Loading**: Gets displayed when the grid is loading data or waiting for column definitions.
- **No Rows**: Gets displayed when loading has completed but there are no rows to show.

The grid manages showing and hiding of the overlays for you. When the table is first initialised, the loading overlay is displayed if `rowData` or `columnDefs` are set to `null` or `undefined`. When these options are updated, or `rowData` / `columnDefs` are set via `api.setGridOption` or `api.updateGridOptions`, the loading overlay is hidden.

<note>
|Overlays are generally not used when using [Row Models](../row-models/) other than the Client-Side Row Model. This is because data is
|loaded differently.
|
|The Loading overlay doesn't make sense as rows are loaded in sections. Access to the entire grid shouldn't
|be blocked as some rows will be loaded while others are loading. There is an exception to this when column definitions are not loaded.
|In this case, the loading overlay will be displayed until the columns are loaded.
|
|The No Rows overlay doesn't make sense as there could be rows on the server, but a filter could be applied
|that filters out all rows. This would be equivalent to using the Client-Side Row Model and applying a filter to
|some data (no overlay would be shown, and a grid with a filter and no rows would be shown).
</note>

## Overlay API

At any point, you can show or hide any of the overlays using the methods below. You may never need to use these methods, as the grid manages the overlays for you. However you may find some edge cases where you need complete control (such as showing 'loading' if an option outside the grid is changed).

<api-documentation source='grid-api/api.json' section='overlays' config='{"overrideBottomMargin":"1rem"}'></api-documentation>

The overlays are mutually exclusive, you cannot show more than one overlay at any given time.

## Custom Overlays

If you're not happy with the provided overlay templates, you can provide your own in the following two ways.

1. Provide a **plain HTML string** to the grid properties `overlayLoadingTemplate` and `overlayNoRowsTemplate`. 
1. Provide a custom component for the overlay - see [Overlay Component](/component-overlay/) for details.


## Example

The example below demonstrates how the loading overlay is shown automatically while the data is loading. You can also use the buttons to show / hide the different overlays at your will. 

The overlays are customised by providing custom HTML templates to `overlayLoadingTemplate` and `overlayNoRowsTemplate`.

<grid-example title='Overlays' name='overlays' type='mixed' options='{ "exampleHeight": 350 }'></grid-example>



