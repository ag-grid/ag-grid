---
title: "Customising the Header"
---

Style grid [header](/column-headers/) cells and column groups.

The grid exposes many CSS variables starting `--ag-header-*` for customising header appearance, and when these are not enough you can use CSS classes, in particular `ag-header`, `ag-header-cell`, and `ag-header-group-cell`:

```css
.ag-theme-quartz {
    --ag-header-height: 30px;
    --ag-header-foreground-color: white;
    --ag-header-background-color: black;
    --ag-header-cell-hover-background-color: rgb(80, 40, 140);
    --ag-header-cell-moving-background-color: rgb(80, 40, 140);
}
.ag-theme-quartz .ag-header {
    font-family: cursive;
}
.ag-theme-quartz .ag-header-group-cell {
    font-weight: normal;
    font-size: 22px;
}
.ag-theme-quartz .ag-header-cell {
    font-size: 18px;
}
```

<grid-example title='Colour Customisation' name='header-customisation' type='generated' options='{ "exampleHeight": 400 }'></grid-example>

## Header Column Separators and Resize Handles

Header Column Separators appear between every column, whereas Resize Handles only appear on resizeable columns (Group 1 in the example below).

```css
.ag-theme-quartz {
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

## Style Header on Filter

Each time a [Column Filter](/filtering/) is applied to a column, the CSS class `ag-header-cell-filtered` is added to the header. This can be used for adding style to headers that are filtered.

The example below adds some styling to `ag-header-cell-filtered`, so when you filter a column you will notice the column header change.

<grid-example title='Style Header' name='style-header-on-filter' type='generated' options='{ "exampleHeight": 520 }'></grid-example>

## Styling the First and Last Columns

It's possible to style the all first and last column header (Grouped, Non-Grouped and Floating Filters) using CSS by targeting the `.ag-column-first` and `.ag-column-last` selectors as follows:

```css
.ag-header-group-cell.ag-column-first {
    background-color: #2244CC66;
    color: white;
}
.ag-header-cell.ag-column-first {
    background-color: #2244CC44;
    color: white;
}
.ag-floating-filter.ag-column-first {
    background-color: #2244CC22;
}

.ag-header-group-cell.ag-column-last {
    background-color: #33CC3366;
}
.ag-header-cell.ag-column-last {
    background-color: #33CC3344;
}
.ag-floating-filter.ag-column-last {
    background-color: #33CC3322;
}
```

<grid-example title='Style Header' name='style-header-first-last' type='generated' options='{ "exampleHeight": 520 }'></grid-example>

## Full List of Header Variables

<api-documentation source='global-style-customisation-variables/resources/variables.json' section='variables' config='{"namePattern": "--ag-header", "maxLeftColumnWidth": 35, "hideHeader": true}'></api-documentation>


