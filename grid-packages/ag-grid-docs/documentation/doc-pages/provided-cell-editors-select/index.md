---
title: "Select Cell Editor"
---

Simple editor that uses HTML `select`.

Specified with `agSelectCellEditor` and configured with `ILargeTextEditorParams`.

<interface-documentation interfaceName='ISelectCellEditorParams' names='["values", "valueListGap", "valueListMaxHeight", "valueListMaxWidth"]'></interface-documentation>

<snippet transform={false}>
columnDefs: [
    {
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
            valueListGap: 0
        }
        // ...other props
    }
]
</snippet>

Note there is no need to specify `cellEditorPopup=true` for Select Cell Editor as the browsers Select widget will appear on top of the grid.

<note>
|We have found the standard HTML Select doesn't have an API that's rich enough to play
|properly with the grid. When a cell is double clicked to start editing, it is desired that
|the Select is a) shown and b) opened ready for selection. There is no API to open a browsers
|Select. For this reason to edit there are two interactions needed 1) double click to start
|editing and 2) single click to open the Select.
|
|We also observed different results while using keyboard navigation to control editing, e.g.
|while using `Enter` to start editing. Some browsers would open the Select, others would not.
|This is down to the browser implementation and given there is no API for opening the
|Select, there is nothing the grid can do.
|
|If you are unhappy with the additional click required, we advise you don't depend on the
|browsers standard Select (ie avoid `agSelectCellEditor`) and instead use `agRichSelectCellEditor` or
|create your own using a [Cell Editor Component](../component-cell-editor/).
</note>

<grid-example title='Select Editor' name='select-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

Continue to the next section: [Rich Select Cell Editor](../provided-cell-editors-rich-select/).