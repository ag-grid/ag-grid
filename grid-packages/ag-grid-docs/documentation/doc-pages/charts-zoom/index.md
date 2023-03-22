---
title: "Zoom"
---

AG Charts provides two methods of zooming, either by scrolling with the mouse wheel or selecting an area of the chart to zoom into.

To enable these features, first, install the zoom package:

```bash
$ npm install @ag-charts-enterprise/zoom
```

Then register the zoom module:

```ts
import { _ModuleSupport } from "@ag-charts-enterprise/core"
import { ZoomModule } from "@ag-charts-enterprise/zoom"

_ModuleSupport.registerModule(ZoomModule)
```

A user will now be able to use the zooming features as in the following example, including:

- Scroll in and out with the mouse wheel.
- Click and drag a box to select an area to zoom into.
- Press `alt` while clicking and dragging to pan around the zoomed in chart.

[Zoom Default Example](https://plnkr.co/edit/KznL1NS8lPEvtbba?open=main.js&preview)

## Axes

Zooming can be enabled for either the `x` or `y` axis, or for both at the same time with `xy` using the `zoom.axes` property.

In the example below, we enable zoom on only the `x` axis. This can be useful for charts displaying data over a long period of time.

```ts
zoom: {
    axes: 'x',
    ...
}
```

[Zoom Axes Example](https://plnkr.co/edit/0uBhpVmIrqvn5ABD?open=main.js&preview)

## Min x/y ratio

The `minXRatio` and `minYRatio` options can be used to limit how far a user can zoom in to the chart, helping to prevent them from getting lost in a blank space of the chart. These options are defined as the minimum proportion of the full chart that can be displayed.

The example below demonstrates setting both these properties to `0.4`, preventing the user from zooming beyond showing a minimum of 40% of the full chart.

```ts
zoom: {
    minXRatio: 0.4,
    minYRatio: 0.4,
    ...
}
```

[Zoom Min Ratio Example](https://plnkr.co/edit/Q3dfsaBlcbS0FzrR?open=main.js&preview)

## Pan key

While zoomed in to the chart, a user can pan around by holding down the `panKey` and clicking and dragging. This key defaults to `alt` but can be set to one of `alt`, `ctrl`, `shift` or `meta` (the command key on MacOS or start key on Windows).

```ts
zoom: {
    panKey: 'shift',
    ...
}
```

[Zoom Pan Key Example](https://plnkr.co/edit/CTWmJq8KzlJwGQxN?open=main.js&preview)

## Scrolling step

When scrolling the chart zooms in by a step for each movement of the scroll wheel or on the trackpad.

```ts
zoom: {
    scrollingStep: 0.4,
    ...
}
```

[Zoom Scrolling Step Example](https://plnkr.co/edit/Ld2LHkVCS7Q998FF?open=main.js&preview)

## Disabling panning / scrolling / selecting

You can enable and disable each feature of the zoom module separately if they are not appropriate for your chart. These can be toggled with the `enablePanning`, `enableScrolling` and `enableSelecting` options.

In the example below, we disable zooming through selecting a box. <!-- Since dragging is now only used to pan the chart, we can set the `panKey` to `false`. -->

```ts
zoom: {
    enablePanning: true,
    enableScrolling: true,
    enableSelecting: false,
    ...
}
```

[Zoom Disable Selecting Example](https://plnkr.co/edit/QjuAvu5fi8yCTbYQ?open=main.js&preview)

### API Reference

<!-- TODO: replace with usual api reference component -->

```ts
interface AgCartesianChartOptions {
  zoom?: AgZoomOptions
}

type AgZoomAxes = "x" | "y" | "xy"
type AgZoomPanKey = "alt" | "ctrl" | "meta" | "shift"

interface AgZoomOptions {
  axes?: AgZoomAxes
  enabled?: boolean
  enablePanning?: boolean
  enableScrolling?: boolean
  enableSelecting?: boolean
  minXRatio?: number
  minYRatio?: number
  panKey?: AgZoomPanKey
  scrollingStep?: number
}
```

<!-- <interface-documentation interfaceName='AgZoomOptions' config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation> -->

## Next Up

Continue to the next section to learn more about [overlays](/charts-overlays/).
