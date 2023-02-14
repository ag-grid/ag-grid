---
title: "Treemap Series"
---

Treemap series is used to render hierarchical data structures or trees, where each node in the
tree is represented by a rectangle, and the value of a node by the area of its rectangle.

The bigger the value, the bigger the rectangle is relative to its siblings. Parent nodes
are represented by rectangles with areas that are the totals of their children.

If the nodes have no value, then their area is divided equally among siblings within their parent node.

The Ag Charts treemap series uses a popular "squarified" tiling algorithm which tries to keep
each node's rectangle as square as possible.

Treemap series would be a great fit for visualizing a directory structure (the original purpose of
the algorithm), components of a stock market index, shares of products within product categories,
or sales breakdown by city, state, and country. And these are just a few examples.

## Basic Configuration

`cartesian` and `polar` charts are used with linear data or, in other words, arrays.
Since treemaps are used to render tree data, to create a basic treemap, we need to use a `hierarchy` chart.

A basic treemap configuration would look like this:

```js
data, // the root node of the hierarchy
series: [{
    type: 'treemap',
    labelKey: 'label', // the name of the key to fetch the label value from
    sizeKey: 'size',   // the name of the key to fetch the value that will determine tile size
    colorKey: 'color', // the name of the key to fetch the value that will determine tile color
}]
```

The `data` should be a tree structure, where parent nodes use the `children` property to list their children:

```js
let data = {
    label: 'Root',
    children: [
        {
            label: 'Utilities',
            children: [{
                label: 'AWK',
                size: 252
            }]
        },
        ...
    ]
}
```

Notice, that only the leaf nodes of a tree are required to have the `sizeKey` property.
The size of the parent nodes will be automatically determined.

The `labelKey`, `sizeKey` and `colorKey` configs can be omitted, if the node objects in your data
happen to have the `label`, `size` and `color` fields.

[[note]]
| Any treemap series covers the whole series area of a chart, so it doesn't make sense to have more than
| a single treemap series in a chart, even though it's technically supported.

Let's take a look at how we can use the treemap series to render a snapshot of the S&P 500 stock market index.
Feel free to open this example in Plunker to enlarge the size of the component and notice how the treemap reveals more data as it grows bigger.

## Stock Market Index Example

<chart-example title='Stock Market Index' name='stock-market-index' type='generated'></chart-example>

## Alternative Configuration

Although not very common, treemaps can be used to show the hierarchy without emphasizing size.
In such a case, you can set the `sizeKey` to `undefined`. This will make all sibling tiles within
the same parent have the same area (but not necessarily the same shape).

The org chart example below takes advantage of that by using the following config:

```js
series: [{
    type: 'treemap',
    labelKey: 'orgHierarchy',
    sizeKey: undefined,  // make all siblings within a parent the same size
    colorKey: undefined, // use node depth value to determine the tile color
    groupFill: 'black',  // the color of group tiles, retrieved from data if `undefined`
    colorDomain: [0, 2, 4], // depth of 0 will correspond to 'red', 2 to 'green' and so on
    colorRange: ['red', 'green', 'blue'], // tiles with a depth of 1 will be a blend of 'red' and 'green'
    // change the color of a particular tile
    formatter: ({ datum, labelKey, highlighted }) => {
        if (datum[labelKey] === 'Joel Cooper') {
            return { fill: highlighted ? 'white' : 'orchid' };
        }
    },
}]
```

## Organizational Chart Example

<chart-example title='Organizational Chart' name='org-chart' type='generated'></chart-example>

## Understanding the Treemap colours

There are several ways to customise the colours of treemap tiles.

### Storing the colour values in the data

If treemap data nodes have fill colours assigned to them,
the property containing the colour should be specified in `colorKey`.

```js
series: [{
    type: 'treemap',
    colorKey: 'color',
    data: [{
        children: [
            { color: 'red' },
            { color: '#fa5310' },
        ],
    }],
}]
```

### Using the color scale

`colorKey` can also specify a property containing a numeric value.
In this case the `colorDomain` and `colorRange` should be provided.

```js
series: [{
    type: 'treemap',
    colorKey: 'color',
    colorDomain: [0, 10, 20],
    colorRange: ['red', 'yellow', 'green'],
    data: [{
        children: [
            { color: 5 },
            { color: 8 },
            { color: 12 },
        ],
    }],
}]
```

### Groups colours

The groups can be coloured in 2 ways:
- A static colour value can be specified in `groupFill` property.
- If `groupFill` can be set to `undefined`, the group colour behaviour will match the one for tiles.

```js
series: [{
    type: 'treemap',
    colorKey: 'color',
    groupFill: 'black',
    ...
    groupFill: undefined,
    data: [{
        color: 'black',
        children: [
            { color: 'white' },
            { color: 'red' },
            { color: 'white' },
        ],
    }],
}]
```

### Strokes

There are several properties to control the tiles' and groups' stroke colors and widths.

```js
series: [{
    type: 'treemap',
    tileStroke: 'black',
    tileStrokeWidth: 2,
    groupStroke: 'transparent',
    groupStrokeWidth: 0,
}]
```

### Labels colours and font styles

Since tiles can have different sizes depending on layout,
there is `large`, `medium` and `small` label configuration to match a specific size.
Tiles can also have separate `value` labels.
The styles for all of them can be specified like:

```js
series: [{
    type: 'treemap',
    labels: {
        large: {
            color: 'black',
            fontWeight: 'bold',
        },
        medium: {
            color: 'black',
        },
        small: {
            color: 'gray',
            fontSize: 8,
        },
        value: {
            formatter: ({ datum }) => `${datum.size * 100}%`,
            style: {
                color: 'orange',
            },
        },
    },
}]
```

In addition the groups' titles can have their own styles:

```js
series: [{
    type: 'treemap',
    title: {
        color: 'black',
        fontWeight: 'bold',
    },
    subtitle: {
        color: 'black',
        fontSize: 8,
    },
}]
```

### Overriding the styles for particular tiles

Use `formatter` function to change a colour for specific tiles.

```js
series: [{
    formatter: ({ datum, depth, labelKey, highlighted }) => {
        if (datum[labelKey] === 'Joel Cooper') {
            return { fill: highlighted ? 'white' : 'orchid' };
        }
    },
}]
```

Please see the API reference for more information.

## Complex Colouring Chart Example

<chart-example title='Complex Colouring Chart' name='custom-colors' type='generated'></chart-example>

## Tooltips

With no `tooltip` or `series[].tooltip` configuration, tooltip content will be taken from series
values:
- `series[].labelKey` will be displayed as tooltip title.
- `series[].labels.value.name` will be displayed as tooltip content.
- `series[].labels.value.key` will be displayed as additional tooltip content with a `: ` prefix to separate it from the previous content.
- `series[].labels.value.formatter` allows formatting of the additional tooltip content.

For more advanced configuration see the [Tooltips](../tooltips/) section.

## API Reference

<interface-documentation interfaceName='AgTreemapSeriesOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

## Next Up

Continue to the next section to learn about [combination charts](../combination-series/).
