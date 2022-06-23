---
title: "Legacy Sass API"
---

In v28, the [Sass Styling API](/styling-sass) was introduced as the preferred way for Sass users to control themes and design customisations. The Legacy Sass API is deprecated and will be removed from the Grid in a future major release.

[[note]]
| If you a) created an app on v27 or earlier, b) have not updated your import paths, and c) are using Sass to modify the provided themes; then you will be using the Legacy Sass API even if you upgraded your ag-Grid dependency to v28. You can recognise Legacy Sass API import paths because they will have `/dist/` or `/src/` in them, e.g. `@import "ag-grid-community/src/styles/ag-grid.scss"`.
|
| New apps that follow the setup instructions in the current documentation will use the new Sass Styling API, recognisable by its import paths in this form `@import "ag-grid-community/styles" as ag;`. For new apps, we recommend using the new API.

## Loading the Legacy Sass API

In order to opt in to the Legacy Sass API, set your project up to compile Sass and then use the legacy paths when importing the grid Sass files:

1. `@import` the structural styles from `ag-grid-community/src/styles/ag-grid.scss`
2. `@import` the theme mixin from `ag-grid-community/src/styles/ag-theme-{themename}/sass/ag-theme-{themename}-mixin.scss`

[[note]]
| Both stylesheets need to be included with the structural styles (`ag-grid.css`) loaded before theme styles (`ag-theme-{theme-name}.css`).

It's up to you how to integrate Sass into your project build, but we like to use webpack, since it provides various loaders that optimise and reduce the final size of the bundle. We provide a [general webpack example](https://github.com/ag-grid ag-grid-customise-theme/tree/v28-theme-refactor/src/legacy/vanilla) appropriate for Vanilla JS and React projects, and an [angular example](https://github.com/ag-grid/ag-grid-customise-theme/tree/v28-theme-refactor/src/legacy/angular) using Angular CLI.

### Loading the Roboto font for Material theme

The Material theme requires the Roboto font, and this is not bundled in the material CSS. The easiest way to load Roboto is through Google's CDN:

```html
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />
<div id="myGrid" class="ag-theme-material"></div>
```

## Using the Legacy Sass API

After importing

```scss
@import "~ag-grid-community/src/styles/ag-grid.scss";
@import "~ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine-mixin";

.ag-theme-alpine {
    // ^^^ the name of your theme here.
    @include ag-theme-alpine((
        // ^^^ call the mixin provided by the theme you're extending
        alpine-active-color: deeppink
        // ^^^ pass theme parameters
    ));

    .ag-header {
        font-style: italic;
    }
    // or write CSS selectors to make customisations beyond what the parameters support
}
```

Note how this example includes the structural styles (`ag-gris.scss`) before the theme mixin. Doing this means that both structural and theme styles will be included in the compiled CSS file. Alternatively, you could leave out the first `@import` and then embed the structural stylesheet separately in your HTML page.

## Legacy Sass API Parameters

Theme Parameters are arguments to a theme that change its appearance. Some parameters have effects that would be very hard to achieve using CSS rules. Parameters can be set through the Sass API, and colour parameters can additionally be set with CSS variables.

