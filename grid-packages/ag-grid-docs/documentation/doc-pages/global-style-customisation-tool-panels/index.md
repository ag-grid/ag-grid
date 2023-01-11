---
title: "Customising Tool Panels"
---

Style the Filters [Tool Panel](/component-tool-panel/) and [Columns Tool Panel](/tool-panel-columns/).

## Styling the Tool Panel Area

The Tool Panel is a tabbed container. It exposes CSS variables:

```css
.ag-theme-alpine {
    --ag-control-panel-background-color: rgb(228, 197, 203);
    --ag-side-button-selected-background-color: rgb(228, 197, 203);

    --ag-selected-tab-underline-color: deeppink;
    --ag-selected-tab-underline-width: 2px;
    --ag-selected-tab-underline-transition-speed: 0.5s;

    --ag-side-bar-panel-width: 300px;
}
```

<grid-example title='Tool Panel Area Styling' name='tool-panel-tabs' type='generated' options='{ "exampleHeight": 450, "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel", "filterpanel"]  }'></grid-example>

## Styling the Columns Tool Panel

The `--ag-column-select-indent-size` CSS Variable sets the indent of each column group within the columns tool panel. For further customisation, use CSS selectors.

This example demonstrates changing the column indent and the style of the column drop component in the Row Groups area:

```css
.ag-theme-alpine {
    --ag-column-select-indent-size: 40px
}

.ag-theme-alpine .ag-column-drop-cell {
    background-color: purple;
}

.ag-theme-alpine .ag-column-drop-cell .ag-icon {
    color: white;
}

.ag-theme-alpine .ag-column-drop-cell-text {
    color: white;
    font-weight: bold;
}
```

<grid-example title='Columns Tool Panel' name='column-tool-panel' type='generated' options='{ "exampleHeight": 450, "enterprise": true, "modules": ["clientside", "rowgrouping", "menu", "setfilter", "columnpanel"]  }'></grid-example>
