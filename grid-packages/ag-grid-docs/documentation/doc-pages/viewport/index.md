---
title: "Viewport Row Model"
enterprise: true
---

A Viewport is a row model that allows showing a 'window' of data in your client. Typically all the data will reside on the server and the server will know what data is displayed in the client. This is again useful for the server to push changes out to the client as it knows what data is currently displayed.

[[note]]
| Don't use Viewport Row Model unless you understand what advantages it offers and whether or not you need them.<br/><br/>
| We find many of our users are using Viewport Row Model when they don't need to and end up with unnecessarily
| complicated applications as a result. We'd recommend taking a look at our most powerful row model, the
| [Server-Side Row Model](/server-side-model/), as an alternative.
| <br/><br/>
| The differences between row models can be found in our [row models summary page](/row-models/)

To enable the Viewport Row Model, set the grid property `rowModelType='viewport'`.

The term 'viewport' is a common term in GUIs used to describe the visible area when scrolls are used to display content that is larger than the visible area. In AG Grid, the viewport is referred to as the vertical scroll position, thus it defines the rows that are currently rendered by the grid.

AG Grid uses 'DOM row virtualisation' which means it only renders the rows you currently see, so AG Grid already uses the concept of a viewport for rendering the rows. The grid extends this concept and maps the viewport information to the Viewport Row Model.

Use a viewport to manage large live sets of data in the grid, where you only want to load a subset of the data into the grid and the data is updating at the source (typically a server), with the source sending updates to the grid when displayed data is changed.


The diagram below shows how the viewport maps to a connection to your dataset. The dataset connection knows what the viewport is displaying and sends data accordingly. When the user scrolls, the viewport will 'get' data from the source. If / when the data changes, the source will 'push' the data to the viewport if it knows the viewport is displaying that data.


<img src="resources/viewport.png" alt="Viewport Connected to Dataset"/>

<br/>

[[note]]
| It is the responsibility of the grid to display the data. It is the responsibility of the application
| (i.e. your code) to fetch the data, so if you are using WebSockets or otherwise, all of that coding
| belongs in the client code.

## Interface IViewportDatasource

To use the viewportRowModel you provide the grid with an implementation of `IViewportDatasource` to the property `viewportDatasource`:

<api-documentation source='grid-options/properties.json' section='viewportRowModel' names='["viewportDatasource"]'></api-documentation>

The grid will call the `init` method once, passing you a params object with the following methods. 

<interface-documentation interfaceName='IViewportDatasourceParams' ></interface-documentation>

## Example Sequence

Reading the interfaces will look confusing if you are looking at them for the first time as the different parts don't make sense individually, it's how they all work together that creates the magic. So to explain, the following is a sequence of what may happen.

1. You provide a new `viewportDatasource` to the grid. The grid will call `datasource.init()` and provide the callbacks the datasource needs. The datasource should store a reference to these callbacks and then make an asynchronous call to the server to find out how large the set of data is that needs to be displayed.

1. The datasource responds with the size of the data (e.g. 1,000 rows) and calls `params.setRowCount(1000)`. The grid responds by sizing the vertical scroll to fit 1,000 rows.

1. The grid, due to its physical size on the screen, works out it can display 20 rows at any given time. Given the scroll position is at the start, it calls `datasource.setViewportRange(0,19)` informing the datasource what data it needs. The grid will display blank rows for the moment.

1. The datasource will make an asynchronous call to the server asking for rows 0 to 19. Some time later the result will come back and the datasource will call `params.setRowData(map)` where the map will have 20 entries, the keys will be the strings (a JavaScript object only allows strings as object keys, not numbers) 0 to 19 and the values will be the row data.

1. The grid will refresh all the rows for 0 to 19 with the new data. At this point the current sequence is complete. The grid will remain static until either the user scrolls, or the datasource informs of a data change.

1. If for example the user scrolls down 100 rows, the sequence above partially repeats; the grid calls `datasource.setViewportRange(100,119)`, the datasource asynchronously responds with `params.setRowData(map)`.

[[note]]
| It is possible to prevent unwanted row redraws when `setRowCount: (count: number, keepRenderedRows?: boolean) => void` is invoked by supplying `keepRenderedRows = true`.

## Updating Data

If your data changes, you should get a reference to the node by calling `params.getRowData(rowIndex)` and then call ONE of the following:

- `rowNode.setData(newData)`: Call this to set the entire data into the node. The new data will be stored inside the `rowNode` replacing the old data. This will result in the grid removing the rendered row from the DOM and replacing with a new rendered row. If you have any custom `cellRenderers`, they will be destroyed and new ones created, so there is no way to achieve animation.

