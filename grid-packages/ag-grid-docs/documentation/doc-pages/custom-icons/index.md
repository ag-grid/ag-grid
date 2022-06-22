---
title: "Custom Icons"
---

[[warning]]
| TODO rework this page with up-to-date examples of changing icons using CSS variables. Needs 4 examples:
| 1. fontawesome
| 2. Material Design Icons
| 3. SVG icons
| 4. Using a different icon font

This sections details how to provide your own icons for the grid and style grid icons for your application requirements.

## Change Individual Icons Using CSS


You can change individual icons by overriding the background images for the respective CSS selector. The following code snippet overrides the Alpine theme pin icon used in the drag hint when reordering columns:


```css
/*
* The override should be placed after the import of the theme.
* Alternatively, you can also increase the selector's specificity.
*/
.ag-theme-alpine .ag-icon-pin {
   font-family: "Font Awesome 5 Free";
   /* FontAwesome uses font-weight bold */
   font-weight: bold;
}

.ag-theme-alpine .ag-icon-pin::before {
   content: '\\f08d';
}
```

## Replace the Icons by Changing the Icon Font


If you are using a [custom theme](/themes/) in your project, you can use theme parameters to change the icon font. We [provide an example](https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/vanilla) that does this, and the relevant code looks like this:

```scss
@import "~ag-grid-community/src/styles/ag-grid.scss";
@import "~ag-grid-community/src/styles/ag-theme-alpine-mixin.scss";

.ag-theme-alpine {
    @include ag-theme-alpine((
        "icon-font-family": "Font Awesome 5 Free",
        "icons-data": null, // prevent default font from being embedded
        // define icon map - not required when changing between two
        // provided theme fonts, see next code sample for more details
        "icons-font-codes": (
            "aggregation": "\\f247",
            "arrows": "\\f0b2",
            "asc": "\\f062",
            "cancel": "\\f057",
            "chart": "\\f080",
            "color-picker": "\\f576",
            "columns": "\\f0db",
            "contracted": "\\f146",
            "copy": "\\f0c5",
            "cross": "\\f00d",
            "desc": "\\f063",
            "expanded": "\\f0fe",
            "eye-slash": "\\f070",
            "eye": "\\f06e",
            "filter": "\\f0b0",
            "first": "\\f100",
            "grip": "\\f58e",
            "group": "\\f5fd",
            "last": "\\f101",
            "left": "\\f060",
            "linked": "\\f0c1",
            "loading": "\\f110",
            "maximize": "\\f2d0",
            "menu": "\\f0c9",
            "minimize": "\\f2d1",
            "next": "\\f105",
            "none": "\\f338",
            "not-allowed": "\\f05e",
            "paste": "\\f0ea",
            "pin": "\\f276",
            "pivot": "\\f074",
            "previous": "\\f104",
            "right": "\\f061",
            "save": "\\f0c7",
            "small-down": "\\f107",
            "small-left": "\\f104",
            "small-right": "\\f105",
            "small-up": "\\f106",
            "tick": "\\f00c",
            "tree-closed": "\\f105",
            "tree-indeterminate": "\\f068",
            "tree-open": "\\f107",
            "unlinked": "\\f127",
        )
    ));

    .ag-icon {
        // required because Font Awesome uses bold for its icons
        font-weight: bold;
    }
}
```
If you are swapping one theme's icon set for another, you do not need to define an icon map because all theme fonts use the same map. This example shows the use of Alpine with the Material font:


```scss
@import "~ag-grid-community/src/styles/ag-grid.scss";
@import "~ag-grid-community/src/styles/ag-theme-alpine-mixin.scss";

// embed the Material font
@import "~ag-grid-community/src/styles/webfont/agGridMaterialFont.scss";

.ag-theme-alpine {
    @include ag-theme-alpine((
        "icon-font-family": "agGridMaterial", // use Material font
        "icons-data": null, // prevent default Alpine font from being embedded
    ));
}
```


