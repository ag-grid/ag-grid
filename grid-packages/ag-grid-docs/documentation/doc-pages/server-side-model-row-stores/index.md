---
title: "SSRM Infinite Scroll"
enterprise: true
---

The Server-side Row Model (SSRM) can load rows on demand as the user scrolls down through rows. This technique is known as Infinite Scrolling.

To enable Infinite Scrolling for the SSRM, set the grid property `serverSideInfiniteScroll=true`.

Below shows a simple example using Infinite Store. Note the following:

- Infinite Scroll is on via property `serverSideInfiniteScroll=true`.
- Rows are loaded back 100 rows at a time. As the user scrolls down, more rows will be loaded. This can be observed in the dev console.

<grid-example title='Infinite Scroll' name='infinite-scroll' type='generated' options='{ "enterprise": true, "modules": ["serverside"] }'></grid-example>

## Infinite Scroll Restrictions

Infinite Scroll allows displaying a large amount of data by breaking it into blocks
and lazy loading the blocks as the users scrolls. However it comes with the following restrictions.

- **In Grid Sorting**
    Because data is read back in blocks from the Infinite Store, the grid cannot sort the data,
    as it does not have all the data loaded. All sorting must be done on the server
    as described in [Sorting](/server-side-model-sorting/).

- **In Grid Filtering**
    Because data is read back in blocks from the Infinite Store, the grid cannot filter the data,
    as it does not have all the data loaded. All filtering must be done on the server
    as described in [Filtering](/server-side-model-filtering/).

- **Updating Data**
    Updating data in the grid using [Transactions](/server-side-model-transactions/) is not supported
    by the Infinite Store.

    This is because applying updates would potentially move rows between blocks, which would not be possible
    if all blocks are not loaded.

- **Changing Data**
    If data on the server is changing with regards inserts and deletes, this will cause problems with the
    Infinite Store. This is because data is read back from the server in blocks.
    If the data is receiving updates or deletes, then what block a particual row should be in can change.
    For example consider the following scenario:

    1. The grid asks for rows 0 to 99 (i.e. first block of 100 rows) and these get read from a database.
    1. Another application inserts a row at index 50.
    1. The grid asks for rows 100 to 199 (the second block of 100 rows) and again these get read from the database.

    In this scenario the grid will have the last row in the first block appear again as the first row in the second
    block. This is because the row was at index 99 before the insert and then at index 100 after the insert.

    If data is changing such that row indexes will change and result in duplicate or missing rows across
    blocks, then it is best either avoid the Infinite Store or use a snapshot of data to prevent data updates.


## Infinite Scroll Usage

Use Infinite Scroll when all of the data will not comfortably fit inside the browsers memory.
For example a dataset with 10 million rows with no grouping applied would not fit inside a browsers memory, thus
Infinite Scrolling would be needed to view it.

Note that Infinite Scroll is not the only way to show large data inside the grid. It is possible to present big
data inside grid using SSRM and [Row Grouping](/server-side-model-grouping/). For example a dataset could have
10 million rows, however due to grouping only 200 rows are brought back at any group level - in this case
Infinite Scroll is not needed to show the large dataset.

Given the restrictions mentioned above, it is best to not use Infininte Scroll if it's not needed.

## Next Up

Continue to the next section to learn about [Row Grouping](/server-side-model-grouping/) of the SSRM.
