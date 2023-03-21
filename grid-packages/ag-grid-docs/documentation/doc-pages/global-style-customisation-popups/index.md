---
title: "Customising Menus & Popups"
---

Style UI elements that float above the main UI, including menus.

## Rounding corners

- `--ag-border-radius` sets the radius of most rectangular elements within the grid, but not of the grid itself.
- `--ag-card-radius` sets the radius of floating elements (cards and popups) and defaults to the value of `--ag-border-radius`.
- `ag-root-wrapper` is the class name applied to the grid's outer element. Apply a border radius using a CSS selector: `.ag-root-wrapper { border-radius: 2px }`.

## Drop shadows

Elements that float above the user interface are called cards or popups. Internally there is an implementation difference between the two, but they are the same from the user's point of view, so it is appropriate to style them in the same way. To set a drop shadow on all floating elements, set the `--ag-card-shadow` and `--ag-popup-shadow` variables to a [CSS box shadow value](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow):

```css
.ag-theme-alpine {
    --ag-card-shadow: 0 3px 4px black;
    --ag-popup-shadow: 0 3px 4px black;
}
```

## Styling menus

Menus such as the column menu and context menu are cards and so respond to the instructions above for rounded corners and shadows. Additionally:

- the minimum width of the [Column Menu](/column-menu/) can be set by the following variables. If the content is larger the menu will expand to fit.
    - `--ag-menu-min-width` controls the non-tabbed menu used in AG Grid Community.
    - `--ag-tab-min-width` controls the tabbed menu used in AG Grid Enterprise.

- the `ag-tabs` and `ag-tabs-header` classes can be used to style the body and header of tabbed menus. There are many more classes that can target specific elements in the menu, use your browser developer tools to find them.
- the `ag-menu` class can be used to style the body of all menus - tabbed and non-tabbed.
- In the Alpine and Material themes, tabs expand to fit the full width of the available space. To reproduce this in your own custom themes, use the CSS `.ag-tab { flex: 1 1 auto; }`.

## Example

This example combines all of the above techniques to style the column menus. Click on the menu icon in a column header to see a tabbed menu, or right click on the grid for a non-tabbed menu:

```css
.ag-theme-alpine {
    --ag-card-radius: 10px;
    --ag-card-shadow: 0 10px 40px rgb(83, 0, 106);
    --ag-popup-shadow: var(--ag-card-shadow);
    --ag-tab-min-width: 350px;
}

.ag-theme-alpine .ag-menu {
    background-color: rgb(244, 220, 250); /* light purple */
}

.ag-theme-alpine .ag-menu-header {
    background-color: rgb(100, 32, 119); /* dark purple */
}

.ag-theme-alpine .ag-menu-header .ag-icon {
    color: white;
}
```

<grid-example title='Styling Menus' name='styling-menus' type='generated' options='{ "exampleHeight": 450, "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel"]  }'></grid-example>