---
title: "DOM Virtualisation"
---

The grid uses DOM virtualistaion to vastly improve rendering performance.

If you loaded 1,000 records with 20 columns into the browser without using a datagrid (eg using 'table', 'tr' and 'td' tags), then the page would end up with a lot of rendered DOM elements. This would drastically slow down the web page. This results in either a very poor user experience, or simply crashing the browser as the browser runs out of memory.

To get around this, the grid only renders what you see on the screen. For example if you load 1,000 records and 20 columns into the grid, but the user can only see 50 records and 10 columns (as the rest are not scrolled into view), then the grid only renders the 50 rows and 10 columns that the user can actually see.

As the user scrolls horizontally or vertically, the grid dynamically updates the DOM and renders the additional cells that are required while also removing the cells that are no longer in view.

This technique of only rendering into the DOM what is in the visible scrollable viewport is known as row and column virtualisation.

## Inspect the DOM

To observe row and column virtualisation, you are invited to inspect the DOM of the grid using the browsers developer tools and notice row rows and column DOM elements (i.e. the 'div' elements) get inserted and removed as the grid scrolls.

## Row Buffer

By default the grid will render 10 rows before the first visible row and 10 rows after the last visible row, thus 20 additional rows get rendered. This is to act as a buffer as on some slower machines and browsers, a blank space can be seen as the user scrolls.

To change the row buffer, set grid property `rowBuffer` to the number of rows you would like to render in addition to the visible rows. Set `rowBuffer=0` to turn off row buffering.

The Row Buffer value is used to create a Pixel Range based on the row buffer value multiplied by the Default Row Height. For example if you were to set `rowBuffer=10` and the default row height is 42px (for the Alpine theme), the grid will extend the vertical pixel range by 420px in both directions and then draw rows into that. 

This detail is important when using dynamic and auto row height as depending on the actual row height a different number of rows can fit inside the pixel range as its height is based on the default row height. 

For example, as described above, if `rowBuffer=10`, the grid will use a vertical pixel range of 420px in both directions. However, if you’re setting custom row height, or auto-height is setting a row height of 100px (instead of the default 42px), each of these two 420px pixel ranges above and below the grid will only fit 5 of these 100px rows, instead of 10 rows with default height of 42px.

## Max Rendered Rows

As a safety measure, the grid will render a maximum of 500 rows. This is to stop applications
from crashing if they incorrectly set the grid size. For example if the grid height is not set correctly,
and the grid tries to render 10,000 rows, this can crash the browser. To remove
this restriction set the property `suppressMaxRenderedRowRestriction=true`.


## Column Virtualisation

Column virtualisation is the insertion and removal of columns as the grid scrolls horizontally.

There is no column buffer - no additional columns are rendered apart from the visible set. This is because horizontal scrolling is not as CPU intensive as vertical scrolling, thus the buffer is not needed for a good UI experience.

## Suppress Virtualisation

To turn off Column Virtualisation set the grid property `suppressColumnVirtualisation=true`. To turn off Row Virtualisation set the grid property `suppressRowVirtualisation=true`.

Note if `suppressRowVirtualisation=true`, then there is no Row Buffer and the `rowBuffer` property is ignored.

The example below demonstrates these two properties. Note that each Cell uses a Value Formatter that prints to the console when it is used, which equates to each time a Cell is created. Note that it is called 900 times when the grid starts, as there are 900 Cells of data (9 Columns x 100 Rows). If you were to edit this example, and remove `suppressColumnVirtualisation` and `suppressRowVirtualisation`, you would observe the Cells getting created as the grid is scrolled.

<grid-example title='Suppress Virtualisation' name='suppress-virtualisation' type='generated'></grid-example>



