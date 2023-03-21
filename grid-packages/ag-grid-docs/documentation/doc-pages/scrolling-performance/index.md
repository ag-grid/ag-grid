---
title: "Scrolling Performance"
---

The grid is fast. However, the grid can also be configured and extended in many ways. This page explains how you can make the grid go faster.

[[only-react]]
| [[warning]]
| | ### **React Dev vs Prod Mode**
| |
| | React in Production Mode works faster than Dev Mode. Given the DOM complexity of the grid, React Production Mode will
| | allow the grid to perform optimally without any overhead introduced by Dev Mode. Performance testing should be 
| | performed in Production Mode only.
| |

## Setting Expectations

The grid can be as fast as demonstrated in the demo application [Demo Application](../../example). You can resize the demo application to the same size as the grid in your application by resizing the browser, then navigate around the grid (scroll, filter etc) and see how fast the demo grid is compared to your own implementation. If the demo grid is going faster, then there is room for performance improvements.

## Check Cell Renderers

The grid can be slowed down by custom [Cell Renderers](/component-cell-renderer/). To test this, remove all Cell Renderers from the grid and compare the speed again. If the grid does improve it's speed by removing Cell Renderers, introduce the Cell Renderers one by one to find out which ones are adding the most overhead.

[[only-react]]
|
| ## React or JavaScript Cell Renderers
|
| In the past we recommended writing Cell Renderers in JavaScript for best performance, as the grid rendering WAS written in plan JavaScript (i.e. it was not using React). However this guidance has changed as since v27 of the grid, the grid now uses React for it's rendering engine. As such, there is no real advantage between using JavaScript or React for your Cell Renderers.
|
| Given React and Plain JavaScript are different, you might wonder which one would be faster for your implementation. This is down to you, which one you prefer. The only thing we can say is we can't see why there would be a clear winner form the grid's point of view.

[[only-angular]]
| 
| ## Consider JavaScript Cell Renderers
|
| The grid's rendering uses AG Grid's own internal rendering engine which does not use Angular. As such, each time an Angular Cell Renderer is used, the grid switches context into an Angular application. This context switching can be time consuming when done multiple times (i.e. each cell).
|
| Consider using JavaScript Cell Renderers instead of Angular Cell Renderers to see if it makes your rendering faster.

[[only-vue]]
| 
| ## Consider JavaScript Cell Renderers
|
| The grid's rendering uses AG Grid's own internal rendering engine which does not use Vue. As such, each time a Vue Cell Renderer is used, the grid switches context into a Vue application. This context switching can be time consuming when done multiple times (i.e. each cell).
|
| Consider using JavaScript Cell Renderers instead of Vue Cell Renderers to see if it makes your rendering faster.

## If Possible, Avoid Cell Renderers

Cell Renders result in more DOM. More DOM means more CPU processing to render, regardless of what JavaScript / Framework is used to generate the DOM.

Ask the question, do you really need the Cell Renderer?

If you are only manipulating the value rather than creating complex DOM, would a [Value Getter](../value-getters/) or [Value Formatter](../value-formatters/) achieve what you want instead? Value Getters and Value Formatters do not result in more DOM.



## Avoid Auto Height

[Auto Height Rows](../row-height/#auto-row-height) is a great feature that we love. However it also creates more complex DOM inside each Cell.

If you are looking for ways to squeeze performance, consider turning this feature off. As with all suggestions here, it is paramount you profile your own application with this suggestion to see how much of a difference it makes and if the trade off is worth it for your application.

## Turn Off Animations

[Row Animation](../row-animation/) and [Column Animation](../column-moving/#moving-animation) make for a great user experience. However not all browsers are as good at animations as others. Consider checking the client's browser and turning off row and column animation for slower browsers.

## Configure Row Buffer

The `rowBuffer` property sets the number of rows the grid renders outside of the viewable area. The default is 10. For example, if your grid is showing 50 rows (as that's all the fits on your screen without scrolling), then the grid will actually render 70 in total (10 extra above and 10 extra below). Then when you scroll the grid will already have 10 rows ready waiting to show so the user will not see a redraw (not all browsers show the redraw, only the slower ones).

Setting a low row buffer will make initial draws of the grid faster (eg when data is first loaded, or after filtering, grouping etc). Setting a high row buffer will reduce the redraw visible vertically scrolling.

## Use Chrome (or Chrome Powered Browser)

The grid works fastest on Google Chrome. If you can, tell your users.

This includes Microsoft Edge, which is now powered by Chrome.

## Understand Data Updates

For fast changing data, consider using [Batch Update Transactions](/data-update-high-frequency/) which allows the grid to take very large amounts of updates without bringing the browser to a crawl. This is also demonstrated in the blog
[Streaming Updates in JavaScript Datagrids](https://medium.com/ag-grid/how-to-test-for-the-best-html5-grid-for-streaming-updates-53545bb9256a) that shows hundreds of thousands of updates per second.

## Debounce Vertical Scroll

By default, there is no debouncing of the vertical scroll. However on slow browsers, especially IE, depending on your application, you may wish to debounce the vertical scroll.

To debounce the vertical scroll, set grid property `debounceVerticalScrollbar=true`.

The example below demonstrates debouncing of the vertical scroll.

<grid-example title='Debounce Vertical Scroll' name='debounce-vertical-scroll' type='generated'></grid-example>
