---
title: "Massive Row Count"
---

Given the grid uses [Row Virtualisation](/dom-virtualisation/#row-virtualisation) there is no
fixed limit to the number of rows the grid can display. However browsers do have a fixed limit
on how tall a DOM div element can be. Given the grid renders using the DOM, the div that contains
the rows has a fixed max height, and as such puts a limit on number of rows that can be
rendered using normal techniques.

To get around this, the grid uses a technique to fit more rows onto a div that can naturally fit.
This technique, unique to AG Grid, we call Stretching and is explained below.

## The Problem

Each browser has a limit to the maximum height of a div. This limit is not published so can differ
between different browsers as well as different browser versions. At the time of writing, on 
Chrome v89 the maximum height was 32,000,000 pixels.

The grid works out the maximum height of a div by testing the DOM as the grid initialises. To see what
the grid has determined as the maximum height for a div, set the grid property `debug=true`
and notice the logging output. One debugger statement will tell the maximum div height
like the following:

`AG Grid.RowContainerHeightService: maxDivHeight = 32000000`

For example assume each row is 100px high, then this means the maximum number of rows the grid
would be able to cater for with a max div height of 32,000,000 is 320,000.

Although the grid uses [Row Virtualisation](/dom-virtualisation/#row-virtualisation) to only render
a subset of rows, it depends on setting the container height correctly to fit all rows such that the
vertical scroll bar is able to scroll over the entire dataset.

If the grid needs to present more rows than is possible, then the grid does this using a technique
we call Stretching.

## Stretching the Div

In the example below, note that the row height is 100px and the max div height is 32,000,000px
(as per tested, however as previously mentioned different browsers had different max heights which
can be verified by looking at the grid debug output). This means in theory only 320,000 rows
can get displayed. The grid below is configured with 1,000,000 rows with each row 100px high to
show this in practice.

<grid-example title='Massive Dataset Example' name='viewport-big-data' type='generated' options='{ "enterprise": true, "modules": ["viewport"] }'></grid-example>

The grid achieves this by altering the vertical position of each row dependent on the scroll position.
How much each row position is altered by we call the Row Offset.

```ts
// see how many extra pixels we need to show all rows
const additionalPixelsNeeded = combinedRowHeight - maxDivHeight;

// see what % down we have vertically scrolled
const scrollPercent = scrollY / maxScrollY;

// we offset rows by by additionalPixelsNeeded times the scroll %
const rowOffset = scrollPercent * additionalPixelsNeeded;
```

So in the example above, when the vertical scroll is at the top, the Row Offset is 0. This can
be inspected using the DOM inspector for the grid and noting the row positions are normal, eg
Row Index 0 is at 0px and thus has CSS style `transform: translateY(0px)`, Row Index 1 is at 100px
and thus has CSS style `transform: translateY(100px)`.

As the vertical scroll is moved, the positions of the rows are adjusted by the calculated Row Offset.
The Row Offset increases linearly as the vertical scroll moves down, until the vertical scroll has
reached its maximum vertical scroll position. When the maximum vertical scroll position is reached,
the Row Offset is equal to the difference between the height needed and the available height.

In other words, when the rows do not fit, the grid applies an amplifier to the vertical scroll.
The grid does this by moving rows up as you scroll down, making the impression of the scrolling moving
faster, and allowing the grid to display more rows than would otherwise fit inside a div.

In the example, because the grid property `debug=true`, the grid prints a) what percentage the vertical
scrollbar has scrolled and b) the resultant Row Offset that is getting applied.

The example also displays in Column Expected Position what the row position would be if the grid
was not stretching rows.

## Considerations

When the grid is applying a Row Offset to fix more rows, the grid will appear to scroll faster.
For example if you use a scroll gesture on a scroll pad or use the mouse wheel to scroll down,
rows will move faster than normal. This is because as the grid scrolls down, it's repositioning
the rows up.

The scroll speed will increase at the same ratio as the additional row space required. For example
if twice the space is required, the rows will appear to move twice when scrolling. If x10
space is required, the rows will appear to move x10 when scrolling.

The faster scrolling is a side effect of the implementation to display massive amounts of rows.
There is no way around this, as the grid is working within the constraints of the browser and the
browser has a maximum height that a div can have.
If this makes your application not usable, then consider not displaying so many rows (question why
display millions of rows in the first place) or use [Pagination](/row-pagination/).
