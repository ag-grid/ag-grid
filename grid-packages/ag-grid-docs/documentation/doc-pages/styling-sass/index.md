---
title: "Sass styling API"
---



[[note]]
|TODO:
|
|Setting variables
| - Every [design customisation variable](/customising-design) variable is supported, but you do not need the `--ag-` prefix, so instead of setting `--ag-foreground-color: red` you set |`foreground-color: red`.
| - TODO borders, borders-critical accept booleans. (note: must implement this!)
| - header-column-resize-handle (and the other one) work with booleans (note: implement this!)
| - 
|


The Sass styling API is an optional lightweight wrapper around [Themes](/themes) and [Design Customisations](/customising-design) that automates the process of importing CSS files and setting CSS variables.

Sass is not necessary to customise the provided themes. Since introducing full support for design customisation through CSS variables in v28, anything that is possible with Sass is also possible with CSS. But the Sass API provides some benefits:

1. **Colour blending.** The Sass API saves you the work of defining multiple related colours. For example with the Alpine theme, if you set `alpine-active-color` to `red` then the `row-hover-colour` will automatically be set to a light pink.
1. **Validation.** In the Sass API you will get a build error if you accidentally pass an invalid parameter name or value. In CSS this would be silent and lead to incorrect styling.
2. **Automatic selection of CSS files.** The Sass API ensures that all the necessary CSS files are loaded only once, in the correct order, and combined into a single file.

## Getting started

First, set up your project to compile Sass (.scss) files. We provide an example using the [Sass CLI](https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/vanilla) and one using [Webpack and sass-loader](https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/vanilla-webpack).

Next, create import the Sass API in your .scss file:

```scss
@use "ag-grid-community/styles" as ag;
```

The above import path assumes that `node_modules` is added to the Sass load path. Depending on how your project is configured, you may need to add one or more prefixes to the import path:

 - `@ag-grid-community/styles` if you're using the grid [modules](/modules/) feature
 - `node_modules/ag-grid-community/styles` if `node_modules` is not in the Sass load path
 - `~ag-grid-community/styles` is you're using webpack and sass-loader

## Simple example

The following Sass file:

```scss
@use "ag-grid-community/styles" as ag;
@include ag.grid-styles((
    theme: alpine,
    alpine-active-color: red
));
```

will compile to this CSS:

```css
/* ... content of ag-grid.css ... */
/* ... content of ag-theme-alpine.css ... */
.ag-theme-alpine {
  --ag-alpine-active-color: red;
  --ag-range-selection-border-color: red;
  --ag-selected-row-background-color: rgba(255, 0, 0, 0.1);
  --ag-row-hover-color: rgba(255, 0, 0, 0.1);
  --ag-column-hover-color: rgba(255, 0, 0, 0.1);
  --ag-input-focus-border-color: rgba(255, 0, 0, 0.4);
  --ag-range-selection-background-color: rgba(255, 0, 0, 0.2);
  --ag-range-selection-background-color-2: rgba(255, 0, 0, 0.36);
  --ag-range-selection-background-color-3: rgba(255, 0, 0, 0.488);
  --ag-range-selection-background-color-4: rgba(255, 0, 0, 0.5904);
}
```

In order to use the theme, set the `ag-theme-alpine` class on your grid div:

```html
<div id="myGrid" class="ag-theme-alpine">
```

## Colour blending

TODO docs of what colours blend

## Extending a provided theme with a custom theme name

If you want to use a provided theme (say ag-theme-alpine), apply some customisations, and package this as a custom theme to share between multiple apps, then you may want to use a different theme name.

To do this, set the `theme` parameter to your custom theme and set the `extend-theme` parameter to one of the provided themes:

```scss
@use "ag-grid-community/styles" as ag;
@include ag.grid-styles((
    theme: acmecorp,
    extend-theme: alpine,
    alpine-active-color: red
));
```

To use this theme, add the `ag-theme-acmecorp` class to your grid div.

