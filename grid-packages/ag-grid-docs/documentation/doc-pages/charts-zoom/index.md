---
title: "Zoom"
enterprise: true
---

AG Charts provides two methods of zooming, either by scrolling with the mouse wheel or selecting an area of the chart to zoom into.

To enable these features, set `zoom.enabled` to `true`.

```ts
zoom: {
    enabled: true,
}
```

A user will now be able to use the zooming features as in the following example, including:

- Scroll in and out with the mouse wheel.
- Clicking and dragging to pan around the zoomed in chart.
- Double click anywhere to reset the zoom.
- Click and drag a box to select an area to zoom into (not enabled by default).

<chart-example title='Zoom' name='zoom' type='generated'></chart-example>

## Enabling and Disabling Features

You can enable and disable each feature of the zoom module separately if they are not appropriate for your chart. These can be toggled with the `enablePanning`, `enableScrolling` and `enableSelecting` options.

In the example below, we only enable selecting an area.

```ts
zoom: {
    enablePanning: false,
    enableScrolling: false,
    enableSelecting: true,
}
```

<chart-example title='Zoom Enabling and Disabling Features' name='zoom-selecting' type='generated'></chart-example>

## Axes

Zooming can be enabled for either the `x` or `y` axis, or for both at the same time with `xy` using the `axes` property. By default, zooming is only enabled on the `x` axis.

In the example below, we enable zoom on the `y` axis.

```ts
zoom: {
    axes: 'y',
}
```

<chart-example title='Zoom Axes' name='zoom-axes' type='generated'></chart-example>

## Scrolling Pivot

By default, the chart will zoom while keeping the right side of the x-axis pinned. You can change this pivot point with the `scrollingPivot` property, setting it one of:

- `end` (default), the right or top of the chart when scrolling on the x or y axis respectively,
- `start`, the left or bottom of the chart when scrolling on the x or y axis respectively,
- `pointer`, keep the mouse pointer above the same position on the chart when zooming.

In the example below, we set pivoting to about the pointer.

```ts
zoom: {
    scrollingPivot: 'pointer',
}
```

<chart-example title='Zoom Scrolling Pivot' name='zoom-scrolling-pivot' type='generated'></chart-example>

## Scrolling Step

When scrolling the chart zooms in by a step for each movement of the scroll wheel or on the trackpad. By default `scrollingStep` is set to `0.1`, or 10% of the chart at a time.

In the example below, we change the step to `0.4`.

```ts
zoom: {
    scrollingStep: 0.4,
}
```

<chart-example title='Zoom Scrolling Step' name='zoom-scrolling-step' type='generated'></chart-example>

## Min X/Y Ratio

The `minXRatio` and `minYRatio` options can be used to limit how far a user can zoom in to the chart, helping to prevent them from getting lost in a blank space of the chart. These options are defined as the minimum proportion of the full chart that can be displayed. The default for both values is `0.2`.

The example below demonstrates setting both these properties to `0.4`, preventing the user from zooming beyond showing a minimum of 40% of the full chart.

```ts
zoom: {
    minXRatio: 0.4,
    minYRatio: 0.4,
}
```

<chart-example title='Zoom Min Ratio' name='zoom-min-ratio' type='generated'></chart-example>

## Pan Key

While zoomed in to the chart, a user can pan around by clicking and dragging.

If you have enabled selecting an area to zoom as well using `enableSelecting: true`, clicking and dragging will no longer pan by default. Instead the user will need to hold down a key to switch to panning mode.

This key defaults to `alt` but can be set on the `panKey` property to one of `alt`, `ctrl`, `shift` or `meta` (the command key on MacOS or start key on Windows).

```ts
zoom: {
    panKey: 'shift',
}
```

<chart-example title='Zoom Pan Key' name='zoom-pan-key' type='generated'></chart-example>

## Context Menu

When both the zoom and context menu are enabled, additional zoom actions are added into the context menu for zooming and panning to the clicked location.

<chart-example title='Zoom Context Menu' name='zoom-context-menu' type='generated'></chart-example>

## API Reference

<!-- TODO: replace with usual api reference component -->

```ts
interface AgCartesianChartOptions {
  zoom?: AgZoomOptions
}

type AgZoomAxes = "x" | "y" | "xy"
type AgZoomPanKey = "alt" | "ctrl" | "meta" | "shift"
type AgZoomScrollingPivot = "pointer" | "start" | "end"

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
  scrollingPivot?: AgZoomScrollingPivot
}
```

<!-- <interface-documentation interfaceName='AgZoomOptions' config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation> -->
