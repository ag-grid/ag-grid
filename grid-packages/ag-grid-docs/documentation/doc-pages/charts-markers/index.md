---
title: "Markers"
---

Data points in `line`, `area` and `scatter` series can be represented by markers.

Marker attributes such as `shape`, `size`, `fill` and `stroke` are configurable via the chart `options`:

```js
marker: {
    shape: 'square', // defaults to 'circle'
    size: 20,
    fill: 'red',
    stroke: 'maroon'
}
```

Please see the [API reference](#api-reference) for the list of all available options.


### Example: Marker Shape, Size and Colour

Notice how the shape and colour of the legend markers match the shape and colour of the markers used by the series, but the size of the markers in the legend is always the same.


<chart-example title='Marker Shape, Size and Colour' name='marker-shape' type='generated'></chart-example>

## Custom Marker Shapes

It's possible to define custom marker shapes with relative ease. All you have to do is extend the `Marker` class and define a single method called `updatePath`, for example to draw a heart:


```js
import { Marker } from "./marker";

export class Heart extends Marker {
    toRadians(degrees) {
        return degrees / 180 * Math.PI;
    }

    updatePath() {
        const { x, path, size, toRadians } = this;
        const r = size / 4;
        const y = this.y + r / 2;

        path.clear();
        path.cubicArc(x - r, y - r, r, r, 0, toRadians(130), toRadians(330), 0);
        path.cubicArc(x + r, y - r, r, r, 0, toRadians(220), toRadians(50), 0);
        path.lineTo(x, y + r);
        path.closePath();
    }
}
```

Inside the marker object, you have access to the `size` of the marker, the `x` and `y` coordinates of the data point and the `path` instance, which you can use to issue draw commands. If you are familiar with the standard Canvas API, you'll feel right at home here. The `path` API is very similar to that of [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D).


All we do is render two partial circles with the `cubicArc` command and then two straight lines using the `lineTo` and `closePath` commands to get the shape of a heart.

Inside the marker config of a series we then use the marker's constructor function itself rather than using one of the predefined shape names:

```js
marker: {
    shape: Heart,
    size: 16
}
```

The final result is shown in the example below.


### Example: Custom Marker Shape

<chart-example title='Custom Marker Shape' name='custom-marker' type='generated'></chart-example>

## API Reference

<interface-documentation interfaceName='AgCartesianSeriesMarker' overridesrc="charts-api/api.json" config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation>

## Next Up

Continue to the next section to learn about [formatters](/charts-formatters/).

