---
title: "Grid Size"
---

Under normal usage, your application should set the width and height of the grid using CSS styles. The grid will then fit the width you provide and use scrolling inside the grid to allow all rows and columns to be viewed.

[[only-javascript]]
| ```html
| <!-- set width using percentages -->
| <div id="myGrid" class="ag-theme-alpine" style="width: 100%; height: 100%;"></div>
|
| <!-- OR set width using fixed pixels -->
|<div id="myGrid" class="ag-theme-alpine" style="width: 500px; height: 200px;"></div>
| ```

[[only-angular]]
| ```html
| <!-- set width using percentages -->
| <div class="ag-theme-alpine">
|     <ag-grid-angular style="width: 100%; height: 100%;"></ag-grid-angular>
| </div>
|
| <!-- OR set width using fixed pixels -->
| <div class="ag-theme-alpine">
|     <ag-grid-angular style="width: 500px; height: 200px"></ag-grid-angular>
| </div>
| ```

[[only-react]]
| ```jsx
| <!-- set width using percentages -->
| <div class="ag-theme-alpine">
|     <AgGridReact style={{ width: '100%', height: '100%;' }} />
| </div>
|
| <!-- OR set width using fixed pixels -->
| <div class="ag-theme-alpine">
|     <AgGridReact style={{ width: 500, height: 200 }} />
| </div>
| ```

[[only-vue]]
| ```html
| <!-- set width using percentages -->
| <div class="ag-theme-alpine">
|     <ag-grid-vue style="width: 100%; height: 100%;"></ag-grid-vue>
| </div>
|
| <!-- OR set width using fixed pixels -->
| <div class="ag-theme-alpine">
|     <ag-grid-vue style="width: 500px; height: 200px"></ag-grid-vue>
| </div>
| ```

[[warning | Pitfall When Using Percent Width & Height]]
| If using % for your height, then make sure the container you are putting the grid into
| also has height specified, as the browser will fit the div according to a percentage of
| the parents height, and if the parent has no height, then this % will always be zero.
|
| If your grid is not the size you think it should be then put a border on the grid's
| div and see if that's the size you want (the grid will fill this div). If it is not the size
| you want, then you have a CSS layout issue in your application.

## Changing Width and Height

If the width and / or height change after the grid is initialised, the grid will automatically resize to fill the new area.

### Example: Setting and Changing Grid Width and Height

The example below shows setting the grid size and then changing it as the user selects the buttons.

<grid-example title='Width & Height' name='width-and-height' type='mixed'></grid-example>

## Grid Auto Height

Depending on your scenario, you may wish for the grid to auto-size it's height to the number of rows displayed inside the grid. This is useful if you have relatively few rows and don't want empty space between the last row and the bottom of the grid.

To allow the grid to auto-size it's height to fit rows, set grid property `domLayout='autoHeight'`.

When `domLayout='autoHeight'` then your application **should not** set height on the grid div, as the div should be allowed flow naturally to fit the grid contents. When auto height is off then your application **should** set height on the grid div, as the grid will fill the div you provide it.

