<?php
$key = "Grouping";
$pageTitle = "AngularJS Angular Grid Grouping and Aggregation";
$pageDescription = "AngularJS Angular Grid Grouping and Aggregation";
$pageKeyboards = "AngularJS Angular Grid Grouping and Aggregation";
include '../documentation_header.php';
?>

<div>

    <h2>Grouping and Aggregation</h2>

    <p>
        To group, provide the columns you want to group by into the grid options.
        There is no limit on the number of columns that can be used.
        For example, the following groups by country column, then language column:
        <pre>gridOptions.groupKeys = ['country','column'];</pre>
        The identifiers are column ID's (see <a href="/angular-grid-column-definitions/index.php">
        Column Definitions </a> for explanation of column IDs).
    </p>

    <p>
        The gridOption group parameters are as follows:
    </p>
    <table class="table">
        <tr>
            <th>Attribute</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>groupKeys</th>
            <td>An array of 1 or more strings, each entry a column identifier to group by. Leave blank, or empty array, for no grouping.</td>
        </tr>
        <tr>
            <th>groupAggFields</th>
            <td>If grouping, used to create simple 'sum' aggregates. Provide an array of field names that should be
                summed into the parent group. Use this over groupAggFunction if you want simple 'sum' aggregation.
            </td>
        </tr>
        <tr>
            <th>groupAggFunction(nodes, level)</th>
            <td>If grouping, used to create complex aggregates. Provide a function to do the aggregation. Use this
                if the default 'sum/min/max' aggregates provided is not enough.
            </td>
        </tr>
        <tr>
            <th>groupUseEntireRow</th>
            <td>If grouping, set to true or false (default is false). If true, a group row will span all columns across the entire
                width of the table. If false, the cells will be rendered as normal and you will have the opportunity to include
                a grouping column (normally the first on the left) to show the group.</td>
        </tr>
        <tr>
            <th>groupRowRenderer</th>
            <td>If grouping, allows custom rendering of the group cell. Use this if you are not happy with the default
                presentation of the group. This is only used when groupUseEntireRow=true. This gives you full control
                of the row, so the grid will not provide any default expand / collapse or selection checkbox.</td>
        </tr>
        <tr>
            <th>groupRowInnerRenderer</th>
            <td>Similar to groupRowRenderer, except the grid will provide a default shell for row which includes an
                expand / collapse function. The innerRenderer is responsible for just the inside part of the row.</td>
        </tr>
        <tr>
            <th>groupDefaultExpanded</th>
            <td>If grouping, set to true, false or a number (default is false). If true, when data is loaded, groups will be expanded by default.
            If false, they won't. If a number, then the first n levels will be expanded, eg 0 for none, 1 first level only, etc.
            </td>
        </tr>
        <tr>
            <th>groupIncludeFooter</th>
            <td>If grouping, whether to show a group footer when the group is expanded. If true, then by default, the footer
                will contain aggregate data (if any) when shown and the header will be black. When closed, the header will
                contain the aggregate data regardless of this setting (as footer is hidden anyway). This is handy for
                'total' rows, that are displayed below the data when the group is open, and alongside the group when
                it is closed.
            </td>
        </tr>
        <tr>
            <th>groupColumnDef</th>
            <td>If grouping, this column def is included as the first column definition in the grid. If not grouping,
                this column is not included. Defining the grouping here (and not with the rest of your column
                definitions) allows the grid to only show the grouping column when grouping is active, useful when
                the user is turning grouping on and off via the toolpanel.
            </td>
        </tr>
        <tr>
            <th>groupSuppressAutoColumn</th>
            <td>If true, the grid will not swap in the grouping column when grouping is enabled. Use this if you
                want complete control on the column displayed and don't want the grids help.
            </td>
        </tr>
        <tr>
            <th>groupHidePivotColumns</th>
            <td>If true, when a column is pivoted, it is not displayed as a normal column. Useful when you
                don't want the data appearing twice, once is group column, once in normal column.
            </td>
        </tr>
        <tr>
            <th>groupSuppressRow</th>
            <td>If true, the group row won't be displayed and the groups will be expanded by default
                with no ability to expand / contract the groups. Useful when you want to just 'group'
                the rows, but not add parent group row to each group.
            </td>
        </tr>
        <tr>
            <th>groupSuppressBlankHeader</th>
            <td>If true, and showing footer, aggregate data will be displayed at both the header and footer
                levels always. This stops the possibly undesirable behaviour of the header details 'jumping'
                to the footer on expand.
            </td>
        </tr>
    </table>

    <h3>Grouping columns</h3>

    <p>
        If you decide to group using the entire row (groupUseEntireRow = true), then you don't need to use
        grouping columns, and this section is not relevant.
    </p>

    <p>
        If you are using grouping columns, then you need to decide how to display your group column. Below
        shows the different options (all assume gridOptions.groupUseEntireRow = false). A group cell renderer
        is explained in the next section (but used here).
    </p>

    <h4>Option 1 - Simplest but not customisable:</h4>
    <p>
        Let the grid provide the default grouping column. This is the
        quickest way to get started.
        <pre>gridOptions.isgroupSuppressAutoColumn = false; // or undefined
