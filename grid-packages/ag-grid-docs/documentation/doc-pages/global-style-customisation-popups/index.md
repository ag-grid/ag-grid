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

Menus such as the column menu and context menu are cards and so respond to the instructions above for rounded corners and shadows. Additionally, the `--ag-menu-min-width` variable sets the minimum width of a menu (menus will always be made large enough to fit their content).