Theme extension is only available in the Sass API. The alternative method of creating a [reusable package of design customisations](/customising-design#creating-a-reusable-package-of-design-customisations) works in both Sass and pure CSS projects.

## Multiple themes

TODO

## Suppressing native widget styles

TODO

## Theme Parameters

The Sass styling API supports the same set of parameters as the [CSS variable API](/customising-design#full-list-of-css-variables). Here are some of the most important theme parameters. There is a [full list](#base-theme-parameters) further down this page.

- `grid-size` is the main control for affecting how tightly data and UI elements are packed together. All padding and spacing in the grid is defined as a multiple of grid-size, so increasing it will make most components larger by increasing their internal white space while leaving the size of text and icons unchanged.
- `borders` controls whether borders are drawn around the grid. There are more `border-*` parameters to provide fine-grained control over which borders are drawn and their colour.
- `row-height` height in pixels of a grid row.
- `header-height` height in pixels of a header row.
- `foreground-color` and `background-color` set the text colour and background colour for the grid - there are more colour parameters available for more fine-grained control over the colour scheme.

- The provided themes have theme-specific parameters to set the colour of many elements at once. These are shortcuts for setting several other parameters.
    - `alpine-active-color` (Alpine only) sets the colour of checked checkboxes, range selections, row selections, selected tab underlines, and input focus outlines.
    - `balham-active-color` (Balham only) sets the colour of checked checkboxes, range selections, row selections, and input focus outlines.
    - `material-primary-color` and `material-accent-color` (Material only) set the colours used for the primary and accent colour roles specified in the [Material Design colour system](https://material.io/design/color/). Currently primary colour is used for buttons, range selections, selected tab underlines and input focus underlines, and accent colour is used for checked checkboxes.

## Adding CSS rules

You will find that some design effects can't be achieved through parameters alone. For example, there is no parameter to set `font-style: italic` on header cells. If you want your column headers to be italic, use regular CSS:

```css
.ag-theme-alpine .ag-header-cell-label {
    font-style: italic;
}
```

[[note]]
| It is important to include the name of the theme in the rule: `.ag-theme-alpine .ag-header-cell-label { ... } `.
| Without the theme name, your styles will not override the theme's built-in styles due to CSS selector specificity rules.

## Full list of theme parameters

TODO update me

Here is a list of parameters accepted by the base theme and all themes that extend it, including our provided
themes Alpine, Balham and Material.

The default values in this list demonstrate the kind of value that is expected (a colour, pixel value, percentage value etc) but bear in mind that if you are using a provided theme then the theme will have changed most of the default values - you can
find the default values for your theme by inspecting its source code in the grid distribution - look for a file called `_ag-theme-{theme-name}-default-params.scss`.

Note that some values are defined relative to other values using the `ag-derived` helper function, so
`data-color: ag-derived(foreground-color)` means that if you don't set the `data-color` property it
will default to the value of `foreground-color`. See the [ag-derived docs](#ag-derived) for more information.


```scss
// Colour of text and icons in primary UI elements like menus
foreground-color: #000,

// Colour of text in grid cells
data-color: ag-derived(foreground-color),

// Colour of text and icons in UI elements that need to be slightly less emphasised to avoid distracting attention from data
secondary-foreground-color: ag-derived(foreground-color),

// Colour of text and icons in the header
header-foreground-color: ag-derived(secondary-foreground-color),

// Color of elements that can't be interacted with because they are in a disabled state
disabled-foreground-color: ag-derived(foreground-color, $opacity: 0.5),

// Background colour of the grid
background-color: #fff,

// Background colour for all headers, including the grid header, panels etc
header-background-color: null,

// Background colour for second level headings within UI components
subheader-background-color: null,

// Background colour for toolbars directly under subheadings (as used in the chart settings menu)
subheader-toolbar-background-color: null,

// Background for areas of the interface that contain UI controls, like tool panels and the chart settings menu
control-panel-background-color: null,

// Background color of selected rows in the grid and in dropdown menus
selected-row-background-color: ag-derived(background-color, $mix: foreground-color 25%),

// Background colour applied to every other row or null to use background-color for all rows
odd-row-background-color: null,

// Background color of the overlay shown over the grid when it is covered by an overlay, e.g. a data loading indicator.
modal-overlay-background-color: ag-derived(background-color, $opacity: 0.66),

// Background color when hovering over rows in the grid and in dropdown menus, or null for no rollover effect (note - if you want a rollover on one but not the other, set to null and use CSS to achieve the rollover)
row-hover-color: null,

// Background color when hovering over columns
column-hover-color: null,

// Color to draw around selected cell ranges
range-selection-border-color: ag-derived(foreground-color),

// Background colour of selected cell ranges. By default, setting this to a semi-transparent color (opacity of 0.1 to 0.5 works well) will generate appropriate values for the range-selection-background-color-{1..4} colours used when multiple ranges overlap.
// NOTE: if setting this value to a CSS variable, and your app supports overlapping range selections, also set range-selection-background-color-{1..4}.
range-selection-background-color: ag-derived(range-selection-border-color, $opacity: 0.2),

// These 4 parameters are used for fine-grained control over the background color used when 1, 2, 3 or 4 ranges overlap.
range-selection-background-color-1: ag-derived(range-selection-background-color),
range-selection-background-color-2: ag-derived(range-selection-background-color, $self-overlay: 2),
range-selection-background-color-3: ag-derived(range-selection-background-color, $self-overlay: 3),
range-selection-background-color-4: ag-derived(range-selection-background-color, $self-overlay: 4),

// Background colour to apply to a cell range when it is copied from or pasted into
range-selection-highlight-color: ag-derived(range-selection-border-color),

// Colour and thickness of the border drawn under selected tabs, including menus and tool panels
selected-tab-underline-color: ag-derived(range-selection-border-color),
selected-tab-underline-width: 0,
selected-tab-underline-transition-speed: null,

// Background colour for cells that provide categories to the current range chart
range-selection-chart-category-background-color: rgba(#00FF84, 0.1),

// Background colour for cells that provide data to the current range chart
range-selection-chart-background-color: rgba(#0058FF, 0.1),

// Rollover colour for header cells
header-cell-hover-background-color: null,

// Colour applied to header cells when the column is being dragged to a new position
header-cell-moving-background-color: ag-derived(header-cell-hover-background-color),

// Colour to apply when a cell value changes and enableCellChangeFlash is enabled
value-change-value-highlight-background-color: rgba(#16A085, 0.5),

// Colours to apply when a value increases or decreases in an agAnimateShowChangeCellRenderer cell
value-change-delta-up-color: #43a047,
value-change-delta-down-color: #e53935,

// Colour for the "chip" that repersents a column that has been dragged onto a drop zone
chip-background-color: null,

// By default, color variables can be overridden at runtime by CSS variables, e.g.
// background-color can be overridden with the CSS var --ag-background-color. Pass true
// to disable this behaviour.
suppress-css-var-overrides: false,

//
// BORDERS
//

// Draw borders around most UI elements
borders: true,

// Draw the few borders that are critical to UX, e.g. between headers and rows.
borders-critical: ag-derived(borders),

// Draw decorative borders separating UI elements within components
borders-secondary: ag-derived(borders),

// Draw borders around sidebar tabs so that the active tab appears connected to the current tool panel
borders-side-button: ag-derived(borders),

side-bar-panel-width: 200px,

border-radius: 0px,

// Colour for border around major UI components like the grid itself, headers, footers and tool panels
border-color: ag-derived(background-color, $mix: foreground-color 25%),

// Colour for borders used to separate elements within a major UI component
secondary-border-color: ag-derived(border-color),

// Colour of the border between grid rows, or null to display no border
row-border-color: ag-derived(secondary-border-color),

// Default border for cells. This can be used to specify the border-style and border-color properties e.g. `dashed red` but the border-width is fixed at 1px.
cell-horizontal-border: solid transparent,

// Separator between columns in the header. Displays between all header cells For best UX, use either this or header-column-resize-handle but not both
header-column-separator: false,
header-column-separator-height: 100%,
header-column-separator-width: 1px,
header-column-separator-color: ag-derived(border-color, $opacity: 0.5),

// Visible marker for resizeable columns. Displays in the same position as the column separator, but only when the column is resizeable. For best UX, use either this or header-column-separator but not both
header-column-resize-handle: false,
header-column-resize-handle-height: 50%,
header-column-resize-handle-width: 1px,
header-column-resize-handle-color: ag-derived(border-color, $opacity: 0.5),

//
// INPUTS
//

// Suppress styling of checkbox/radio/range input elements. If you want to style these yourself, set this to true. If you only want to disable styling for some kinds of input, you can set this to true and e.g. @include ag-native-inputs((checkbox: false)) which will emit styles for all kinds of input except checkboxes.
suppress-native-widget-styling: false,

input-border-color: null,
input-disabled-border-color: ag-derived(input-border-color, $opacity: 0.3),
input-disabled-background-color: null,

checkbox-background-color: null,
checkbox-border-radius: ag-derived(border-radius),
checkbox-checked-color: ag-derived(foreground-color),
checkbox-unchecked-color: ag-derived(foreground-color),
checkbox-indeterminate-color: ag-derived(checkbox-unchecked-color),

toggle-button-off-border-color: ag-derived(checkbox-unchecked-color),
toggle-button-off-background-color: ag-derived(checkbox-unchecked-color),
toggle-button-on-border-color: ag-derived(checkbox-checked-color),
toggle-button-on-background-color: ag-derived(checkbox-checked-color),
toggle-button-switch-background-color: ag-derived(background-color),
toggle-button-switch-border-color: ag-derived(toggle-button-off-border-color),
toggle-button-border-width: 1px,
toggle-button-height: ag-derived(icon-size),
toggle-button-width: ag-derived(toggle-button-height, $times: 2),

input-focus-box-shadow: null,
input-focus-border-color: null,

// CHART SETTINGS

// Color of border around selected chart style
minichart-selected-chart-color: ag-derived(checkbox-checked-color),
// Color of dot representing selected page of chart styles
minichart-selected-page-color: ag-derived(checkbox-checked-color),


//
// SIZING / PADDING / SPACING
//

// grid-size is the main control for affecting how tightly data and UI elements are packed together. All padding and spacing in the grid is defined as a multiple of grid-size, so increasing it will make most components larger by increasing their internal white space while leaving the size of text and icons unchanged.
grid-size: 4px,

// The size of square icons and icon-buttons
icon-size: 12px,

// These 4 variables set the padding around and spacing between widgets in "widget containers" which are parts of the UI that contain many related widgets, like the set filter menu, charts settings tabs etc.
widget-container-horizontal-padding: ag-derived(grid-size, $times: 1.5),
widget-container-vertical-padding: ag-derived(grid-size, $times: 1.5),
widget-horizontal-spacing: ag-derived(grid-size, $times: 1.5),
widget-vertical-spacing: ag-derived(grid-size),

// Horizontal padding for grid and header cells (vertical padding is not set explicitly, but inferred from row-height / header-height
cell-horizontal-padding: ag-derived(grid-size, $times: 3),

// Horizontal spacing between widgets inside cells (e.g. row group expand buttons and row selection checkboxes)
cell-widget-spacing: ag-derived(cell-horizontal-padding),

// Height of grid rows
row-height: ag-derived(grid-size, $times: 6, $plus: 1),

// Height of header rows
header-height: ag-derived(row-height),

// Height of items in lists (example of lists are dropdown select inputs and column menu set filters)
list-item-height: ag-derived(grid-size, $times: 5),

// How much to indent child columns in the column tool panel relative to their parent
column-select-indent-size: ag-derived(grid-size, $plus: icon-size),

// How much to indent child rows in the grid relative to their parent row
row-group-indent-size: ag-derived(cell-widget-spacing, $plus: icon-size),

// How much to indent child columns in the filters tool panel relative to their parent
filter-tool-panel-group-indent: 16px,

// Cause tabs to stretch across the full width of the tab panel header
full-width-tabs: false,

// Fonts
font-family: ("Helvetica Neue", sans-serif),
font-size: 14px,

// The name of the font family you're using
icon-font-family: $ag-theme-base-icon-font-family, // this var exported by ag-theme-base-font-vars.scss

// A URI (data: URI or web URL) to load the icon font from. NOTE: if your icon font is already loaded in the app's HTML page, set this to null to avoid embedding unnecessry font data in the compiled theme.
icons-data: $ag-theme-base-icons-data,             // this var exported by ag-theme-base-font-vars.scss
icons-font-codes: $ag-theme-base-icons-font-codes, // this var exported by ag-theme-base-font-vars.scss

// cards are elements that float above the UI
card-radius: ag-derived(border-radius),

// the default card shadow applies to simple cards like column drag indicators and text editors
card-shadow: none,

// override the shadow for popups - cards that contain complex UI, like menus and charts
popup-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3)
```
