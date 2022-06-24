---
title: "Customising Compactness & Row Height"
---

Add more white space or pack more data into a the UI.

- `--ag-grid-size` is the main control for affecting how tightly data and UI elements are packed together. It should be a value in pixels. All padding and spacing in the grid is defined as a multiple of grid-size, so increasing it will make most components larger by increasing their internal white space while leaving the size of text and icons unchanged.




## Customising Row and Header Heights

If you have made any customisations that affect the height of the header or individual rows - in particular setting the `--ag-row-height`, `--ag-line-height`, `--ag-header-height` or `--ag-grid-size` variables - then you need to understand the effect your change has on the grid's virtualised layout.

The grid uses [DOM virtualisation](/dom-virtualisation/) for rendering large amounts of data,
which means that it needs to know the size of various elements like columns and grid rows in order to calculate their layout. The grid uses several strategies to work out the right size:

1. Firstly, the grid will attempt to measure the size of an element. This works when styles have loaded, but will not work if the grid initialises before the theme loads. Our [theme customisation examples](https://github.com/ag-grid/ag-grid-customise-theme/blob/master/src/vanilla/grid.js) demonstrate how to wait for CSS to load before initialising the grid (see the cssHasLoaded function).

2. If CSS has not loaded and one of the provided themes is in use, the grid contains hard-coded fallback values for these themes. For this reason we recommend that if you are extending a provided theme like `ag-theme-alpine` and have not changed the row and header heights, you keep the same theme name so that the grid knows what fallback sizes to apply.

3. If neither of the above methods will work for your app (you do not want to delay app initialisation until after CSS has loaded, and are not using a provided theme with heights unchanged) then you should inform the grid about your custom element heights using [grid properties](/grid-options/). The minimal set of properties you need to set to ensure correct functioning are: `rowHeight`, `headerHeight` and `minWidth`.


### Changing Row and Header Heights at Runtime

The grid performs its measurement of elements as described above when it starts up. This means that if you change the size of grid rows after initialisation - either by setting a CSS variable like `--ag-grid-size` or by changing the theme - you need to reinitialise the grid.

You can do this by calling the `destroy()` API method and then creating a new grid instance.

TODO: example of changing grid compactness