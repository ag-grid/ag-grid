---
title: "Customising Global Styles"
---

You can customise the overall design of the grid using CSS.

The grid exposes many CSS variables that allow you to control its appearance using a small amount of code. For more fine-grained control you can write CSS rules targeting the class names of individual elements:

```css
/* set the background color of many elements across the grid */
.ag-theme-alpine {
    --ag-background-color: #ddd;
}
/* change the font style of a single UI component */
.ag-theme-alpine .ag-header-cell-label {
    font-style: italic;
}
```

[[note]]
| CSS Variable support was added in v28 - if you have upgraded from an earlier version without changing your import paths then you will be using the legacy styles and will not have full CSS variable support. See the notes on [upgrading to v28](/global-style-upgrading-to-v28/).

You can consult the [full list of CSS variables](/global-style-customisation-variables/) or feature customisation under this page in the menu.

