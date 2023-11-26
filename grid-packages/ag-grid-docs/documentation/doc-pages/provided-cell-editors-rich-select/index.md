---
title: "Rich Select Cell Editor"
enterprise: true
---

An alternative to using the browser's `select` popup for dropdowns inside the grid.

Benefits over browser's `select` are as follows:

- Uses DOM row visualisation so very large lists can be displayed.
- Integrates with the grid perfectly, avoiding glitches seen with the standard select.
- Uses HTML to render the values: you can provide cell renderers to customise what each value looks like.

## Enabling Rich Select Cell Editor

`agRichSelectCellEditor` allows users to enter a cell value from a list of provided values by searching or filtering the list. Edit any cell in the grid below and note the agRichSelectCellEditor is displayed:

<grid-example title='Rich Select Editor' name='rich-select-editor' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect"] }'></grid-example>

Enabled with `agRichSelectCellEditor` and configured with `IRichCellEditorParams`.

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


## Customisation

### Cell Renderer

`agRichSelectCellEditor` item renderer can be customised as shown below:

<grid-example title='Rich Select with Cell Renderer' name='rich-select-cell-renderer' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect"] }'></grid-example>

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

### Search Values

`agRichSelectCellEditor` supports multiple types of search as shown below:

<grid-example title='Rich Select Editor' name='rich-select-search-values' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect"] }'></grid-example>

<snippet transform={false}>
columnDefs: [
    {
        cellEditor: 'agRichSelectCellEditor',
        cellRenderer: ColourCellRenderer,
        cellEditorParams: {
            values: ['AliceBlue', 'AntiqueWhite', 'Aqua', /* .... many colours */ ],
            allowTyping: true,
            filterList: true,
            highlightMatch: true,
            valueListMaxHeight: 220
        }
        // ...other props
    }
]
</snippet>

### Allow Typing

`agRichSelectCellEditor` allows typing inside the input matching different parts of items as shown below:

<grid-example title='Rich Select Editor' name='rich-select-allow-typing' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect"] }'></grid-example>

<snippet transform={false}>
columnDefs: [
    {
        cellEditor: 'agRichSelectCellEditor',
        cellRenderer: ColourCellRenderer,
        cellEditorParams: {
            values: ['AliceBlue', 'AntiqueWhite', 'Aqua', /* .... many colours */ ],
            allowTyping: true,
            filterList: true,
            highlightMatch: true,
            valueListMaxHeight: 220
        }
        // ...other props
    }
]
</snippet>

### Format Values

`agRichSelectCellEditor` allows formatting list items as shown below:

<grid-example title='Rich Select Format Values' name='rich-select-format-values' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect"] }'></grid-example>

<snippet transform={false}>
columnDefs: [
    {
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: ['English', 'Spanish', 'French', 'Portuguese', '(other)'],
            formatValue: value => value.toUpperCase()
        }
        // ...other props
    }
]
</snippet>


## Async Values

`agRichSelectCellEditor` allows providing list values asynchronously as shown below:

<grid-example title='Rich Select Async Values' name='rich-select-async-values' type='generated' options='{ "enterprise": true, "modules": ["clientside", "richselect"] }'></grid-example>

The `values` property can receive a Promise that **resolves** an array of values.

```ts
function getValueFromServer(params: ICellEditorParams): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(['English', 'Spanish', 'French', 'Portuguese', '(other)']), 1000);
  });
}
```

<snippet transform={false}>
columnDefs: [
    {
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: getValueFromServer(),
        }
        // ...other props
    }
]
</snippet>

## API Reference

<interface-documentation interfaceName='IRichCellEditorParams' names='["values", "cellHeight", "cellRenderer", "allowTyping", "filterList", "searchType", "highlightMatch", "valuePlaceholder", "valueListGap", "valueListMaxHeight", "valueListMaxWidth", "formatValue", "searchDebounceDelay" ]'></interface-documentation>


Continue to the next section: [Number Cell Editor](../provided-cell-editors-number/).