gridOptions.groupColumnDef = null; // or undefined</pre>
        All you have to do is provide your columns as normal and let the grid worry about introducing
        the column to show the group when you are grouping.
    </p>

    <h4>Option 2 - Most Common:</h4>
    <p>
        Tell the grid how you want the optional group column to look. Do this
        by providing a groupColumnDef.
    <p>
    </p>
    <p>
        A group column definition is exactly the same as any other column definition, the only difference is
        the cell renderer will render the cell using the group info. So when defining a group column, be sure
        to either choose the built in group cell renderer, or provide your own cell renderer that takes care
        of the grouping.
    </p>
        <pre>gridOptions.isgroupSuppressAutoColumn = false; // or undefined
gridOptions.groupColumnDef = {
    cellRenderer: {
        renderer: 'group',
        headerName: 'Group Column'
    }
};</pre>
    <p>
        Because a group column is just a normal column, you can provide all the column attributes, such as header name,
        css style and class, field, valueGetter etc. All of these parameters are used as appropriate.
    </p>

    <h4>Option 3 - No Grid Swapping of Columns:</h4>
    <p>
        Tell the grid you don't want it's help, that you will provide the group column yourself, included
        in he main list of columns. If you use this, make sure you do have at least one column showing the
        group, otherwise the grid will not make sense as you will have no way to expand / contract the groups.
    </p>
    <p>
        This method can also be used to have multiple columns to display the groups, useful when you want to split
        the grouping across columns (eg one column is responsible
        for the country grouping, another for the language grouping).
        <pre>gridOptions.isgroupSuppressAutoColumn = true;
