---
title: "Rich Select Cell Editor"
enterprise: true
---

An alternative to using the browser's `select` popup for dropdowns inside the grid.

The Rich Select Cell Editor allows users to enter a cell value from a list of provided values by searching or filtering the list.

## Enabling Rich Select Cell Editor

Edit any cell in the grid below to see the Rich Select Cell Editor.

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

Benefits over browser's `select` are as follows:

- Uses DOM row virtualisation so very large lists can be displayed.
- Integrates with the grid perfectly, avoiding glitches seen with the standard select.
- Uses HTML to render the values: you can provide cell renderers to customise what each value looks like.

## Customisation

### Cell Renderer

The cell renderer used within the editor can be customised as shown below:

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

Different types of search are possible within the editor list as shown below:

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

The editor input can be configured to allow text input, which is used to match different parts of the editor list items as shown below:

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

Items in the editor list can be formatted as shown below:

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

List values can be provided asynchronously to the editor as shown below:

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


