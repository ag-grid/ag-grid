---
title: "Status Bar"
enterprise: true
---

The status bar appears below the grid and holds components that typically display information about the data in the grid.

Within the Status Bar you can specify which Status Bar Panels you want to display.

Status Bar Panels allow you to add your own [custom components](/component-status-bar/) to the grid's Status Bar. Use this when the provided status bar panels do not meet your requirements.

## Grid Provided Status Bar Components

The status bar components provided by the grid are as follows:

- `agTotalRowCountComponent`: Provides the total row count.
- `agTotalAndFilteredRowCountComponent`: Provides the total and filtered row count.
- `agFilteredRowCountComponent`: Provides the filtered row count.
- `agSelectedRowCountComponent`: Provides the selected row count.
- `agAggregationComponent`: Provides aggregations on the selected range.

## Configuring the Status Bar

The status bar is configured using the `statusBar` grid option. The option takes a list of components identified by component name, alignment and additionally component parameters.

If `align` is not specified the components will default to being aligned to the right.

`key` is useful for accessing status bar component instances - [see here](/component-status-bar/#accessing-status-bar-panel-instances) for more information.</p>

The snippet below shows a status bar configured with the grid provided components.

<snippet>
const gridOptions = {
    statusBar: {
        statusPanels: [
            {
                statusPanel: 'agTotalAndFilteredRowCountComponent',
                align: 'left',
            }
        ]
    }
}
</snippet>

### Component Alignment

Components can be aligned either to the `left`, in the `center` of the bar or on the `right` (the default). Components within these alignments will be added in the order specified.

### Labels and Number Formats

Labels within the Status Bar (ie. "Rows", "Total Rows", "Average") and number formatters such as the decimal and thousand separators can be changed by using the Grid's Localisation, for more info see [Localisation](/localisation/).

### Simple Status Bar Example

The example below shows a simply configured status bar. Note the following:

- The total and filtered row count is displayed using the `agTotalAndFilteredRowCountComponent` component (aligned to the left).
- The total row count is displayed by the `agTotalRowCountComponent` component (centered).
- The row count after filtering is displayed by the `agFilteredRowCountComponent` component.
- The selected row count is displayed by the `agSelectedRowCountComponent` component.
- When a range is selected (by dragging the mouse over a range of cells) the `agAggregationComponent` displays the summary information Average, Count, Min, Max and Sum. Only Count is displayed if the range contains no numeric data.

<grid-example title='Status Bar Simple' name='status-bar-simple' type='generated' options='{ "enterprise": true, "modules": ["clientside", "statusbar", "range"], "exampleHeight": 640 }'></grid-example>

### Configuring The Aggregation Panel

If you have multiple ranges selected (by holding down <kbd>Ctrl</kbd> while dragging) and a cell is in multiple ranges, the cell will be only included once in the aggregation.

If the cell does not contain a simple number value, then it will not be included in average, min max or sum, however it will still be included in count.

In the grid below, select a range by dragging the mouse over cells and notice the status bar showing the aggregation values as you drag.

<grid-example title='Status Bar' name='status-bar' type='generated' options='{ "enterprise": true, "modules": ["clientside", "statusbar", "range"] }'></grid-example>

By default all of the aggregations available will be displayed but you can configure the aggregation component to only show a subset of the aggregations.

In this code snippet we have configured the aggregation component to only show `min, max and average`:

<snippet>
const gridOptions = {
    statusBar: {
        statusPanels: [
            {
                statusPanel: 'agAggregationComponent',
                statusPanelParams: {
                    // possible values are: 'count', 'sum', 'min', 'max', 'avg'
                    aggFuncs: ['min', 'max', 'avg']
                }
            }
        ]
    }
}
</snippet>

### Accessing Status Panels

Accessing status panel instances is possible using `api.getStatusPanel(key)`. The key will be the value provided in the component configuration (see above), but will default to the component name if not provided.

See [Accessing Status Bar Panel Instances](/component-status-bar/#accessing-status-bar-comp-instances) for more information.

## Configuration with Component Parameters

Some of the status panel components, or your own custom components, can take further parameters. These are provided using `statusPanelParams`.

The snippet below shows a status bar configured with the grid provided aggregation component only. The component is further configured to only show average and sum functions.

<snippet>
const gridOptions = {
    statusBar: {
        statusPanels: [
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

### Example Component Parameters

The example below demonstrates providing parameters to the status bar components. Note the following:

- The component `agAggregationComponent` is provided with parameters `aggFuncs: ['avg', 'sum']`.
- When a range of numbers is selected, only `avg` and `sum` functions are displayed.

<grid-example title='Status Bar Params' name='status-bar-params' type='generated' options='{ "enterprise": true, "modules": ["clientside", "statusbar", "range"] }'></grid-example>

## Status Bar Height

The status bar sizes its height to fit content. That means when no components are visible, the status bar will have zero height - it will not be shown.

To force the the status bar to have a fixed height, add CSS to the status bar div as follows:

```css
.ag-status-bar {
    min-height: 35px;
}
```

## Custom Status Bar Components

Applications that are not using the [Client-Side Row Model](/client-side-model/) or which require bespoke status bar panels can provide their own custom status bar components.

For more details see the following section: [Status Bar Panels (Components)](/component-status-bar/).