[[warning | Don't use Grid Auto Height when displaying large numbers of rows]]
| If using Grid Auto Height, then the grid will render all rows
| into the DOM. This is different to normal operation where the grid will only render
| rows that are visible inside the grid's scrollable viewport. For large grids (eg >1,000
| rows) the draw time of the grid will be slow, or for very large grids, your application
| can freeze. This is not a problem with the grid, it is a limitation on browsers
| on how much data they can easily display on one web page. For this reason, if showing
| large amounts of data, it is not advisable to use Grid Auto Height. Instead use
| the grid as normal and the grid's row virtualisation will take care of this problem
| for you.

The example below demonstrates the autoHeight feature. Notice the following:

- As you set different numbers of rows into the grid, the grid will resize it's height to just fit the rows.
- As the grid height exceeds the height of the browser, you will need to use the browser vertical scroll to view data (or the iFrames scroll if you are looking at the example embedded below).
- The height will also adjust as you filter, to add and remove rows.
- If you have pinned rows, the grid will size to accommodate the pinned rows.
- Vertical scrolling will not happen, however horizontal scrolling, including pinned columns, will work as normal.
- It is possible to move the grid into and out of 'full height' mode by using the `api.setDomLayout()` or by changing the bound property `domLayout`.

[[note]]
| The following test is best viewed if you open it in a new tab, so it is obvious that there are no scroll bars.
| Note that if you use the example inlined the scroll bars shown are for the containing `iframe`, not the grid.

<grid-example title='Auto Height' name='auto-height' type='generated' options='{ "enterprise": true, "exampleHeight": 660, "noStyle": 1, "myGridReference": 1, "modules": ["clientside", "rowgrouping", "menu", "columnpanel"] }'></grid-example>

When using Auto Height, there is a minimum of 150px set to the grid rows section. This is to avoid an empty grid which would look weird. To remove this minimum height, add the following CSS:

```css
.ag-center-cols-clipper {
    min-height: unset !important;
}
```

## DOM Layout

There are three DOM Layout values the grid can have 'normal', 'autoHeight' and 'print'. They are used as follows:

- **normal**: This is the default if nothing is specified. The grid fits the width and height of the div you provide and scrolls in both directions.
- **autoHeight**: The grid's height is set to fit the number of rows so no vertical scrollbar is provided by the grid. The grid scrolls horizontally as normal.
- **print**: No scroll bars are used and the grid renders all rows and columns. This layout is explained in [Printing](/printing/).

## Min Height with Auto Height

There is a minimum height of 50px for displaying the rows for autoheight. This is for aesthetic purposes, in particular to allow room to show the 'no rows' message when no rows are in the grid otherwise this message would be overlaying on top of the header which does not look well.

It is not possible to specify a max height when using auto-height.

[[note]]
| Users ask is it possible to set a max height when using auto-height? The answer is no.
| If using auto-height, the grid is set up to work in a different way. It is not possible to switch.
| If you do need to switch, you will need to turn auto-height off.

## Resize with Parent Container

We can dynamically react to screen changes by making use of the grid API features. In this section we describe a few recommended approaches to resize the grid and show/hide columns based on screen size changes.

[[note]]
| These recipes below are suggestions - as the grid can be placed & positioned in your application in many ways and with many frameworks the suggestions below may not work out of the box in your particular application, but they should serve to help point you in the right direction.

### Inside Flexbox Container

By default, the grid runs a timer that watches its container size and resizes the UI accordingly. This might interfere with the default behavior of elements with `display: flex` set. The simple workaround is to add `overflow: hidden` to the grid element parent.

Open the example below in a new tab and resize the window to see how the grid instance gets resized accordingly.

For more information on how to work with flexbox, please visit: <a href="https://www.w3schools.com/css/css3_flexbox.asp" target="_blank">CSS Flexbox</a>

<grid-example title='Grid Inside a Flexbox Container' name='flexbox' type='generated'></grid-example>

### Inside CSS Grid Container

By default the grid watches its container size and resizes the UI accordingly. This might interfere with the default behavior of elements with `display: grid` set. The simple workaround is to add `overflow: hidden` to the grid element parent.

Open the example below in a new tab and resize the window to see how the grid instance gets resized accordingly.

For more information on how to work with the Grid Layout, please visit: <a href="https://www.w3schools.com/css/css_grid.asp" target="_blank">CSS Grid Layout</a>

<grid-example title='Grid Inside a CSS Grid Container' name='css-grid' type='generated'></grid-example>

### Dynamic Resizing with Horizontal Scroll

The quickest way to achieve a responsive grid is to set the grid's containing div to a percentage. With this simple change the grid will automatically resize based on the div size and columns that can't fit in the viewport will simply be hidden and available to the right via the scrollbar.

<grid-example title='Dynamic horizontal resizing with scroll' name='example' type='generated'></grid-example>

### Dynamic Resizing without Horizontal Scroll

Sometimes you want to have columns that don't fit in the current viewport to simply be hidden altogether with no horizontal scrollbar.

To achieve this determine the width of the grid and work out how many columns could fit in that space, hiding any that don't fit, constantly updating based on the `gridSizeChanged` event firing, like the next example shows.

This example is best seen when opened in a new tab - then change the horizontal size of the browser and watch as columns hide/show based on the current grid size.

<grid-example title='Dynamic horizontal resizing without scroll' name='example1' type='generated'></grid-example>

### Dynamic Vertical Resizing

Sometimes the vertical height of the grid is greater than the number of rows you have it in.  You can dynamically set the row heights to fill the available height as the following example shows:

<grid-example title='Dynamic vertical resizing' name='example2' type='generated'></grid-example>
