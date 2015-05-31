<?php
$key = "Grouping";
$pageTitle = "AngularJS Angular Grid Grouping and Aggregation";
$pageDescription = "AngularJS Angular Grid Grouping and Aggregation";
$pageKeyboards = "AngularJS Angular Grid Grouping and Aggregation";
include '../documentation_header.php';
?>

<div>

    <h2>Grouping and Aggregation</h2>

    To do a simple grouping, provide the keys you want to group by into the grid options.
    There is no limit on the number of keys that can be used.
    Grouping can be done on any attribute of the rows, grouping does not have to use
    an attribute that is used by a column.

    <p/>

    The grid option group parameters are as follows:
    <table class="table">
        <tr>
            <th>Attribute</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>groupKeys</th>
            <td>An array of 1 or more strings, each entry an item to group by. Leave blank, or empty array, for no grouping.</td>
        </tr>
        <tr>
            <th>groupUseEntireRow</th>
            <td>If grouping, set to true or false (default is false). If true, group row will use all columns spanning the entire
                width of the table. If false, only the first column will be used to display the group, and the remaining
                columns will render as normal. If no aggregation function (groupAggFunction) is defined, then the additional cells
                in the group row will be blank. If an aggregation function is defined, then the result of the aggregation will be
                used for values in the remaining cells. </td>
        </tr>
        <tr>
            <th>groupInnerCellRenderer</th>
            <td>If grouping, allows custom rendering of the group cell. Use this if you are not  happy with the default
                presentation of the group. This is only used when groupUseEntireRow=true.</td>
        </tr>
        <tr>
            <th>groupDefaultExpanded</th>
            <td>If grouping, set to true, false or a number (default is false). If true, when data is loaded, groups will be expanded by default.
            If false, they won't. If a number, then the first n levels will be expanded, eg 0 for none, 1 first level only, etc.
            </td>
        </tr>
        <tr>
            <th>groupAggFields</th>
            <td>If grouping, used to create simple 'sum' aggregates. Provide an array of field names that should be
                summed into the parent group. Use this over groupAggFunction if you want simple 'sum' aggregation.
            </td>
        </tr>
        <tr>
            <th>groupAggFunction</th>
            <td>If grouping, used to create complex aggregates. Provide a function to do the aggregation. Use this
                if the simple 'sum' aggregates provided is not enough.
            </td>
        </tr>
        <tr>
            <th>groupIncludeFooter</th>
            <td>If grouping, whether to show a group footer when the group is expanded. If true, then by default, the footer
                will container aggregate data (if any) when shown and the header will be black. When closed, the header will
                contain the aggregate data regardless of this setting (as footer is hidden anyway).
            </td>
        </tr>
    </table>

    <h3>Grouping Example</h3>

    <p>
        Below shows a simple grouping example, using one attribute to group, the entire row is used and no aggregation function.
    </p>

    <show-example example="example1"></show-example>


    <h3>Group Cell Renderer</h3>

    <p>
        If grouping, you will need to dedicate a column to displaying the group (unless you are using groupUseEntireRow=true).
        To do this, you specify the gorup cell renderer to the column definition as follows:
        <pre>colDef.cellRenderer = {
        renderer: 'group',
        keyMap: {from: 'to'},
        suppressCount: false,
        checkbox: true
}</pre>

    <p>
        The attributes are:
        <ul>
            <li><b>renderer:</b> This picks the built in renderer, in this case the group renderer. At the time of writing,
                no other built in renderers are provided.</li>
            <li><b>keyMap:</b> Map of key value pairs to display alternatives instead of the group keys. For example,
                if the group was 'LDN', you could display it as 'London'.</li>
            <li><b>suppressCount:</b> One of [true, false], if true, count is not displayed beside the name.</li>
            <li><b>checkbox:</b> One of [true,false], if true, a selection checkbox is included.</li>
        </ul>
    </p>

    <h3>Grouping with Aggregation</h3>

    <p>
        You have two options for creating aggregates.
        <ul>
            <li>
                Option 1 - provide an array of field names that should be summed to create the aggregate.
            </li>
            <li>
                Option 2 - provide an function to do the aggregation.
            </li>
        </ul>
    </p>

    <h4>Example Option 1 - Summing Fields</h4>

    <p>
        The example below shows simple sum aggregation. The fields gold, silver, bronze and total and aggregated
        using simple sum aggregation.
    </p>

    <show-example example="example2"></show-example>

    <h4>Example Option 2 - Custom Aggregation Function</h4>

    <p>
        The example below shows a complex custom aggregation over age giving
        a min and a max age. The aggregation function takes an array of rows and returns
        one row that's an aggregate of the passed rows.
    </p>

    <show-example example="example4"></show-example>


    <h3>Multi-Level Grouping with Aggregation</h3>

    <p>
        There is no limit to the number of fields you group on. The aggregation works regardless of the number
        of levels been grouped. The example below shows multi level aggregation.
    </p>

    <show-example example="example3"></show-example>

    <h3>Grouping Footers</h3>

    <p>
        If you want to include a footer with each group, set the property <i>groupIncludeFooter</i> to true.
        The footer is displayed as the last line of the group when then group is expanded - it is not displayed
        when the group is collapsed.
    </p>
    <p>
        The footer will display the word 'Total' followed by the group key.
    </p>
    <p>
        When showing the groups in one column, the aggregation data is displayed
        in the group header when collapsed, and only in the footer when expanded (ie it moves from the header
        to the footer). To have different rendering, provide a custom <i>groupInnerCellRenderer</i>, where
        the renderer can check if it's a header or footer.
    </p>

    <show-example example="groupingFooters"></show-example>

    <h3>Recomputing Aggregates</h3>

    <p>
        If the data changes after the aggregation is done, you can tell the grid to recompute the aggregates.
        This is through throw the api method <i>recomputeAggregates</i>. For example, if you allow editing,
        and want the aggregates to update as new values are edited, then create code like the following:

        <pre>
        // add a listener to the editable colDef
        colDef.cellValueChanged = function() {
            gridOptions.api.recomputeAggregates();
        }
        </pre>

    </p>

    <h3>Group Row Rendering</h3>

    <p>
        It is possible to override the rendering of the group row. Below shows an example of aggregating,
        then using the entire row to give a summary.
    </p>

    <show-example example="example5"></show-example>

    <h3>Custom Expand / Contract Icons</h3>

    <p>
        See the section on icons for customising the expand / contract icons.
    </p>

</div>

<?php include '../documentation_footer.php';?>