A working project with Sass / Webpack set up to customise an icon set is available in the [ag grid customising theme repository](https://github.com/ag-grid/ag-grid-customise-theme).


## Set the Icons Through gridOptions (JavaScript)


The icons can either be set on the grid options (all icons) or on the column definition (all except group). If defined in both the grid options and column definitions, the column definition will get used. This allows you to specify defaults in the grid options to fall back on, and then provide individual icons for specific columns. This is handy if, for example, you want to include 'A..Z' as string sort icons and just the simple arrow for other columns.

The icons are set as follows:


```js
// header column group shown when expanded (click to contract)
columnGroupOpened
// header column group shown when contracted (click to expand)
columnGroupClosed
// tool panel column group contracted (click to expand)
columnSelectClosed
// tool panel column group expanded (click to contract)
columnSelectOpen
// column tool panel header expand/collapse all button, shown when some children are expanded and
//     others are collapsed
columnSelectIndeterminate
// shown on ghost icon while dragging column to the side of the grid to pin
columnMovePin
// shown on ghost icon while dragging over part of the page that is not a drop zone
columnMoveHide
// shown on ghost icon while dragging columns to reorder
columnMoveMove
// animating icon shown when dragging a column to the right of the grid causes horizontal scrolling
columnMoveLeft
// animating icon shown when dragging a column to the left of the grid causes horizontal scrolling
columnMoveRight
// shown on ghost icon while dragging over Row Groups drop zone
columnMoveGroup
// shown on ghost icon while dragging over Values drop zone
columnMoveValue
// shown on ghost icon while dragging over pivot drop zone
columnMovePivot
// shown on ghost icon while dragging over drop zone that doesn't support it, e.g.
//     string column over aggregation drop zone
dropNotAllowed
// shown on row group when contracted (click to expand)
groupContracted
// shown on row group when expanded (click to contract)
groupExpanded
// context menu chart item
chart
// chart window title bar
close
// X (remove) on column 'pill' after adding it to a drop zone list
cancel
// indicates the currently active pin state in the "Pin column" sub-menu of the column menu
check
// "go to first" button in pagination controls
first
// "go to previous" button in pagination controls
previous
// "go to next" button in pagination controls
next
// "go to last" button in pagination controls
last
// shown on top right of chart when chart is linked to range data (click to unlink)
linked
// shown on top right of chart when chart is not linked to range data (click to link)
unlinked
// "Choose colour" button on chart settings tab
colorPicker
// rotating spinner shown by the loading cell renderer
groupLoading
// button to launch enterprise column menu
menu
// filter tool panel tab
filter
// column tool panel tab
columns
// button in chart regular size window title bar (click to maximise)
maximize
// button in chart maximised window title bar (click to make regular size)
minimize
// "Pin column" item in column header menu
menuPin
// "Value aggregation" column menu item (shown on numeric columns when grouping is active)"
menuValue
// "Group by {column-name}" item in column header menu
menuAddRowGroup
// "Un-Group by {column-name}" item in column header menu
menuRemoveRowGroup
// context menu copy item
clipboardCopy
// context menu paste item
clipboardPaste
// identifies the pivot drop zone
pivotPanel
// "Row groups" drop zone in column tool panel
rowGroupPanel
// columns tool panel Values drop zone
valuePanel
// drag handle used to pick up draggable columns
columnDrag
// drag handle used to pick up draggable rows
rowDrag
// context menu export item
save
// version of small-right used in RTL mode
smallLeft
// separator between column 'pills' when you add multiple columns to the header drop zone
smallRight
// show on column header when column is sorted ascending
sortAscending
// show on column header when column is sorted descending
sortDescending
// show on column header when column has no sort, only when enabled with gridOptions.unSortIcon=true
sortUnSort
```


Setting the icons on the column definitions is identical, except group icons are not used in column definitions.

The icon can be any of the following:

- **String:** The string will be treated as html. Use to return just text, or HTML tags.
- **Function:** A function that returns either a String or a DOM node or element.

## Changing Checkbox and Radio Button Icons


As of version 23, checkboxes and radio buttons are native browser inputs styled using CSS. This means that you can change the appearance of the checkbox with Sass, but not using the JavaScript `gridOptions` technique. Using Sass, you can either change the icon font (set the `checkbox-*` and `radio-button-*` entries in the icon font codes map) or add CSS rules to override the appearance of the checkbox.

## Example


The example below shows a mixture of different methods for providing icons. The grouping is done with images, and the header icons use a mix of Font Awesome and strings.

<grid-example title='Icons' name='icons' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "sidebar", "columnpanel", "filterpanel"], "exampleHeight": 660, "extras": ["fontawesome"] }'></grid-example>

## SVG Icons

When you create your own theme as described in [Customising Themes](/themes-customising/), you are also able to replace the WebFont with SVG Icons. To do that you will need to override the `ag-icon` SASS rules and also the rules for each icon. You can see the example `styles.scss` file in our custom theme with SVG icons example here: [SVG Icons Example](https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/vanilla-svg-icons).

[[note]]
| The grid uses the CSS `color` property to change the colour of icons. This works for webfont-based icons,
| but not for SVG. If you are using SVG for icons, you should ensure that the provided SVG image is already the
| correct colour.

## Provided Theme Icons

Below you can see a list with all available icons for each theme, their names, and download them.

<icons-panel></icons-panel>