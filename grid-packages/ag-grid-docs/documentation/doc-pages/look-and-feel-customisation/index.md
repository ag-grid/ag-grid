---
title: "Customising Design with CSS"
---

You can customise the look and feel of the grid using CSS.

## CSS Variables

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

Note: CSS Variable support was added in v28 - if you have upgraded from an earlier version without changing your import paths then you will be using the legacy styles and will not have full CSS variable support. See the notes on [upgrading to v28](/look-and-feel-upgrading-to-v28/).

You can consult the [full list of CSS variables](/look-and-feel-customisation-variables/) or check out the guides for customising each feature:

- [Colours & Fonts](/look-and-feel-customisation-colours/) - the overall colour scheme and appearance of data
- [Compactness & Row Height](/look-and-feel-customisation-compactness/) - add more white space or pack more data into a the UI
- [Selections](/look-and-feel-customisation-selections/) - how selected rows and cells appear
- [Headers](/look-and-feel-customisation-headers/) - grid header cells and column groups
- [Borders](/look-and-feel-customisation-borders/) - borders around rows, cells and UI elements
- [Icons](/custom-icons/) - replace built-in icons using icon fonts, SVGs or bitmap images
- [Tool Panels](/look-and-feel-customisation-tool-panels/) - the Filters Tool Panel and Columns Tool Panel
- [Charts](/look-and-feel-customisation-charts/) - the user interface around charts
- [Inputs & Widgets](/look-and-feel-customisation-widgets/) - text inputs, checkboxes, toggle buttons and range sliders
- [Tabs](/look-and-feel-customisation-tabs/) - tabbed UI panels
- [Menus & Popups](/look-and-feel-customisation-popups/) - Popup menus and other floating UI elements

## Creating a Reusable Package of Design Customisations

To create a reusable set of design customisations that can be shared between projects you can use a CSS class that is applied in addition to the theme you're extending:

```html
<!-- grid div applies your class after the theme class -->
<div id="myGrid" class="ag-theme-alpine acmecorp-house-style"></div>
```

```css
/* acmecorp-house-style.css */
.acmecorp-house-style {
    --ag-odd-row-background-color: #aaa;
}
```
