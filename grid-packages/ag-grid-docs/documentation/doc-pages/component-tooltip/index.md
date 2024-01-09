---
title: "Tooltip Component"
---
  
Tooltip components allow you to add your own [Tooltips](/tooltips/) to the grid's column headers and cells. Use these when the provided tooltip component or the [Default Browser Tooltip](/tooltips/#default-browser-tooltip) do not meet your requirements.

The example below demonstrates how to provide custom tooltips to the grid. Notice the following:

- The **Custom Tooltip Component** is supplied by name via `colDef.tooltipComponent`.
- The **Custom Tooltip Parameters** (for tooltip background color) are supplied using `colDef.tooltipComponentParams`.
- Tooltips are displayed instantly by setting `tooltipShowDelay` to `0`.
- Tooltips hide in 2000ms by setting `tooltipHideDelay` to `2000`.
- Tooltips will be shown for the `athlete` and `country` columns

<grid-example title='Custom Tooltip Component' name='custom-tooltip-component' type='generated'></grid-example>

## Implementing a Tooltip Component

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

## Registering Custom Tooltip Components

See [Registering Custom Components](/components/#registering-custom-components) for details on registering and using custom tooltip components.

## Header Tooltip with Custom Tooltip

When we want to display a header tooltip, we set the `headerTooltip` config as a `string`, and that string will be displayed as the tooltip. However, when working with custom tooltips we set `colDef.tooltipComponent` to assign the column's tooltip component and the `headerTooltip` value will passed to the `params` object.

<note>
If `headerTooltip` is not present, the tooltip will not be rendered.
</note>

The example below shows how to set a custom tooltip to a header and to a grouped header. Note the following:

- The column **Athlete Col 1** does not have a `tooltipComponent` so it will render the value set in its `headerTooltip` config.
- The column **Athlete Col 2** uses `tooltipComponent` so the the value in `headerTooltip` is passed to the tooltipComponent `params` to be used.
- The `tooltipComponent` detects that it's being rendered by a header because the `params` object does not contain a `rowIndex` value.

<grid-example title='Header Custom Tooltip' name='header-tooltip' type='generated'></grid-example>

## Interactive Custom Tooltips

The example below enables tooltip interaction with custom tooltips. Note following:

- Tooltip is enabled for the Athlete and Country columns.
- Tooltips will not disappear while being hovered.
- The custom tooltip displays a text input and a Submit button which when clicked, updates the value of the `Athlete` Column cell in the hovered row and then closes itself by calling `hideTooltipCallback()`.

<grid-example title='Custom Tooltip Interaction' name='custom-tooltip-interaction' type='generated'></grid-example>
