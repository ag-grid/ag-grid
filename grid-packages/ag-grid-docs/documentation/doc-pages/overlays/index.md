---
title: "Overlays"
---

There are two overlays built into the grid: Loading and No Rows.

## Loading Overlay

The grid property `loading` is used to manage the loading overlay.

<api-documentation source='grid-options/properties.json' section='overlays' names='["loading"]' config='{"overrideBottomMargin":"0"}'></api-documentation>
<api-documentation source='grid-api/api.json' section='overlays' names='["setLoading"]'></api-documentation>

<grid-example title='Overlays' name='overlays' type='mixed' options='{ "exampleHeight": 300 }'></grid-example>

### Initial Loading Overlay

With [Client-Side Row Model](/client-side-model/) if `rowData` is initially `null/undefined` the loading overlay will be displayed just once until any row data value is provided. If you do not want this initial behaviour initialise the grid with `loading=false`. 

## No Rows Overlay

The no rows overlay is automatically displayed when there are no rows in the Client-Side Row Model. You can manually override the display of the No Rows overlay via the grid api when loading is false.

<api-documentation source='grid-api/api.json' section='overlays' names='["showNoRowsOverlay"]' config='{"overrideBottomMargin":"0rem"}'></api-documentation>
<api-documentation source='grid-options/properties.json' section='overlays' names='["suppressNoRowsOverlay"]' config='{"overrideBottomMargin":"0"}'></api-documentation>

## Customising Overlays

If you're not happy with the provided overlay templates, you can provide your own in the following ways.

1. Provide a **plain HTML string** to the grid properties `overlayLoadingTemplate` and `overlayNoRowsTemplate`. 
1. Provide a custom component for the overlay - see [Overlay Component](/component-overlay/) for details.


## Example

The example below demonstrates how the loading overlay is shown automatically while the data is loading. You can also use the buttons to show / hide the different overlays at your will. 

The overlays are customised by providing custom HTML templates to `overlayLoadingTemplate` and `overlayNoRowsTemplate`.

<grid-example title='Overlays' name='overlays-template' type='mixed' options='{ "exampleHeight": 580 }'></grid-example>



<note>
|Overlays are only displayed by the grid when it is in Client-Side Row Model
|Overlays are not used when using [Row Models](../row-models/) other than the Client-Side Row Model. This is because data is
|loaded differently.
|
|The Loading overlay doesn't make sense as rows are loaded in sections. Access to the entire grid shouldn't
|be blocked as some rows will be loaded while others are loading.
|
|The No Rows overlay doesn't make sense as there could be rows on the server, but a filter could be applied
|that filters out all rows. This would be equivalent to the Client-Side Row Model and applying a filter to
|some data (no overlay would be shown, and a grid with a filter and no rows would be shown).
</note>