gridOptions.groupColumnDef = null; // doesn't matter, won't get used anyway</pre>
    </p>

    <h3>Group Cell Renderer</h3>

    <p>
        If grouping, you will need to dedicate a column to displaying the group, as described above.
        To have the column behave appropriate, you need to provide it with an appropriate cell renderer.
        You can either a) use the built in provided group cell renderer or b) bake your own grouping
        cell renderer. The provided cell renderer is selected by providing a string (the key for this
        group cell renderer, in the future I plan to include other cell renderers) instead of a function
        for the cell renderer.
        <pre>colDef.cellRenderer = {
        renderer: 'group',
        keyMap: {from: 'to'},
        suppressCount: false,
        checkbox: true,
        padding: 10
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
        <li><b>padding:</b> A positive number. The amount of padding, in pixels, to indent each group.</li>
    </ul>
    </p>


    <h3>Grouping Example</h3>

    <p>
        Below shows a simple grouping example, using one attribute to group, the entire row is used
        (so no group column) and no aggregation function.
    </p>

    <show-example example="example1"></show-example>

    <h3>Grouping with Aggregation</h3>

    <p>
        You have three options for creating aggregates.
        <ul>
        <li>
            <b>Option 1 - colDef.aggFunc:</b> Specify in the column definition what aggregation function
            you want to apply to that column. Available aggregation functions are [sum,min,max].
        </li>
        <li>
            <b>Option 2 - gridOptions.groupAggFields:</b> Provide an array of field names that should be used
            to create the aggregates. This is equivalent to specifying aggFunc='sum' on the relevant columns.
            This method has the advantage of aggregating on fields that do not map to columns directly - an
            example may be that the column uses a value getter for which the field is just one parameter.
        </li>
        <li>
            <b>Option 3 - gridOptions.groupAggFunction:</b> provide a function to do the aggregation. This
            gives you full control.
        </li>
        </ul>
    </p>

    <note>
        It is possible to mix option 1 and option 2 (ie both lists of aggregated fields will be combined).
        If you choose option 3, then any configuration towards option 1 and 2 will be ignored.
    </note>

    <h4>Example Option 1 - Summing Fields</h4>

    <p>
        The example below shows simple sum aggregation. The fields gold, silver, bronze and total are aggregated
        using simple sum aggregation.
    </p>
    <p>
        The example also shows the use of a grouping column. The grouping column is specified in the grid options.
        By specifying the grouping column (and not relying on the default column) the column header name is set,
        and also the field to use for the leaf nodes (the athlete name).
    </p>

    <show-example example="example2"></show-example>

    <h4>Example Option 2 - Custom Aggregation Function</h4>

    <p>
        The example below shows a complex custom aggregation over age giving
        a min and a max age. The aggregation function takes an array of rows and returns
        one row that's an aggregate of the passed rows.
    </p>

    <p>
        This example also demonstrates configuring the group column along with the other columns. If the
        grouping was turned off (via the API or the tool panel), the group column would remain in the grid.
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
        It is possible to override the rendering of the group row using <i>groupRowRenderer</i> and
        <i>groupRowInnerRenderer</i>. Use groupRowRenderer to take full control of the row rendering,
        and provide a cellRenderer exactly how you would provide on for custom rendering of cells
        for non-groups.
    </p>
    <p>
        The following pieces of code do the exact same thing:
        <pre><code>
// option 1 - tell the grid to group by row, the grid defaults to using
// the default group cell renderer for the row with default settings.
gridOptions.groupUseEntireRow = true;

// option 2 - this does the exact same as the above, except we configure
// it explicitly rather than letting the grid choose the defaults.
// we tell the grid what renderer to use (the build in renderer) and we
// configure the default renderer with our own inner renderer
gridOptions.groupUseEntireRow = true;
gridOptions.groupRowRenderer: {
    renderer: 'group',
    innerRenderer: function(params) {return params.node.key;},
};

// option 3 - again the exact same. we allow the grid to choose the group
// cell renderer, but we provide our own inner renderer.
gridOptions.groupUseEntireRow = true;
gridOptions.groupRowInnerRenderer: function(params) {return params.node.key;};
</code></pre>
    </p>
    <p>
        The above probably reads a bit confusing. So here are rules to help you choose:
    <ul>
        <li>
            If you are happy with what you get with just setting groupUseEntireRow = true,
            then stick with that, don't bother with the renderers.
        </li>
        <li>
            If you want to change the inside of the renderer, but are happy with the
            expand / collapse etc of the group row, then just set the groupRowInnerRenderer.
        </li>
        <li>
            If you want to customise the entire row, you are not happy with what you
            get for free with the group cell renderer, then set your own renderer
            with groupRowRenderer, or use groupRowRenderer to configure the default
            group renderer.
        </li>
    </ul>
    </p>
    <p>
        Here is an example of taking full control, creating your own renderer. In practice,
        this example is a bit useless, as you will need to add functionality to at least expand
        and collapse the group, however it demonstrates the configuration:
        <pre><code>gridOptions.groupUseEntireRow = true;
gridOptions.groupRowRenderer: function(params) {return params.node.key;};
</code></pre>
    <p>
        This example takes full control also, but uses the provided group renderer
    but configured differently by asking for a checkbox for selection:
        <pre><code>gridOptions.groupUseEntireRow = true;
gridOptions.groupRowRenderer: {
    renderer: 'group',
    checkbox: true,
    // innerRenderer is optional, we could leave this out and use the default
    innerRenderer: function(params) {return params.node.key;},
}
</code></pre>
    </p>

    </p>
    <p>
        Below shows an example of aggregating,
        then using the entire row to give a summary.
    </p>

    <show-example example="example5"></show-example>

    <h3>Suppress Group Row</h3>

    <p>
        By suppressing the group row you don't give users the ability to close the groups by themselves,
        but the rows are grouped and the other functionalities take the grouping into account.
        Sorting, for example, will sort by group.
    </p>

    <show-example example="example6"></show-example>

    <h3>Custom Expand / Contract Icons</h3>

    <p>
        See the section on icons for customising the expand / contract icons.
    </p>

</div>

<?php include '../documentation_footer.php';?>
