---
title: "Customising the Header"
---

Style grid [header](/component-header/) cells and column groups.

The grid exposes many CSS variables starting `--ag-header-*` for customising header appearance, and when these are not enough you can use CSS classes, in particular `ag-header`, `ag-header-cell`, and `ag-header-group-cell`:

```css
.ag-theme-alpine {
    --ag-header-height: 30px;
    --ag-header-foreground-color: white;
    --ag-header-background-color: black;
    --ag-header-cell-hover-background-color: rgb(80, 40, 140);
    --ag-header-cell-moving-background-color: rgb(80, 40, 140);
}
.ag-theme-alpine .ag-header {
    font-family: cursive;
}
.ag-theme-alpine .ag-header-group-cell {
    font-weight: normal;
    font-size: 22px;
}
.ag-theme-alpine .ag-header-cell {
    font-size: 18px;
}
```

<grid-example title='Colour Customisation' name='header-customisation' type='generated' options='{ "exampleHeight": 400 }'></grid-example>

## Header Column Separators and Resize Handles

Header Column Separators appear between every column, whereas Resize Handles only appear on resizeable columns (Group 1 in the example below).

```css
.ag-theme-alpine {
    --ag-header-column-separator-display: block;
    --ag-header-column-separator-height: 100%;
    --ag-header-column-separator-width: 2px;
    --ag-header-column-separator-color: purple;

    --ag-header-column-resize-handle-display: block;
    --ag-header-column-resize-handle-height: 25%;
    --ag-header-column-resize-handle-width: 5px;
    --ag-header-column-resize-handle-color: orange;
}
```

<grid-example title='Column Separators' name='header-customisation-columns' type='generated' options='{ "exampleHeight": 400 }'></grid-example>

## Full List of Header Variables

<api-documentation source='global-style-customisation-variables/resources/variables.json' section='variables' config='{"namePattern": "--ag-header", "maxLeftColumnWidth": 35, "hideHeader": true}'></api-documentation>
