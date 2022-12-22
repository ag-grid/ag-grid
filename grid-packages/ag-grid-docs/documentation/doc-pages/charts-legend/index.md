---
title: "Legend"
---

A legend makes it easier to tell at a glance which series or series items correspond to which pieces of data. This section describes the legend options and layout behaviour.

## Position

A legend is shown by default but can be hidden using the `enabled` config:

```js
legend: {
    enabled: false
}
```

When enabled, it can be positioned to any side of a chart using the `position` config:

```js
legend: {
    position: 'right' // 'bottom', 'left', 'top'
}
```

### Example: Legend Position

Notice how when you click on one of the buttons in the example to change the position of the legend:

- the layout of the legend items also changes
- the layout of the chart changes as well, with series moving around and growing/shrinking slightly to accommodate the legend

<chart-example title='Legend Position' name='legend-position' type='generated'></chart-example>

## Orientation

The legend can have a `vertical` or `horizontal` orientation. The arrangement of legend items can be configured using the `legend.orientation` property.

### Vertical Orientation

In the `vertical` orientation, the legend items are arranged using the minimum number of columns possible given the current dimension constraints.

By default, when the legend is positioned to the `'right'` or `'left'` of a chart, it is rendered in a `vertical` orientation.
The number of columns in a `vertical` legend increases as the height of a chart shrinks, as less legend items can be placed in a given column.

### Example: Vertical Legend Layout

<chart-example title='Vertical Legend Layout' name='legend-layout-vertical' type='generated'></chart-example>

### Horizontal Layout

If the legend is `horizontal`, the legend items are arranged using the minimum possible number of rows. If the legend is not wide enough, the items are divided into more rows until everything fits.

By default, when the legend is positioned to the `'bottom'` or `'top'` of a chart, it is rendered in a `horizontal` orientation. The number of rows in a `horizontal` legend increases as the width of a chart shrinks, as less legend items can be placed in a given row.


### Example: Horizontal Legend Layout

<chart-example title='Horizontal Legend Layout' name='legend-layout-horizontal' type='generated'></chart-example>

## Constraints

The legend width and height can be constrained using the `legend.maxWidth` and `legend.maxHeight` properties.

By default, the legend width and height will be a percentage of the chart width and height depending on the legend's orientation.

In addition to `maxWidth` and `maxHeight`, the legend's layout is also affected by the amount of padding between the legend items. For example, `legend.item.paddingX` controls the amount of padding between adjacent horizontal legend items:

```js
legend: {
    item: {
        paddingX: 16
    }
}
```

`legend.item.paddingY` controls the amount of padding between adjacent vertical legend items:

```js
legend: {
    item: {
        paddingY: 8
    }
}
```

And the `legend.item.marker.padding` config is responsible for the amount of padding within a legend item, between the marker and the label:

```js
legend: {
    item: {
        marker: {
            padding: 8
        }
    }
}
```

Please refer to the example below to get a better idea of how the above configs affect the legend layout.

### Example: Legend Constraints

<chart-example title='Legend Constraints' name='legend-constraints' type='generated'></chart-example>

## Pagination

If the legend items don't fit within the contraints, the items will be paginated and the pagination component will be dislayed.

The pagination component can be customised using `legend.pagination`. For example, the pagination button markers can be made larger with `legend.pagination.marker`:

```js
legend: {
    pagination: {
        marker: {
            size: 18
        }
    }
}
```

`legend.pagination.activeStyle` and `legend.pagination.inactiveStyle` can be used to style the pagination buttons when in the active and inactive states.

```js
legend: {
    pagination: {
        activeStyle: {
            fill: 'blue',
            strokeWidth: 0,
        },
        inactiveStyle: {
            fillOpcacity: 0,
        }
    }
}
```

### Example: Legend Pagination

- Initially the legend is positioned at the bottom of the chart so by default, the legend is rendered in the `horizontal` orientation.
- `legend.maxHeight` is used to restrict the height of the legend, resulting in a single row of legend items spread across different pages.
- The pagination component appears automatically when the legend items combined with their configured padding do not fit in the given width and height constraints.
- `legend.pagination` is used to customise the styles of the pagination label and buttons.
- You can switch between different legend positions using the buttons above the chart to see how the legend pagination component behaves.

<chart-example title='Legend Pagination' name='legend-pagination' type='generated'></chart-example>

## Labels

There are a number of configs that affect the `fontSize`, `fontStyle`, `fontWeight`, `fontFamily`, and `color` of the legend item labels.

`maxLength` can also be configured to constrain the length of legend item labels, if the label text exceeds the maximum length, it will be truncated and an ellipsis will be appended.

```js
legend: {
    item: {
        label: {
            fontSize: 14,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontFamily: 'Papyrus',
            color: 'red',
            maxLength: 25
        }
    }
}
```

## Markers

### Size and StrokeWidth

All legend items use the same `size` and `strokeWidth`, regardless of the `size` and `strokeWidth` used by the series they represent. It's possible to adjust the defaults using the following configs:

```js
legend: {
    item: {
        marker: {
            size: 20,
            strokeWidth: 3
        }
    }
}
```

### Shape

Normally, the legend mirrors the marker shapes used by the series, unless the series in question doesn't support markers (for example `'column'` series), in which case the legend will use `'square'`.

It's also possible to override the default behaviour and make the legend use a specified marker shape for all legend items, regardless of the shapes the series are using:

```js
legend: {
    item: {
        marker: {
            shape: 'circle', // 'square', 'diamond', 'cross', 'plus', 'triangle'
        }
    }
}
```

## Legend Click Event - Series Toggling

By default, when a legend item is clicked, the visibility of the series associated with that legend item will be toggled. This allows the users to control which series are displayed in the chart by clicking on legend items.

To disable series toggling on legend item click, the `legend.seriesToggleEnabled` property can be set to `false`:

```js
legend: {
    seriesToggleEnabled: false
}
```

If a callback function is configured via `legend.listeners.legendItemClick`, it will still be invoked when the legend click event is fired:

```js
legend: {
    listeners: {
        legendItemClick: ({
            seriesId,
            itemId,
            enabled,
        }: AgChartLegendClickEvent) => {
            window.alert(
                `seriesId: ${seriesId}, itemId: ${itemId}, enabled: ${enabled}`
            );
        }
    }
}
```

<chart-example title='Legend Click' name='legend-click-series-toggle' type='generated'></chart-example>

## API Reference

<interface-documentation interfaceName='AgChartLegendOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

## Next Up

Continue to the next section to learn about the [series](../series-highlighting/).
