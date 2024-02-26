---
title: "Status Bar"
enterprise: true
---

The Status Bar appears below the grid and contains Status Bar Panels. Panels can be Grid Provided Panels or Custom Status Bar Panels.

Configure the Status Bar with the `statusBar` grid property. The property takes a list of Status Bar Panels.

<snippet>
const gridOptions = {
    statusBar: {
        statusPanels: [
            { statusPanel: 'agTotalAndFilteredRowCountComponent' },
            { statusPanel: 'agTotalRowCountComponent' },
            { statusPanel: 'agFilteredRowCountComponent' },
            { statusPanel: 'agSelectedRowCountComponent' },
            { statusPanel: 'agAggregationComponent' }
        ]
    }
}
</snippet>

Some Status Panels only show when a Range Selection is present.

<grid-example title='Status Bar Simple' name='status-bar-simple' type='generated' options='{ "enterprise": true, "modules": ["clientside", "statusbar", "range"] }'></grid-example>


## Provided Panels

The Status Bar Panels provided by the grid are as follows:

- `agTotalRowCountComponent`: Provides the total row count.
- `agTotalAndFilteredRowCountComponent`: Provides the total and filtered row count.
- `agFilteredRowCountComponent`: Provides the filtered row count.
- `agSelectedRowCountComponent`: Provides the selected row count.
- `agAggregationComponent`: Provides aggregations on the selected range.

## Configuration

The `align` property can be `left`, `center` or `right` (default).

The `key` is used for [Accessing Panel Instances](#accessing-instances) via the grid API `getStatusPanel(key)`. This can be useful for interacting with Custom Panels.

Additional `props` are passed to Status Panels using `statusPanelParams`. The provided panel `agAggregationComponent` can have `aggFuncs` passed.

<snippet>
const gridOptions = {
    statusBar: {
        statusPanels: [
            {
                key: 'aUniqueString',
                statusPanel: 'agTotalRowCountComponent',
                align: 'left'
            },
            {
                statusPanel: 'agAggregationComponent',
                statusPanelParams: {
                    // possible values are: 'count', 'sum', 'min', 'max', 'avg'
                    aggFuncs: ['avg', 'sum']
                }
            }
        ]
    }
}
</snippet>

Labels (e.g. "Rows", "Total Rows", "Average") and number formatting are changed using the grid's [Localisation](/localisation/).

The Aggregation Panel `agAggregationComponent` will only work on number values.

<grid-example title='Status Bar Params' name='status-bar' type='generated' options='{ "enterprise": true, "modules": ["clientside", "statusbar", "range"] }'></grid-example>

The Status Bar sizes its height to fit content. When no panels are visible, the Status Bar will have zero height (not be shown). Add CSS to have a fixed height on the Status Bar.

```css
.ag-status-bar {
    min-height: 35px;
}
```

## Custom Panels

<grid-example title='Custom Panels' name='custom-component' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "statusbar", "range"] }'></grid-example>

md-include:component-interface-javascript.md
md-include:component-interface-angular.md
md-include:component-interface-react.md
md-include:component-interface-vue.md

<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='IStatusPanelParams'></interface-documentation>
</framework-specific-section>
<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomStatusPanelProps'></interface-documentation>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>If you do not enable the grid option `reactiveCustomComponents`, it is still possible to use custom status bar panels. However your status bar panel will not update with prop changes, but will instead be destroyed/recreated..</note>
</framework-specific-section>

Custom Panels are configured alongside Provided Panels.

md-include:configure-javascript.md
md-include:configure-angular.md
md-include:configure-react.md
md-include:configure-vue.md

Custom Panels can listen to grid events to react to grid changes. An easy way to listen to grid events from inside a Status Panel is using the API provided via `props`.

md-include:init-javascript.md
md-include:init-angular.md
md-include:init-react.md
md-include:init-vue.md

## Accessing Instances

Use the grid API `getStatusPanel(key)` to access a panel instance. This can be used to expose Custom Panels to the application.

<grid-example title='Get Status Bar Panel Instance' name='component-instance' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "statusbar", "range"] }'></grid-example>
