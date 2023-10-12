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

<api-documentation source='global-style-customisation-variables/resources/variables.json' section='variables' names='["--ag-active-color", "--ag-material-primary-color", "--ag-foreground-color", "--ag-background-color", "--ag-secondary-foreground-color", "--ag-data-color", "--ag-header-foreground-color", "--ag-header-background-color", "--ag-disabled-foreground-color", "--ag-odd-row-background-color", "--ag-row-hover-color", "--ag-border-color", "--ag-row-border-color"]' config='{"maxLeftColumnWidth": 35, "hideHeader": true}'></api-documentation>

<note>
There are a lot of colour variables - the easiest way to find the variable that colours a specific element is often to inspect the element in your browser's developer tools and check the value of its `color` or `background-color` properties.
</note>

## Colour blending

The grid relies extensively on transparency to look good - some colours are automatically generated as semi-transparent versions of other colours. The most important parameters for colour blending are:

- The active colour (`--ag-active-color`). Setting this will create defaults for visual elements that should stand out, such as selected rows, checked checkboxes, and cell range selections.
- The foreground colour (`--ag-foreground-color`). Setting this will create a default colour for many ordinary elements of the grid such as borders, header text and disabled text styles.

You can override any of the generated colours by providing your own variable value, so for example providing `--ag-selected-row-background-color: pink` will override the default value for `--ag-selected-row-background-color` which is a semi-transparent version of `--ag-active-color`.
