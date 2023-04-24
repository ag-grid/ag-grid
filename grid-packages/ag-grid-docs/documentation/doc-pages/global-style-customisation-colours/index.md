---
title: "Customising Colours & Fonts"
---

Change the overall colour scheme and appearance of data.

The grid exposes many CSS `--ag-*-color` variables that affect the colour of elements. `--ag-font-size` and `--ag-font-family` control the default font for the grid.

## Example

```css
.ag-theme-alpine {
    --ag-foreground-color: rgb(126, 46, 132);
    --ag-background-color: rgb(249, 245, 227);
    --ag-header-foreground-color: rgb(204, 245, 172);
    --ag-header-background-color: rgb(209, 64, 129);
    --ag-odd-row-background-color: rgb(0, 0, 0, 0.03);
    --ag-header-column-resize-handle-color: rgb(126, 46, 132);

    --ag-font-size: 17px;
    --ag-font-family: monospace;
}
```

The above code produces these results:

<grid-example title='Colour Customisation' name='colour-customisation' type='generated' options='{ "exampleHeight": 400 }'></grid-example>

## Key colour variables

Some of the most important colour variables are listed below. For the full list check the full [CSS variables reference](/global-style-customisation-variables/) - every colour variable is ends with `-color`.

<api-documentation source='global-style-customisation-variables/resources/variables.json' section='variables' names='["--ag-alpine-active-color", "--ag-balham-active-color", "--ag-material-primary-color", "--ag-material-accent-color", "--ag-foreground-color", "--ag-background-color", "--ag-secondary-foreground-color", "--ag-data-color", "--ag-header-foreground-color", "--ag-header-background-color", "--ag-disabled-foreground-color", "--ag-odd-row-background-color", "--ag-row-hover-color", "--ag-border-color", "--ag-row-border-color"]' config='{"maxLeftColumnWidth": 35, "hideHeader": true}'></api-documentation>

[[note]]
| There are a lot of colour variables - the easiest way to find the variable that colours a specific element is often to inspect the element in your browser's developer tools and check the value of its `color` or `background-color` properties.

## Colour blending, Sass and CSS

The Sass API [Colour Blending](/global-style-customisation-sass/#colour-blending) feature will automatically generate a few default values for colour variables based on the ones that you define. If you're using CSS you may want to set these values yourself for a consistent colour scheme:

- Setting `--ag-alpine-active-color` in the Sass API will:
    - Set `--ag-selected-row-background-color` to a **10%** opaque version
    - Set `--ag-range-selection-background-color` to a **20%** opaque version
    - Set `--ag-row-hover-color` to a **10%** opaque version
    - Set `--ag-column-hover-color` to a **10%** opaque version
    - Set `--ag-input-focus-border-color` to a **40%** opaque version

- Setting `--ag-balham-active-color` in the Sass API will:
    - Set `--ag-selected-row-background-color` to a **10%** opaque version
    - Set `--ag-range-selection-background-color` to a **20%** opaque version

[[note]]
| **Generating semi-transparent colours**
|
| To make a semi-transparent version of a colour, you can use one of these techniques. If your colour is defined as a 6-digit hex value (`#RRGGBB`) convert it to an 8-digit hex value (`#RRGGBBAA`). If your colour is defined as a rgb value (`rgb(R, G, B)`) add a fourth value to specificy opactity (`rgb(R, G, B, A)`).
|
| So for example, the color `deeppink` is hex `#FF1493` or rgb `rgb(255, 20, 147)`.
|
| - 10% opaque: `#8800EE1A` or `rgb(255, 20, 147, 0.1)`
| - 20% opaque: `#8800EE33` or `rgb(255, 20, 147, 0.2)`
| - 30% opaque: `#8800EE4D` or `rgb(255, 20, 147, 0.3)`
| - 40% opaque: `#8800EE66` or `rgb(255, 20, 147, 0.4)`
| - 50% opaque: `#8800EE80` or `rgb(255, 20, 147, 0.5)`
