---
title: "Tooltip Component"
---
 
Tooltip components allow you to add your own tooltips to the grid's column headers and cells. Use these when the provided tooltip component or the default browser tooltip do not meet your requirements.

## Simple Tooltip Component

md-include:simple-tooltip-javascript.md
md-include:simple-tooltip-angular.md
md-include:simple-tooltip-react.md
md-include:simple-tooltip-vue.md

## Example: Custom Tooltip

The example below demonstrates how to provide custom tooltips to the grid. Notice the following:

- The **Custom Tooltip Component** is supplied by name via `colDef.tooltipComponent`.
- The **Custom Tooltip Parameters** (for tooltip background color) are supplied using `colDef.tooltipComponentParams`.
- Tooltips are displayed instantly by setting `tooltipShowDelay` to `0`.
- Tooltips hide in 2000ms by setting `tooltipHideDelay` to `2000`.
- Tooltips will be shown for the `athlete` and `country` columns

<grid-example title='Custom Tooltip Component' name='custom-tooltip-component' type='generated'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<interface-documentation interfaceName='ITooltipParams' ></interface-documentation>

## Registering Custom Tooltip Components

See the [registering custom components](/components/#registering-custom-components) section for details on registering and using custom tooltip components.

## Default Browser Tooltip

If you don't want to use the grid's tooltip component, you can use the `enableBrowserTooltips` config to use the browser's default tooltip. The grid will simply set an element's title attribute to display the tooltip.

## Tooltip Show and Hide Delay

By default, when you hover on an item, it will take 2 seconds for the tooltip to be displayed and then 10 seconds for the tooltip to hide. If you need to change these delays, the `tooltipShowDelay` and `tooltipHideDelay` configs should be used, which are set in milliseconds.

[[note]]
| The delays will have no effect if you are using browser tooltips, as they are controlled entirely by the browser.

## Showing Blank Values

The grid will not show a tooltip if there is no value to show. This is the default behaviour as the simplest form of tooltip will show the value it is provided without any additional information. In this case, it would be strange to show the tooltip with no value as that would show as a blank box.

This can be a problem if you wish a tooltip to display for blank values. For example, you might want to display a tooltip saying "This cell has no value" instead. To achieve this, you should utilise `tooltipValueGetter` to return something different when the value is blank.

The example below shows both displaying and not displaying the tooltip for blank values. Note the following:

- The first three rows have athlete values of `undefined`, `null` and `''` (empty string).
- The column **Athlete Col 1** uses `tooltipField` for the tooltip field. When there is no value (the first three rows) no tooltip is displayed.
- The column **Athlete Col 2** uses `tooltipValueGetter` for the tooltip field. The value getter will return a value (an object) regardless of whether the value to display is empty or not. This ensures the tooltip gets displayed even when no cell value is present.

<grid-example title='Blank Values' name='blank-values' type='generated'></grid-example>

## Header Tooltip with Custom Tooltip

When we want to display a header tooltip, we set the `headerTooltip` config as a `string`, and that string will be displayed as the tooltip. However, when working with custom tooltips we set `colDef.tooltipComponent` to assign the column's tooltip component and the `headerTooltip` value will passed to the `params` object.

[[note]]
| If `headerTooltip` is not present, the tooltip will not be rendered.

The example below shows how to set a custom tooltip to a header and to a grouped header. Note the following:

- The column **Athlete Col 1** does not have a `tooltipComponent` so it will render the value set in its `headerTooltip` config.
- The column **Athlete Col 2** uses `tooltipComponent` so the the value in `headerTooltip` is passed to the tooltipComponent `params` to be used.
- The `tooltipComponent` detects that it's being rendered by a header because the `params` object does not contain a `rowIndex` value.

<grid-example title='Header Custom Tooltip' name='header-tooltip' type='generated'></grid-example>

## Example: Tooltips With Row Groups

The example below shows how to use the default tooltip component with group columns. Because the group column has no real field assigned to it, the `tooltipValueGetter` function must be used.


<grid-example title='Row Group Tooltip' name='rowgroups-tooltip' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel"] }'></grid-example>

## Mouse Tracking

The example below enables mouse tracking to demonstrate a scenario where tooltips need to follow the cursor. To enable this feature, set the `tooltipMouseTrack` to true in the gridOptions.

<grid-example title='Tooltip Mouse Tracking' name='tooltip-mouse-tracking' type='generated' options='{ "extras": ["bootstrap"] }'></grid-example>

## Example: Using Browser Tooltips

The example below demonstrates how to use the default browser tooltips.

<grid-example title='Default Browser Tooltip' name='default-tooltip' type='generated' options='{ "modules": true }'></grid-example>

