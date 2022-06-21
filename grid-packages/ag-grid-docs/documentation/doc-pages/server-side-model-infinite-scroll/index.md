---
title: "SSRM Infinite Scroll"
enterprise: true
---

The Server-side Row Model (SSRM) can load rows on demand as the user scrolls down through the rows in the grid using 
an [Infinite Scrolling](https://en.wiktionary.org/wiki/infinite_scroll) technique.

Infinite Scroll is useful when there is too much data to be retrieved in a single request from the server. 

[[note]]
| Note that it is still possible to present large amounts of data inside grid when [Row Grouping](/server-side-model-grouping/) is applied. For example a dataset could have 10 million rows, but only 200 rows are required at any group level - in this case Infinite Scroll is not needed to show the large dataset.

## Enabling Infinite Scroll

To enable Infinite Scroll in the SSRM, set the grid property `serverSideInfiniteScroll=true`.

The example below demonstrates Infinite Scroll in the SSRM. Note the following:

- Infinite Scroll is enabled via the property `serverSideInfiniteScroll=true`.
- 100 rows are loaded at a time as the user scrolls down through the grid.

<grid-example title='Enabling Infinite Scroll' name='infinite-scroll' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Configuring Infinite Scroll

It is useful to understand how the grid organises data into caches for Infinite Scrolling as many of the 
[Configurations](/server-side-model-configuration/) are expressed in terms of the Server-Side Cache such as
`cacheBlockSize` and `maxBlocksInCache`.

The grid arranges rows into blocks which are in turn stored in a cache. There is a cache containing the top-level rows
(i.e. on the root node) and for each individual [Row Grouping](/server-side-model-row-grouping/) level. When the grid 
initialises, it will retrieve an initial number (as per configuration) of blocks containing rows. As the user scrolls down,
more blocks will be loaded.

<div style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
    <img src="resources/serverSideCache.png" alt="serverSideCache" style="width: 30%;" />
    <div>Fig 1. Server-side Cache</div>
</div>

The example below demonstrates some configurations that are specific to Infinite Scroll. Note the following:

- The grid property `serverSideInfiniteScrolling = true`, which turns on Infinite Scrolling. The grid loads rows one block at a time as the user scrolls down.
- The grid property `cacheBlockSize = 50`. This sets the block size to 50, thus rows are read back 50 at a time.
- The grid property `maxBlocksInCache = 2`. This means the grid will keep two blocks in memory only. To see this in action, scroll past row 100 (which will require a third block to be loaded), then quickly scroll back to the start and you will observe the first block needs to be reloaded.

<grid-example title='Configuring Infinite Scroll' name='configuring-infinite-scroll' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Block Loading Debounce

It may be desirable to scroll through the entire dataset without the need for intermediate blocks to be loaded. 

The example below shows how debouncing block loading can be achieved. Note the following:

- The response from the server sets the `rowCount` property so that the vertical scrollbars bounds are set such that the entire dataset can be scrolled through. In other words, Infinite Scrolling is turned off, however rows are still loaded in blocks.

- `blockLoadDebounceMillis = 1000` - loading of blocks is delayed by `1000ms`. This allows for skipping over blocks when scrolling to advanced positions.

- The grid property `debug = true`. This means the browser's dev console will show loading block details.

<grid-example title='Block Loading Debounce' name='block-load-debounce' type='generated' options='{ "enterprise": true, "modules": ["serverside", "menu", "columnpanel"] }'></grid-example>

## Debugging Infinite Scroll

When experimenting with different Infinite Scroll [Configurations](/server-side-model-configuration/) it can useful to 
enable debug mode as follows:

<snippet>
const gridOptions = {
    debug: true
}
</snippet>

The screenshot below is taken from the browser's dev console when `debug` is enabled:

<image-caption src="debug.png" constrained="true" alt="Console Output"></image-caption>

Notice that the current cache status is logged showing block details such as the `startRow` and `endRow`.

This can be very useful when debugging issues on the server.

## Infinite Scroll Restrictions

Infinite Scroll allows displaying a large amount of data by breaking it into blocks
and lazy loading the blocks as the users scrolls. However, it comes with the following restrictions.

- **In Grid Sorting**
    Because data is read back in blocks, the grid cannot sort the data,
    as it does not have all the data loaded. All sorting must be done on the server
    as described in [Sorting](/server-side-model-sorting/).

- **In Grid Filtering**
    Because data is read back in blocks, the grid cannot filter the data,
    as it does not have all the data loaded. All filtering must be done on the server
    as described in [Filtering](/server-side-model-filtering/).

- **Updating Data**
    Updating data in the grid using [Transactions](/server-side-model-transactions/) is not supported
    when Infinite Scrolling.

    This is because applying updates would potentially move rows between blocks, which would not be possible
    if all blocks are not loaded.

- **Changing Data**
    If data on the server is changing with regards inserts and deletes, this will cause problems with the
    Infinite Scroll. This is because data is read back from the server in blocks.
    If the data is receiving updates or deletes, then what block a particual row should be in can change.
    For example consider the following scenario:

    1. The grid asks for rows 0 to 99 (i.e. first block of 100 rows) and these get read from a database.
    1. Another application inserts a row at index 50.
    1. The grid asks for rows 100 to 199 (the second block of 100 rows) and again these get read from the database.

    In this scenario the grid will have the last row in the first block appear again as the first row in the second
    block. This is because the row was at index 99 before the insert and then at index 100 after the insert.

    If data is changing such that row indexes will change and result in duplicate or missing rows across
    blocks, then it is best either avoid Infinite Scrolling or use a snapshot of data to prevent data updates.

## Next Up

Continue to the next section to learn about [SSRM Row Grouping](/server-side-model-grouping/).
