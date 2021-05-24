---
title: "Scrolling Performance"
---

AG Grid is fast. However AG Grid can also be configured and extended in many ways.

Often people come to the AG Grid forum and ask 'why is the grid in my application not that fast?'.

This page explains how you can make the grid go faster.

## 1. Setting Expectations

AG Grid can be as fast as demonstrated in the demo application [Demo Application](../../example.php). You can resize the demo application to the same size as the grid in your application by resizing the browser, then navigate around the grid (scroll, filter etc) and see how fast the demo grid is compared to your own implementation. If the demo grid is going faster, then there is room for performance improvements.

## 2. Check Cell Renderers

AG Grid can be slowed down by your custom
[cell renderers](/component-cell-renderer/). To test this, remove all cell renderers from your grid and compare the speed again. If the grid does improve it's speed by removing cell renderers, try to introduce the cell renderers one by one to find out which ones are adding the most overhead.

## 3. Create Fast Cell Renderers

The fastest cell renderers have the following properties:

[[note]]
| The grid rendering is highly customised and plain JavaScript cell renderers will work faster than framework
| equivalents. It is still fine to use the framework version of AG Grid (eg for setting AG Grid properties etc)
| however because there are so many cells getting created and destroyed, the additional layer the frameworks
| add do not help performance. Plain JavaScript cell renderers should be considered if you are having performance
| concerns.

Not everyone needs blazing fast cell renderers (eg maybe you have users on fast machines with fast browsers, or maybe your grids have few columns) in which case framework cell renderers may work fine. The suggestion of not using frameworks for cells is only applicable when you are looking to squeeze performance gains.

[[note]]
| Using frameworks for cell renderers can be slower because of the large number of cells getting
| created and destroyed. Most of the time a cell will not have complex features in it, so using plain
| JavaScript should not be a problem. For all other components (filters, editors etc) using the frameworks
| won't make much noticeable difference as these components are not created and destroyed as often as
| cell renderers.

## 4. Turn Off Animations

Row and column animations make for a great user experience. However not all browsers are as good at animations as others. Consider checking the client's browser and turning off row and column animation for slower browsers.

## 5. Configure Row Buffer

The `rowBuffer` property sets the number of rows the grid renders outside of the viewable area. The default is 10. For example, if your grid is showing 50 rows (as that's all the fits on your screen without scrolling), then the grid will actually render 70 in total (10 extra above and 10 extra below). Then when you scroll the grid will already have 10 rows ready waiting to show so the user will not see a redraw (not all browsers show the redraw, only the slower ones).

Setting a low row buffer will make initial draws of the grid faster (eg when data is first loaded, or after filtering, grouping etc). Setting a high row buffer will reduce the redraw visible vertically scrolling.

## 6. Use Chrome

The grid works fastest on Google Chrome. If you can, tell your users.

## 7. Understand Data Updates

For fast changing data, consider using [Batch Update Transactions](/data-update-high-frequency/) which allows the grid to take very large amounts of updates without bringing the browser to a crawl. This is also demonstrated in the blog
[Streaming Updates in JavaScript Datagrids](https://medium.com/ag-grid/how-to-test-for-the-best-html5-grid-for-streaming-updates-53545bb9256a) that shows hundreds of thousands of updates per second.

## 8. Debounce Vertical Scroll

By default, there is no debouncing of the vertical scroll. However on slow browsers, especially IE, depending on your application, you may wish to debounce the vertical scroll.

To debounce the vertical scroll, set grid property `debounceVerticalScrollbar=true`.

The example below demonstrates debouncing of the vertical scroll.

<grid-example title='Debounce Vertical Scroll' name='debounce-vertical-scroll' type='generated'></grid-example>

[[only-javascript]]
| ## 9. See Also
|
|Read the article [8 Performance Hacks for JavaScript](/8-performance-hacks-for-javascript/) so you know what the grid is doing, that way you will be able to reason with it.