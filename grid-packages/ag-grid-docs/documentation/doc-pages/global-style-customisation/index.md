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

You can consult the [full list of CSS variables](/global-style-customisation-variables/).

## Creating a Reusable Package of Design Customisations

To create a reusable set of design customisations that can be shared between projects you can use a CSS class that is applied in addition to the theme you're modifying. The name of this class must begin with `ag-theme-`.

The grid wrapper element should specify both the class name of the theme you're modifying, and the name of the custom theme.

```html
<!-- grid div applies your class after the theme class -->
<div id="myGrid" class="ag-theme-alpine ag-theme-acmecorp"></div>
```

```css
/* ag-theme-acmecorp.css */
.ag-theme-acmecorp {
    --ag-odd-row-background-color: #aaa;
}
```