Here are some of the most important theme parameters. There is a [full list](#base-theme-parameters) further down this page.

- `grid-size` is the main control for affecting how tightly data and UI elements are packed together. All padding and spacing in the grid is defined as a multiple of grid-size, so increasing it will make most components larger by increasing their internal white space while leaving the size of text and icons unchanged.

- `borders` controls whether borders are drawn around the grid. There are more `border-*` parameters to provide fine-grained control over which borders are drawn and their colour.

- `row-height` height in pixels of a grid row.

- `header-height` height in pixels of a header row.
- `foreground-color` and `background-color` set the text colour and background colour for the grid - there are more colour parameters available for more fine-grained control over the colour scheme.

- The provided themes have theme-specific parameters to set the colour of many elements at once. These are shortcuts for setting several other parameters.

    - `alpine-active-color` (Alpine only) sets the colour of checked checkboxes, range selections, row selections, selected tab underlines, and input focus outlines.

    - `balham-active-color` (Balham only) sets the colour of checked checkboxes, range selections, row selections, and input focus outlines.

    - `material-primary-color` and `material-accent-color` (Material only) set the colours used for the primary and accent colour roles specified in the [Material Design colour system](https://material.io/design/color/). Currently primary colour is used for buttons, range selections, selected tab underlines and input focus underlines, and accent colour is used for checked checkboxes.

### Customising row and header heights

The grid uses [DOM virtualisation](/dom-virtualisation/) for rendering large amounts of data,
which means that it needs to know the size of various elements like columns and grid rows in order to calculate their
layout. The grid uses several strategies to work out the right size:

1. Firstly, the grid will attempt to measure the size of an element. This works when styles have loaded, but will not work if the grid initialises before the theme loads. Our [theme customisation examples](https://github.com/ag-grid/ag-grid-customise-theme/tree/v28-theme-refactor/src/legacy/vanilla/grid.js) demonstrate how to wait for CSS to load before initialising the grid (see the cssHasLoaded function).

1. If CSS has not loaded and one of the provided themes is in use, the grid contains hard-coded fallback values for these themes. For this reason we recommend that if you are extending a provided theme like `ag-theme-alpine` and have not changed the row and header heights, you keep the same theme name so that the grid knows what fallback sizes to apply.

1. If neither of the above methods will work for your app (you do not want to delay app initialisation until after CSS has loaded, and are not using a provided theme with heights unchanged) then you should inform the grid about your custom element heights using [grid properties](/grid-options/). The minimal set of properties you need to set to ensure correct functioning are: `rowHeight`, `headerHeight` and `minWidth`.

## Setting colour parameters using CSS variables

[[note]]
| Using the Legacy Sass API means that only color parameters can be overridden using CSS variables, instead of the full set of variables supported when using CSS themes or the new Sass Styling API..

CSS variables (officially known to as "CSS Custom Properties") allow a named property to be set in one place and used in many places. Any parameter whose name ends with `-color` is available as a CSS variable with the prefix `--ag-`. For example the `foreground-color` parameter can be set as follows:

```scss
.ag-theme-alpine {
    /* use theme parameters where possible */
    --ag-foreground-color: deeppink;
}
```

If your app already defines a colour scheme using CSS variables and you want to use those existing variable names rather than the `--ag-{parameter-name}`
provided by the grid, you can do this by passing a css `var()` value to a theme parameter in Sass. For example, if your application defines a CSS variable `--appMainTextColor` and you want to set the `foreground-color` parameter at runtime using this variable, you can do so like this:


```scss
.ag-theme-alpine {
    @include ag-theme-alpine((
        foreground-color: var(--appMainTextColor)
    ));
}
```

This will cause the text in grid cells to be set at runtime to the value of the `--myDataColorVar`. If both a custom variable (`--myDataColorVar`)
and a built in variable (`--ag-foreground-color`) are set at runtime, the built in variable will take priority. If you don't want this to happen then you
can disable built in variables for your theme by setting the parameter `suppress-css-var-overrides: false`.

We have created an example that demonstrates both methods of CSS variable use in our
[theme examples GitHub repo](https://github.com/ag-grid/ag-grid-customise-theme/tree/v28-theme-refactor/src/legacy/vanilla-css-variables).

## Customising themes using CSS rules

Whether you're using Sass or CSS variables to set theme parameters, you will find that some design effects can't be achieved through
parameters alone. For example, there is no parameter to set the `font-style: italic` on header cells. If you want your column headers to be italic, use regular CSS:


```css
.ag-theme-alpine .ag-header-cell-label {
    font-style: italic;
}
```

[[note]]
| It is important to include the name of the theme in the rule: `.ag-theme-alpine .ag-header-cell-label { ... } `.
| Without the theme name, your styles will not override the theme's built-in styles due to CSS selector specificity rules.

The best way to find the right class name to use in a CSS rule is using the browser's developer tools. You will notice that components often have multiple class names, some more general than others. For example, the [row grouping panel](/tool-panel-columns/#column-tool-panel-example) is a component onto which you can drag columns to group them. The internal name for this is the "column drop" component, and there are two kinds - a horizontal one at the top of the header and a vertical one in the columns tool panel. You can use the class name `ag-column-drop` to target either kind, or `ag-column-drop-vertical` / `ag-column-drop-horizontal` to target one only.

### Referencing parameter values in CSS rules

If you're using Sass, you can reference theme parameters in your own CSS rules using the [ag-param function](#ag-param) or [ag-color-property mixin](#ag-color-property). These will be replaced at compile time with the value of the parameter.

### Understanding CSS rule maintenance and breaking changes

With each release of the grid we add features and improve existing ones, and as a result the DOM structure changes with every release - even minor and patch releases. Of course we test and update the CSS rules in our themes to make sure they still work, and this includes ensuring that
customisations made via theme parameters does not break between releases. But if you have written your own CSS rules, you will need to test and update them.

The simpler your CSS rules are, the less likely they are to break between releases. Prefer selectors that target a single class name where possible.

### Avoiding breaking the grid with CSS rules

Browsers use the same mechanism - CSS - for controlling how elements work (e.g. scrolling and whether they respond to mouse events), where elements appear, and how elements look. Our "structural stylesheet" (ag-grid.scss) sets CSS rules that control how the grid works, and the code depends on those rules not being overridden. There is nothing that we can do to prevent themes overriding critical rules, so as a theme author you need to be careful not to break the grid. Here's a guide:


- Visual styles including margins, paddings, sizes, colours, fonts, borders etc are all fine to change in a theme.

- Setting a component to `display: flex` and changing flex child layout properties like `align-items`, `align-self` and `flex-direction` is probably OK if you're trying to change how something looks on a small scale, e.g. to change the align of some text or icons within a container; but if you're trying to change the layout of the grid on a larger scale e.g.  turning a vertical scrolling list into a horizontal one, you are likely to break Grid features.

- The style properties `position`, `overflow` and `pointer-events` are intrinsic to how the grid works. Changing these values will change how the grid operates, and may break functionality now or in future minor releases.

## Full list of theme parameters

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

## Parameter cascading


A parameter cascade is when one parameter defaults to another, which may itself default to a different parameter. In this way we can have very general purpose parameters like `foreground-color` which changes the colour of all text in the grid, and more specific parameters like `data-color` which only change the colour of text in grid cells. Consider the following parameters, all of which derive their value directly or indirectly from the foreground colour:


```scss
foreground-color: #000,
data-color: ag-derived(foreground-color),
secondary-foreground-color: ag-derived(foreground-color),
header-foreground-color: ag-derived(secondary-foreground-color),
disabled-foreground-color: ag-derived(foreground-color, $opacity: 0.5),
```

Note how `disabled-foreground-color` alters the opacity of the default foreground colour, so setting `foreground-color`
to red (`#FF0000`) will automatically generate a semi-transparent red (`rgba(255,0,0,0.5)`).


### Parameter cascading and CSS variables


There is a limitation of parameter cascading when used in combination with CSS variables. Sometimes, one parameter in the cascade alters the
value of the parameter that it derives from, as in the case of `disabled-foreground-color` above. This requires the value to be
known at compile time, and it is not possible to achieve this effect at runtime using CSS variables.


If you are setting parameters using the built in CSS variables, defining `--ag-foreground-color: red`
will not automatically set the disabled foreground colour to semi-transparent red - if you want this effect, you must explicitly define `--ag-disabled-foreground-color: rgba(255,0,0,0.5)`.

If you are passing CSS custom property values to colour parameters, e.g. `foreground-color: var(--myForegroundColor, red)`
then again it will not be possible to automatically calculate the disabled foreground colour, and you will need to specify a value e.g.
`disabled-foreground-color: var(--myDisabledForegroundColor, rgba(255,0,0,0.5))`. In this case there will be a warning emitted
by the Sass build process describing the issue.

## Sass mixins and functions

The following theme functions and mixins are available if you are include a theme mixin file like `ag-theme-alpine-mixin.scss`, or can be used in isolation
by importing `styles/mixins/_ag-theme-params.scss` from the grid distribution.

### @function ag-param

If you're using Sass, you can write CSS rules that reference the value of a theme parameter. For example, this rule would invert
the foreground and background colours in the header:


```scss
.ag-header-cell {
    background-color: ag-param(foreground-color);
    color: ag-param(background-color);
}
```

ag-param simply returns the correct value into the emitted CSS, it does not add any support for CSS variables. The above example emits the following CSS:

```css
.ag-header-cell {
    background-color: #000;
    color: #FFF;
}
```

### @mixin ag-color-property

The `ag-color-property` mixin takes 3 arguments: a CSS property name, a parameter name, and an optional boolean indicating whether the rule
should be marked as `!important`. Like `ag-param` it can be used to reference the value of a parameter, but it additionally adds
support for CSS variables.

```css
.ag-header-cell {
    @include ag-color-property(background-color, foreground-color);
    @include ag-color-property(color, background-color);
}
```

Here is the CSS emitted by the above code:

```css
.ag-header-cell {
  background-color: #000;
  background-color: var(--ag-foreground-color, #000);
  color: #fff;
  color: var(--ag-background-color, #fff);
}
```

Each rule is emitted twice, the first rule ensures that the default colour is visible in older browsers that do not support CSS variables.


### @function ag-derived


As the user of a theme you do not need to write code including the `ag-derived` function, but it's still useful to know about it so that you can understand your theme's default parameters. Our provided themes make extensive use of this function to implement [parameter cascading](#parameter-cascading).

If you're writing a theme that is intended to be extended and used by other developers, you may use this function to implement your own parameter cascades.

Parent themes define a Sass map of supported parameter names and their default values, which can optionally be overridden by child themes by passing params to the parent theme mixin:


```scss
$my-theme-default-params: (
    animal-color: red,
    cat-color: ag-derived(animal-color)
);
```

The theme can then use the parameters in CSS rules:

```scss
.cat {
    // outputs the value passed to "cat-color", or "red" if
    // no "cat-color" parameter was supplied
    color: ag-param(cat-color);
}
```


The `ag-derived` function supports modifiers - named arguments that can be used to modify the value of the parameter being derived from. In this case, if the `cat-color` parameter is not overridden, it will default to a semitransparent version of animal-color:


```scss
$my-theme-default-params: (
    animal-color: #FFFFFF,
    cat-color: ag-derived(animal-color, $opacity: 0.5)
);
```

Instead of passing a value to a modifier, it is also possible to pass a parameter name. In this case, the `cat-color` parameter defaults to a semitransparent version of animal-color with the exact amount of opacity depending on the value of `cat-opacity`:


```scss
$my-theme-default-params: (
    animal-color: #FFFFFF,
    cat-opacity: 0.5,
    cat-color: ag-derived(animal-color, $opacity: cat-opacity)
);
```

The following modifiers are available:


- Available for numeric parameters:

    - `$times: number` - equivalent to Sass `$value * $number`
    - `$divide: number` - equivalent to Sass `$value / $number`
    - `$plus: number` - equivalent to Sass `$value + $number`
    - `$minus: number` - equivalent to Sass `$value - $number`

- Available for colour parameters:

    - `$opacity: percentage` - amount should be from 0 to 1, equivalent to Sass `rgba($value, $amount)`

    - `$mix: color percentage` - mixes in an amount of another colour, e.g. `$mix: red 10%` produce a colour made from 90% the parameter value and 10% red.

    - `$lighten: percentage` - amount should be a percentage from 0% to 100%, equivalent to Sass `lighten($value, $amount)`.

    - `$darken: percentage` - amount should be a percentage from 0% to 100%, equivalent to Sass `darken($value, $amount)`

    - `$self-overlay: times` - takes a semi-transparent colour and overlays it on top of itself multiple times. For example, if the value of the parameter is `rgba(0, 0, 0, 0.5)` then `$self-overlay: 2` will produce `rgba(0, 0, 0, 0.75)`
