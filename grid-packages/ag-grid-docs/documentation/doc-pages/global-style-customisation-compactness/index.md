---
title: "Customising Compactness & Row Height"
---

Add more white space or pack more data into the UI.

- `--ag-grid-size` is the main control for affecting how tightly data and UI elements are packed together. It should be a value in pixels. All padding and spacing in the grid is defined as a multiple of grid-size, so increasing it will make most components larger by increasing their internal white space while leaving the size of text and icons unchanged.
- `--ag-row-height` sets the height of a grid row. It often needs fine-tuning when the `--ag-grid-size` is changed.
- `--ag-list-item-height` controls the height of items in UI scrolling lists such as the columns in the columns tool panel below. Like the row height you often need to update it after changing `--ag-grid-size`.

```css
.ag-theme-alpine {
    --ag-grid-size: 3px;
    --ag-list-item-height: 20px;
}
```

<grid-example title='Tight layout' name='compactness-tight' type='generated' options='{ "exampleHeight": 450, "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel"]  }'></grid-example>

```css
.ag-theme-alpine {
    --ag-grid-size: 10px;
    --ag-list-item-height: 40px;
}
```

<grid-example title='Loose layout' name='compactness-loose' type='generated' options='{ "exampleHeight": 450, "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel"]  }'></grid-example>


## Customising Row and Header Heights

If you have made any customisations that affect the height of the header or individual rows - in particular setting the `--ag-row-height`, `--ag-header-height` or `--ag-grid-size` variables - then you need to understand the effect your change has on the grid's virtualised layout.

The grid uses [DOM virtualisation](/dom-virtualisation/) for rendering large amounts of data,
which means that it needs to know the size of various elements like columns and grid rows in order to calculate their layout. The grid uses several strategies to work out the right size:

1. Firstly, the grid will attempt to measure the size of an element. This works when styles have loaded, but will not work if the grid initialises before the theme loads. Our [theme customisation examples](https://github.com/ag-grid/ag-grid-customise-theme/blob/master/src/vanilla/src/grid.js) demonstrate how to wait for CSS to load before initialising the grid (see the cssHasLoaded function).

2. If CSS has not loaded and one of the provided themes is in use, the grid contains hard-coded fallback values for these themes. For this reason we recommend that if you are extending a provided theme like `ag-theme-alpine` and have not changed the row and header heights, you keep the same theme name so that the grid knows what fallback sizes to apply.

3. If neither of the above methods will work for your app (you do not want to delay app initialisation until after CSS has loaded, and are not using a provided theme with heights unchanged) then you should inform the grid about your custom element heights using [grid properties](/grid-options/). The minimal set of properties you need to set to ensure correct functioning are: `rowHeight`, `headerHeight` and `minWidth`.


### Changing Row and Header Heights at Runtime

The grid performs its measurement of elements as described above when it starts up. This means that if you change the size of grid rows after initialisation - either by setting a CSS variable like `--ag-grid-size` or by changing the theme - you need to reinitialise the grid.

[[only-javascript]]
| You can do this by calling the `grid.api.destroy()` API method on the old grid instance and then creating a new instance.

[[only-react]]
| You can do this by changing the `key` property of the `<AgGridReact>` element, which will cause it to be unmounted and re-mounted, destroying the old grid and creating a new one.

## Key compactness variables

The following variables are all defined as multiples of `--ag-grid-size`, if you've updated the grid size and you many want to update them to fine-tuning the compactness:

<api-documentation source='global-style-customisation-variables/resources/variables.json' section='variables' names='["--ag-widget-container-horizontal-padding", "--ag-widget-container-vertical-padding", "--ag-widget-horizontal-spacing", "--ag-widget-vertical-spacing", "--ag-cell-horizontal-padding", "--ag-row-height", "--ag-list-item-height", "--ag-column-select-indent-size", "--ag-set-filter-indent-size"]' config='{"maxLeftColumnWidth": 35, "hideHeader": true}'></api-documentation>
