---
title: "Rich Select Cell Editor"
enterprise: true
---

An alternative to using the browser's `select` popup for dropdowns inside the grid. Available in AG Grid Enterprise only. 

Benefits over browser's `select` are as follows:

- Uses DOM row visualisation so very large lists can be displayed.
- Integrates with the grid perfectly, avoiding glitches seen with the standard select.
- Uses HTML to render the values: you can provide cell renderers to customise what each value looks like.
- FuzzySearch of values: You can type within the Editor to select a specific record.

<framework-specific-section frameworks="react">
|Should always set `cellEditorPopup=true`. Otherwise the editor will be clipped to the cell contents.
</framework-specific-section>

Specified with `agRichSelectCellEditor` and configured with `IRichCellEditorParams`.

<interface-documentation interfaceName='IRichCellEditorParams' names='["values", "cellHeight", "cellRenderer", "allowTyping", "filterList", "searchType", "highlightMatch", "valuePlaceholder", "valueListGap", "valueListMaxHeight", "valueListMaxWidth", "formatValue", "searchDebounceDelay" ]'></interface-documentation>

<snippet transform={false}>
columnDefs: [
    {
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
            cellHeight: 20,
            formatValue: value => value.toUpperCase(),
            cellRenderer: MyCellRenderer,
            searchDebounceDelay: 500
        }
        // ...other props
    }
]
</snippet>

<grid-example title='Rich Select Editor' name='rich-select-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

Continue to the next section: [Number Cell Editor](../provided-cell-editors-number/).


