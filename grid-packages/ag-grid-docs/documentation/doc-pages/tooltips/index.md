---
title: "Tooltips"
---
  
Tooltips can be displayed when you hover over the grid's column headers and cells.

<grid-example title='Tooltips' name='tooltips' type='generated' options='{ "modules": true }'></grid-example>

To enable tooltips on columns, set `tooltipField` or `tooltipValueGetter` on the [Column Definition](/column-definitions/).

<interface-documentation interfaceName='ColDef' names='["tooltipField", "tooltipValueGetter"]' config='{"description":"", "suppressTypes": ["ColDefField"]}'></interface-documentation>

## Default Browser Tooltip

If you don't want to use the grid's tooltip component, you can use the `enableBrowserTooltips` config to use the browser's default tooltip. The grid will simply set an element's title attribute to display the tooltip.

The example below demonstrates how to use the default browser tooltips (shown on the `Athlete` and `Country` columns).

<grid-example title='Default Browser Tooltip' name='default-tooltip' type='generated' options='{ "modules": true }'></grid-example>

## Custom Tooltip Component

It is possible to build your own [Custom Tooltip Component](/component-tooltip/).

## Header Tooltips

See [Header Tooltips](/column-headers/#header-tooltips) for how to configure tooltips on column headers.

## Tooltip Show and Hide Delay

By default, when you hover on an item, it will take 2 seconds for the tooltip to be displayed and then 10 seconds for the tooltip to hide. If you need to change these delays, the `tooltipShowDelay` and `tooltipHideDelay` configs should be used, which are set in milliseconds.

<note>
The delays will have no effect if you are using browser tooltips, as they are controlled entirely by the browser.
</note>

## Showing Blank Values

The grid will not show a tooltip if there is no value to show. This is the default behaviour as the simplest form of tooltip will show the value it is provided without any additional information. In this case, it would be strange to show the tooltip with no value as that would show as a blank box.

This can be a problem if you wish a tooltip to display for blank values. For example, you might want to display a tooltip saying "This cell has no value" instead. To achieve this, you should utilise `tooltipValueGetter` to return something different when the value is blank.

The example below shows both displaying and not displaying the tooltip for blank values. Note the following:

- The first three rows have athlete values of `undefined`, `null` and `''` (empty string).
- The column **Athlete Col 1** uses `tooltipField` for the tooltip field. When there is no value (the first three rows) no tooltip is displayed.
- The column **Athlete Col 2** uses `tooltipValueGetter` for the tooltip field. The value getter will return a value (an object) regardless of whether the value to display is empty or not. This ensures the tooltip gets displayed even when no cell value is present.

<grid-example title='Blank Values' name='blank-values' type='generated'></grid-example>

## Example: Tooltips With Row Groups

The example below shows how to use the default tooltip component with group columns. Because the group column has no real field assigned to it, the `tooltipValueGetter` function must be used.


<grid-example title='Row Group Tooltip' name='rowgroups-tooltip' type='generated' options='{ "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel"] }'></grid-example>

## Mouse Tracking

The example below enables mouse tracking to demonstrate a scenario where tooltips need to follow the cursor. To enable this feature, set the `tooltipMouseTrack` to true in the gridOptions.

<grid-example title='Tooltip Mouse Tracking' name='tooltip-mouse-tracking' type='generated'></grid-example>

## Interactive Tooltips

By default, it is impossible to click on tooltips and hovering them has no effect. If `tooltipInteraction=true` is set in the gridOptions, the tooltips will not disappear while being hovered and you will be able to click and select the text within the tooltip.

<snippet>
const gridOptions = {
    tooltipInteraction: true
}
</snippet>

The example below enables tooltip interaction to demonstrate a scenario where tooltips will not disappear while hovered. Note following: 

- Tooltip is enabled for the **Athlete** and **Country** columns.
- Tooltips will not disappear while being hovered.
- Tooltips content can be selected and copied.

<grid-example title='Tooltip Interaction' name='tooltip-interaction' type='generated'></grid-example>
