---
title: "Background Image"
---

This section describes how to add a background image to a chart.

## Background Image parameters

The `url` is required for the background image.

It is positioned in the center by default. The `left`, `top`, `right` and `bottom` properties specify the distance between the chart borders and the image. The `width` and `height` properties override the size of the image.

```js
background: {
    image: {
        url: 'data:image/png;base64,iVBORw0...',
        width: 50,
        height: 50,
        right: 10,
        bottom: 10,
    },
},
```

[Custom Background Image Example](https://plnkr.co/edit/b24vwpgBhAqQO1kq?open=main.js)

<!-- <chart-example title='Background Image' name='background-image' type='generated'></chart-example> -->

### API Reference

<!-- TODO: replace with usual api reference component -->

```ts
interface AgChartBackground {
    /** Whether or not the background should be visible. */
    visible?: boolean;
    /** Colour of the chart background. */
    fill?: CssColor;

    /** Background image. May be combined with fill colour. */
    image?: AgChartBackgroundImage;
}

interface AgChartBackgroundImage {
    /** URL of the image */
    url: string;

    /** Distance from the left border of the chart to the left border of the image. If neither left nor right specified, the image is centred horizontally. */
    left?: PixelSize;
    /** Distance from the top border of the chart to the top border of the image. If neither top nor bottom specified, the image is centred vertically. */
    top?: PixelSize;
    /** Distance from the right border of the chart to the right border of the image. If neither left nor right specified, the image is centred horizontally. */
    right?: PixelSize;
    /** Distance from the bottom border of the chart to the bottom border of the image. If neither top nor bottom specified, the image is centred vertically. */
    bottom?: PixelSize;

    /** Width of the image. If both left and right specified, width is ignored. If width is not determined but height does,
     * width computed to preserve the original width/height ratio. Otherwise the original width is used. */
    width?: PixelSize;

    /** Height of the image. If both top and bottom specified, height is ignored. If height is not determined but width does,
     * height computed to preserve the original width/height ratio. Otherwise the original height is used. */
    height?: PixelSize;

    /** Opacity of the image. */
    opacity?: Opacity;
}
```

<!-- <interface-documentation interfaceName='AgChartBackground' config='{ "showSnippets": false, "lookupRoot": "charts-api" }'></interface-documentation> -->

## Next Up

Continue to the next section to learn more about [overlays](/charts-overlays/).
