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

Specified with `agRichSelectCellEditor` and configured with `IRichCellEditorParams`.

<snippet transform={false}>
columnDefs: [
    {
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
        }
        // ...other props
    }
]
</snippet>

<grid-example title='Rich Select Editor' name='rich-select-editor' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect"] }'></grid-example>

## Cell Renderer

<snippet transform={false}>
columnDefs: [
    {
        cellEditor: 'agRichSelectCellEditor',
        cellRenderer: ColourCellRenderer,
        cellEditorParams: {
            values: ['AliceBlue', 'AntiqueWhite', 'Aqua', /* .... many colours */ ],
            cellRenderer: ColourCellRenderer,
            valueListMaxHeight: 220
        }
        // ...other props
    }
]
</snippet>

<grid-example title='Rich Select with Cell Renderer' name='rich-select-cell-renderer' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect"] }'></grid-example>

## Search Values

<grid-example title='Rich Select Editor' name='rich-select-search-values' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect"] }'></grid-example>

## Interface

<interface-documentation interfaceName='IRichCellEditorParams' names='["values", "cellHeight", "cellRenderer", "allowTyping", "filterList", "searchType", "highlightMatch", "valuePlaceholder", "valueListGap", "valueListMaxHeight", "valueListMaxWidth", "formatValue", "searchDebounceDelay" ]'></interface-documentation>


Continue to the next section: [Number Cell Editor](../provided-cell-editors-number/).


