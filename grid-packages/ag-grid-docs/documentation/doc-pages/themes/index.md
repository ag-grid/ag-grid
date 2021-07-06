---
title: "Themes"
---
The grid is styled using CSS, and a theme is a set of CSS rules styling the grid. The grid comes bundled with [Provided Themes](/themes-provided/), or you can create your own.

## Theming the Grid

The grid can be themed using one of the following approaches:

1. Use one of the [Provided Themes](/themes-provided/). This is the most straightforward approach. You can make simple customisations using CSS variables and rules.

1. [Customise Provided Themes](/themes-customising/) using theme parameters and CSS rules. This requires configuring your project to build Sass files and allows you to change elements of the look and feel like colours, padding, and borders.

1. Create your own theme from scratch by extending the base theme. This is the best option for apps that look very different from the provided themes.

[[warning]]
| If you create your own theme, it's name has to follow the `ag-theme-{theme name}` naming convention,
| otherwise the grid's rendering will not detect it as being a valid theme.

## When to Extend the Base Theme

If you extend a provided theme and then very extensively alter it to make a totally different design, you may encounter a couple of issues:


1. If the provided theme contains design elements that you don't want, you need to add CSS rules to remove them.

1. Between releases, we may change some of the implementation details of the provided theme in a way that breaks these rules you have added. For these apps that want a look and feel that is entirely different from our provided  themes, it is appropriate to extend the base theme. The base theme contains the most basic configurable borders  and sensible default padding but otherwise has no opinionated design elements.

[[note]]
| If you extend the base theme but want the icons from a provided theme, this can be done by adding the font from the theme you like. You can find these in the `dist/styles/webfont` folder of the distribution. Link this font into your application and follow the instructions for configuring a custom [icon font](/custom-icons/)

## When Not to Use Themes

Themes are intended to change the overall look and feel of a grid. If you want to style a particular column or a particular header, consider using either cell and header renderers, or applying CSS classes or styles at the column definition level. Sometimes it is possible to achieve the same effect using [custom renderers](/component-types/) as it is with themes. If so, use whichever one makes more sense for you.

