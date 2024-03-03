---
title: "Tooltips"
---

Tooltips can be set for Cells and Column Headers.

<grid-example title='Tooltips' name='tooltips' type='generated' options='{ "modules": true }'></grid-example>

The following [Column Definition](/column-definitions/) properties set Tooltips:

<interface-documentation interfaceName='ColDef' names='["tooltipField", "tooltipValueGetter","headerTooltip"]' config='{"description":"", "suppressTypes": ["ColDefField"]}'></interface-documentation>

## Custom Component

The grid does not use the browsers default tooltip, instead it has a rich HTML Tooltip Component. The default Tooltip Component can be replaced with a Custom Tooltip Component using `colDef.tooltipComponent`.

In the example below:

- `tooltipComponent` is set on the Default Column Definition so it applies to all Columns.
- `tooltipComponentParams` is set on the Athlete Column Definition to provide a Custom Property, in this instance setting the background color.

<grid-example title='Custom Tooltip Component' name='custom-tooltip-component' type='generated'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='ITooltipParams'></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomTooltipProps'></interface-documentation>
</framework-specific-section>

## Browser Tooltip

Set the grid property `enableBrowserTooltips=true` to stop using rich HTML Components and use the browsers native tooltip.

<grid-example title='Default Browser Tooltip' name='default-tooltip' type='generated' options='{ "modules": true }'></grid-example>


## Show and Hide Delay

Tooltips show after 2 seconds and hide after 10 seconds. Set `tooltipShowDelay` and `tooltipHideDelay` to override these values. The example below has `tooltipShowDelay=0` (shows immediatly) and `tooltipHideDelay=2000` (hides in 2,000 milliseconds, or 2 seconds).

<grid-example title='Show Hide Delay' name='show-hide-delay' type='generated' options='{ "modules": true }'></grid-example>

<note>
Setting delays will have no effect if using Browser Tooltips as Browser Tooltips are controlled by the browser and not the grid.
</note>


## Blank Values

The grid will not show a tooltip if there is no value to show. This is the default behaviour as the simplest form of tooltip will show the value it is provided without any additional information. In this case, it would be strange to show the tooltip with no value as that would show as a blank box.

This can be a problem if you wish a tooltip to display for blank values. For example, you might want to display a tooltip saying "This cell has no value" instead. To achieve this, you should utilise `tooltipValueGetter` to return something different when the value is blank.

The example below shows both displaying and not displaying the tooltip for blank values. Note the following:

- The first three rows have athlete values of `undefined`, `null` and `''` (empty string).
- The first Column uses `tooltipField` for the tooltip field. When there is no value (the first three rows) no tooltip is displayed.
- The second Column uses `tooltipValueGetter` for the tooltip field. The value getter will return a value (an object) regardless of whether the value to display is empty or not. This ensures the tooltip gets displayed even when no cell value is present.

<grid-example title='Blank Values' name='blank-values' type='generated'></grid-example>

## Row Groups

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

The example below enables Tooltip Interaction to demonstrate a scenario where tooltips will not disappear while hovered. Note following: 

- Tooltips will not disappear while being hovered.
- Tooltips content can be selected and copied.

<grid-example title='Tooltip Interaction' name='tooltip-interaction' type='generated'></grid-example>

The example below shows Tooltip Interaction with Custom Tooltips. Note the following:

- Tooltip is enabled for the Athlete and Age columns.
- Tooltips will not disappear while being hovered.
- The custom tooltip displays a text input and a Submit button which when clicked, updates the value of the `Athlete` Column cell in the hovered row and then closes itself by calling `hideTooltipCallback()`.

<grid-example title='Custom Tooltip Interaction' name='custom-tooltip-interaction' type='generated'></grid-example>