- `rowNode.setDataValue(colKey, newValue)`: Call this to set one value into the node. The new value will be stored inside the old data, leaving the rest of the data untouched. This will result in the grid refreshing only the cell that was updated. If the cell has a component with a refresh method, the refresh method will be called, allowing animation. If no refresh method is provided, the grid will remove the cell (and destroy the cell renderer if it exists) and create the cell again from scratch.

## Replacing Data

You may want to completely change data in the viewport, for example if you are showing 'latest 10 trades over 10k' which changes over time as to what the trades are, then you just call `setRowData(rowData)` again with the new data. The grid doesn't care how many times you call `setRowData(rowData)` with new data. You could alternatively call `rowNode.setData(data)` on the individual row nodes, it will have the same effect.

If you want to change the length of data (e.g. you apply a filter, or the result set otherwise grows or shrinks) then you call `setRowCount()` again. The grid doesn't care how many times you call `setRowCount()`.

## Sorting

Only server-side sorting is supported, so if you want sorting you have to do it yourself on the server. This is done by listening for the `sortChanged` event and then calling `setRowData(data)` with the new data when it arrives.

## Filtering

As with sorting, filtering also must be done on the server. To implement, listen for the `filterChanged` event and apply the filter to your server-side set of data. Then call `setRowCount()` and `setRowData(data)` to display the new data.

## Selection

Selection works with viewport. It is recommended that you implement `getRowId()` to give a unique key to each row. That way, should the same row appear again but in a different location, it will keep its selection value. See the example below for setting up `getRowId()`.

[[note]]
| Performing multiple row selections using 'shift-click' is only possible for rows that are available within the viewport.

## Grouping

And you guessed it, if you are doing grouping, you will need to implement this yourself on the server. If you group, you will need to provide your own `groupCellRenderer` that gives functionality to your own custom grouping. You will also need to manage how the grouping impacts the overall grid's set size yourself (i.e. if you expand a group, the number of rows increases, and likewise contracting will decrease).

## Viewport Settings

For simplicity, we stated earlier that the viewport was the rows the grid is currently displaying. This is _almost_ true except there are two properties, `viewportRowModelPageSize` and `viewportRowModelBufferSize`, to make the communication with the server better.

### viewportRowModelPageSize

It is not good to have the grid ask for rows one at a time if the user is scrolling slowly. To get around this, the grid defines a page size, so it will ask for rows in 'pages'. For example, if the pages size is 5, then the viewport will always start and end in numbers divisible by 5 such as 0 to 20 or 75 to 100. So if the user is scrolling slowly, the viewport will only be requested to get new rows after the grid hits 'the next five rows'. The default page size is `5`. To change this, set the grid property `viewportRowModelPageSize`.

### viewportRowModelBufferSize

In addition to the page size, the grid will also extend the viewport outside the viewable area by the buffer size. For example, if the viewport is showing rows 30 to 50, and the buffer is set to 5, the grid will request rows 25 to 55 from the viewport. This will reduce 'loading flicker' as the user scrolls through the data. The default buffer size is `5`. To change this, set the grid property `viewportRowModelBufferSize`.

## Example Viewport

The example below shows a viewport in action.

Two built-in cell renderers are used: `animateShowChange` (bid, mid and ask columns) and `animateSlide` (volume column). You may find these useful, however they are provided to demonstrate how one could achieve a change animation. You will probably want to provide your own custom animation cell renderer as how the animation happens will depend on your application, the type of data and frequency of change.

The example uses a `mockServer`. This is because all of the examples in this documentation work without any dependencies on any server. In your application, instead of using a mock server, you should connect to your real server. However the code in the `mockServer` example can be used to observe what your server code should be doing - it demonstrates keeping a connection open that is aware of the viewport position and pushes data to the client based on the viewport position.

<grid-example title='Viewport Example' name='viewport' type='generated' options='{ "enterprise": true, "modules":["viewport"] }'></grid-example>

## Example Viewport with Pagination

The example below is almost identical to the above example with the following differences:

- `pagination = true`: To enable pagination.
- `paginationAutoPageSize = true`: To set the pagination size to the height of the grid, so no vertical scrolls are used.
- `viewportRowModelPageSize = 1`: Because we are showing exact pages, the user will not be scrolling, so there is no need to set a minimum page size. Setting page size to `1` means the grid will always ask from the top row through to the bottom row.
- `viewportRowModelBufferSize = 0`: Likewise because there is no scrolling, there is no sense in bringing back extra rows to act as a buffer.

<grid-example title='Pagination Viewport Example' name='pagination-viewport' type='generated' options='{ "enterprise": true, "modules":["viewport"], "exampleHeight": 570 }'></grid-example>

