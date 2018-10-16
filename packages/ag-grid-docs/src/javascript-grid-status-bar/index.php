<?php
$pageTitle = "Status Bar: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Status Bar. The Status Bar appears on the bottom of the grid and shows aggregations (sum, min, max etc.) when you select a range of cells using range selection. This is similar to what happens in Excel. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid JavaScript Grid Status Bar";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Status Bar</h1>

<p class="lead">The status bar appears below the grid and holds components that
    typically display information about the data in the grid.</p>

<p>Within the Status Bar you can specify which Status Bar Panels you want to display. </p>

<p>
    Status Bar Panels allow you to add your own components to the grid's Status Bar. Use this when the provided
    status bar panels do not meet your requirements.
</p>


<h2>Grid Provided Status Bar Components</h2>

<p>
    The status bar components provided by the grid are as follows:
    <ul>
    <li>
        <code>agTotalRowCountComponent</code>: Provides the total row count.
    </li>
    <li>
        <code>agTotalAndFilteredRowCountComponent</code>: Provides the total and filtered row count.
    </li>
    <li>
        <code>agFilteredRowCountComponent</code>: Provides the filtered row count.
    </li>
    <li>
        <code>agSelectedRowCountComponent</code>: Provides the selected row count.
    </li>
    <li>
        <code>agAggregationComponent</code>: Provides aggregations on the selected range.
    </li>
</ul>
</p>

<h2>Configuring the Status Bar</h2>

<p>
    The status bar is configured using the <code>statusBar</code> grid option.
    The option takes a list of components identified by component name, alignment and additionally
    component parameters.
</p>

<p>If <code>align</code> is not specified the components will default to being aligned to the right.</p>
<p><code>key</code> is useful for accessing status bar component instances - see <a href="#accessing-status-bar-comp-instances">below</a>
for more information.</p>

<p>
    The snippet below shows a status bar configured with the grid provided
    components.
</p>

<snippet>
gridOptions: {
    statusBar: {
        statusPanels: [
            { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' }
        ]
    }
    // ...other grid properties
}
</snippet>

<h3>Component Alignment</h3>

<p>Components can be aligned either to the <code>left</code>, in the <code>center</code> of the bar or on the
    <code>right</code> (the default). Components within these alignments will be added in the order specified.</p>

<h3>Simple Status Bar Example</h3>

<p>
    The example below shows a simply configured status bar. Note the following:
<ul>
    <li>
        The total row count is displayed by the <code>agTotalRowCountComponent</code> component, aligned to the left.
    </li>
    <li>
        The row count after filtering is displayed by the <code>agFilteredRowCountComponent</code> component.
    </li>
    <li>
        The selected row count is displayed by the <code>agSelectedRowCountComponent</code> component.
    </li>
    <li>
        When a range is selected (by dragging the mouse over a range of cells) the
        <code>agAggregationComponent</code> displays the summary information
        Average, Count, Min, Max and Sum. Only Count is displayed if the range contains
        no numeric data.
    </li>
</ul>
</p>

<?= example('Status Bar Simple', 'status-bar-simple', 'generated', array("enterprise" => 1)) ?>

<h3>Configuring The Aggregation Panel</h3>

<p>If you have multiple ranges selected (by holding down ctrl while dragging) and a cell is in multiple
    ranges, the cell will be only included once in the aggregation.</p>

<p>If the cell does not contain a simple number value, then it will not be included in average, min max or sum,
    however it will still be included in count.</p>

<p>In the grid below, select a range by dragging the mouse over cells and notice the status bar
    showing the aggregation values as you drag.</p>

<?= example('Status Bar', 'status-bar', 'generated', array("enterprise" => 1)) ?>

<p>By default all of the aggregations available will be displayed but you can configure the aggregation component to only
    show a subset of the aggregations.</p>

<p>In this code snippet we have configured the aggregation component to only show <code>min, max and average</code>:</p>

<snippet>
gridOptions: {
    statusBar: {
        statusPanels: [
            {
                statusPanel: 'agAggregationComponent',
                statusPanelParams: {
                    // possible values are: 'count', 'sum', 'min', 'max', 'avg'
                    aggFuncs: ['min', 'max', 'average']
                }
            }
        ]
    }
    // ...other grid properties
}
</snippet>

<h3 id="accessing-status-panels">Accessing Status Panels</h3>

<p>Accessing status panel instances is possible using <code>api.getStatusPanel(key)</code>. The key will be the
value provided in the component configuration (see above), but will default to the component name if not provided.</p>

<p>See <a href="../javascript-grid-status-bar-component#accessing-status-bar-comp-instances">Accessing Status Bar
        Panel Instances</a> for more information.</p>

<h2>Configuration with Component Parameters</h2>

<p>
    Some of the status panel components, or your own custom components,
    can take further parameters. These are provided using
    <code>componentParams</code>.
</p>

<p>
    The snippet below shows a status bar configured with the grid provided
    aggregation component only. The component is further configured to only
    show average and sum functions.
</p>

<snippet>
gridOptions: {
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
    // ...other grid properties
}
</snippet>

<h3>Example Component Parameters</h3>

<p>
    The example below demonstrates providing parameters to the status bar components.
    Note the following:
    <ul>
        <li>
            The component <code>agAggregationComponent</code> is provided with
            parameters <code>aggFuncs: ['avg', 'sum']</code>.
        </li>
        <li>
            When a range of numbers is selected, only <code>avg</code> and <code>sum</code>
            functions are displayed.
        </li>
    </ul>
</p>

<?= example('Status Bar Params', 'status-bar-params', 'generated', array("enterprise" => 1)) ?>

<h2>Status Bar Height</h2>

<p>
    The status bar sizes it's height to fit content. That means when not components are visible, the
    status bar will have zero height - it will not be shown.
</p>

<p>
    The have the status bar with a fixed height, add CSS to the status bar div as follows:
</p>

<code>
.ag-status-bar {
    min-height: 35px;
}
</code>

<p>To build your own status bar component please see the section on <a href="../javascript-grid-status-bar-component">
        Status Bar Panels (Components)</a>.</p>

<?php include '../documentation-main/documentation_footer.php';?>
