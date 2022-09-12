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
type: 'hierarchy',
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
    colorParents: true,  // assign color to parent tiles based on their depth too (not just leaf tiles)
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

## API Reference

<interface-documentation interfaceName='AgTreemapSeriesOptions' overridesrc="charts-api/api.json" config='{ "showSnippets": false }'></interface-documentation>

## Next Up

Continue to the next section to learn about [combination charts](../combination-series/).
