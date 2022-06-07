---
title: "SSRM Configuration"
enterprise: true
---

This section covers the Server-Side Row Model (SSRM) configuration options.

## SSRM Grid Properties

Applications can fine-tune the Server-Side Row Model based on specific application requirements using the following configurations:

<api-documentation source='grid-options/properties.json' section='serverSideRowModel'></api-documentation>

## Debug Info

When experimenting with different configurations it is useful to enable debug mode as follows:

<snippet>
const gridOptions = {
    debug: true
}
</snippet>

The screenshot below is taken from the browser's dev console when `debug` is enabled:

<image-caption src="debug.png" constrained="true" alt="Console Output"></image-caption>

Notice that the current cache status is logged showing block details such as the `startRow` and `endRow`.

This can be very useful when debugging issues on the server.

## Custom Infinite Scrolling

The example below shows a customised SSRM using Infinite Scrolling. Note the following:

- The grid property `serverSideInfiniteScrolling = true`, which gets the Infinite Store to be used. The grid loads rows one block at a time as the user scrolls down.

- The grid property `cacheBlockSize = 50`. This sets the block size to 50, thus rows are read back 50 at a time.

- The grid property `maxBlocksInCache = 2`. This means the grid will keep two blocks in memory only. To see this in action, scroll past row 100 (which will require a third block to be loaded), then quickly scroll back to the start and you will observe the first block needs to be reloaded.

- The grid property `rowBuffer = 0`. This means the grid will not render any rows outside the vertical scroll. This is good for demonstrating this example, as otherwise the loading could appear outside of the visible area and make the example more difficult to understand. See [DOM Virtualisation](/dom-virtualisation/) for more information on setting the `rowBuffer` property.

<grid-example title='Custom Partial' name='custom-infinite' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Custom Loading Debounce

The example below demonstrates debouncing the block loading. Note the following:

- The response from the server sets the `rowCount` property so that the vertical scrollbars bounds are set such that the entire dataset can be scrolled through. In other words, Infinite Scrolling is turned off, however rows are still loaded in blocks.

- `blockLoadDebounceMillis = 1000` - loading of blocks is delayed by `1000ms`. This allows for skipping over blocks when scrolling to advanced positions.

- The grid property `debug = true`. This means the browser's dev console will show loading block details.

<grid-example title='Block Loading Debounce' name='block-load-debounce' type='generated' options='{ "enterprise": true, "modules": ["serverside", "menu", "columnpanel"] }'></grid-example>

## Next Up

Continue to the next section to learn about [Sorting](/server-side-model-sorting/).


