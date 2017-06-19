<?php
$key = "Grouping";
$pageTitle = "ag-Grid Grouping and Aggregation";
$pageDescription = "ag-Grid Grouping and Aggregation";
$pageKeyboards = "ag-Grid Grouping and Aggregation";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2><img src="../images/enterprise_50.png" title="Enterprise Feature"/> Grouping Rows</h2>

    <p>
        To group, mark the column definitions you want to group by with a rowGroupIndex.
        There is no limit on the number of columns that can be used.
        For example, the following groups by country column, then language column:
        <pre>gridOptions.columnDefs = [
    {field: 'country', rowGroupIndex: 0},
    {field: 'language', rowGroupIndex: 1}
];</pre>
    </p>

    <h3>Grouping Auto Column</h3>

    <p>If row grouping is active, by default the grid will provide an additional column for displaying
    a tree structure, with expand / collapse navigation, for displaying the groups.</p>

    <p>
        The auto column only displaying when row grouping is active is useful when
        the user is turning grouping on and off via the toolpanel.
    </p>

    <h3>Grid Grouping Properties</h3>
    <p>
        Grouping has the following grid properties (set these as grid properties, e.g. on the gridOptions, not on the columns):
    </p>
    <table class="table">
        <tr>
            <th>Property</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>groupUseEntireRow</th>
            <td>If grouping, set to true or false (default is false). If true, a group row will span all columns across the entire
                width of the table. If false, the cells will be rendered as normal and you will have the opportunity to include
                a grouping column (normally the first on the left) to show the group.</td>
        </tr>
        <tr>
            <th>groupDefaultExpanded</th>
            <td>If grouping, set to the number of levels to expand by default.
                Eg 0 for none, 1 first level only, etc. Default is 0 (expand none).
                Set to -1 for expand everything.
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
            <td>Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column def is included as the first column definition in the grid. If not grouping,
                this column is not included.
            </td>
        </tr>
        <tr>
            <th>groupSuppressAutoColumn</th>
            <td>If true, the grid will not swap in the grouping column when grouping is enabled. Use this if you
                want complete control on the column displayed and don't want the grids help. In other words,
                you already have a column in your column definitions that is responsible for displaying the groups.
            </td>
        </tr>
        <tr>
            <th>groupMultiAutoColumn</th>
            <td>If using auto column, set to true to have each group in it's own column separate column, eg
                if group by Country then Year, two auto columns will be created, one for country and one for year.</td>
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
        <tr>
            <th>groupSelectsChildren</th>
            <td>When true, if you select a group, the the children of the group will also get selected.</td>
        </tr>
        <tr>
            <th>groupSelectsFiltered</th>
            <td>If using groupSelectsChildren, then only the children that pass the current filter will get selected.</td>
        </tr>
        <tr>
            <th>groupRemoveSingleChildren</th>
            <td>Set to true to collapse groups that only have one child.</td>
        </tr>
        <tr>
            <th>groupHideOpenParents</th>
            <td>Set to true to hide parents that are open. When used with multiple columns for showing
                groups, it can give more pleasing user experience.</td>
        </tr>
        <tr>
            <th>animateRows</th>
            <td>
                Set to true to enable animation of the rows after group is opened and closed.
            </td>
        </tr>

    </table>

    <table class="table">
        <tr>
            <th>Callback</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>groupRowRenderer, groupRowRendererParams</th>
            <td>If grouping, allows custom rendering of the group cell. Use this if you are not happy with the default
                presentation of the group. This is only used when groupUseEntireRow=true. This gives you full control
                of the row, so the grid will not provide any default expand / collapse or selection checkbox.
                See section on cellRendering for details on params.</td>
        </tr>
        <tr>
            <th>groupRowInnerRenderer</th>
            <td>Similar to groupRowRenderer, except the grid will provide a default shell for row which includes an
                expand / collapse function. The innerRenderer is responsible for just the inside part of the row.
                There is no <i>groupRowInnerRendererParams</i> as the <i>groupRowRendererParams</i> are reused
                for both</td>
        </tr>

    </table>

    <h3>Simple Example</h3>

    <p>
        To get the discussion going, below is presented a simple grouping example where all the data is
        grouped by country. You will also notice:
        <ul>
            <li>The group parent row has no cells, it spans the full width of the grid.</li>
            <li>Animation is turned for when groups open and close.</li>
            <li>The 'Toggle Zimbabwe' button at the top uses the grid's API to open and close the group.</li>
        </ul>
    </p>

    <show-example example="exampleRowGroup"></show-example>

    <h3>Grouping Columns vs Full Width Groups</h3>

    <p>
        You can represent group rows in your grid in two ways:
        <ol>
            <li><b>Grouping Column</b>: One column (usually the left most column) will display the group
            information with the expand / contract icons. The row then display the rest of the cells
            as normal (eg if a sum aggregate was used, it could be displayed in the other cells).
            This is what is used in the main <a href="../example.php">ag-Grid demo</a>.</li>
            <li><b>Full Width Groups</b>: The group row does not use the cells, instead on cell
                for the group spans the entire width of the grid. This is used in the first example above.
            </li>
        </ol>
    </p>

    <h3>Grouping Columns</h3>

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
        <pre>gridOptions.groupSuppressAutoColumn = false; // or undefined
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
        <pre>gridOptions.groupSuppressAutoColumn = false; // or undefined
gridOptions.groupColumnDef = {
    cellRenderer: 'group',
    headerName: 'Group Column'
};</pre>
    <p>
        Because a group column is just a normal column, you can provide all the column attributes, such as header name,
        css style and class, field, valueGetter etc. All of these parameters are used as appropriate. The example
        above uses the provided 'group' cellRenderer - you can also use this, or you can build your own cellRenderer
        from scratch.
    </p>

    <h4>Option 3 - No Grid Swapping of Columns:</h4>
    <p>
        Tell the grid you don't want it's help, that you will provide the group column yourself, included
        in the main list of columns. If you use this, make sure you do have at least one column showing the
        group, otherwise the grid will not make sense as you will have no way to expand / contract the groups.
    </p>
    <p>
        This method can also be used to have multiple columns to display the groups, useful when you want to split
        the grouping across columns (eg one column is responsible
        for the country grouping, another for the language grouping).
        <pre>gridOptions.groupSuppressAutoColumn = true;
gridOptions.groupColumnDef = null; // doesn't matter, won't get used anyway</pre>
    </p>

    <h3>Group Cell Renderer</h3>

    <p>
        If grouping, you will need to dedicate a column to displaying the group, as described above.
        To have the column behave appropriate, you need to provide it with an appropriate cell renderer.
        You can either a) use the built in provided group cell renderer or b) bake your own grouping
        cell renderer. The provided cell renderer is selected by providing the string 'group' for
        the cellRenderer. You also provide params with options as follows:
        <pre>colDef.cellRenderer = 'group';
colDef.cellRendererParams = {
        keyMap: {from: 'to'},
        suppressCount: false,
        checkbox: true,
        padding: 10,
        innerRenderer: myInnerRenderer,
        footerValueGetter: myFooterValueGetter
};</pre>

    <p>
        The parameters are:
    <ul>
        <li><b>keyMap:</b> Map of key value pairs to display alternatives instead of the group keys. For example,
            if the group was 'LDN', you could display it as 'London'.</li>
        <li><b>suppressCount:</b> One of [true, false], if true, count is not displayed beside the name.</li>
        <li><b>checkbox:</b> One of [true,false], if true, a selection checkbox is included.</li>
        <li><b>padding:</b> A positive number. The amount of padding, in pixels, to indent each group.</li>
        <li><b>suppressPadding:</b> Set to true to node including any padding (indentation) in the child rows.</li>
        <li><b>innerRenderer:</b> The renderer to use for inside the cell (after grouping functions are added).</li>
        <li><b>footerValueGetter:</b> The value getter for the footer text. Can be a function or expression.</li>
        <li><b>restrictToOneGroup:</b> If true, the column will only show one level of group, eg 'Country', and then another column will show 'Language'.</li>
    </ul>
    </p>

    <h3 id="manyGroupColumns">One Or Many Group Columns</h3>

    <p>
        Depending on your preference, when showing multiple levels of groups, you can have one column showing
        all grouping levels, or one column per grouping level. To have a group column only show one level of groups,
        set <i>restrictToOneGroup=true</i>.
    </p>

    <p>
        Below are two similar examples. The first shows the groups in one column. The second has a dedicated column
        for each group.
    </p>

    <h3>Example - Explicitly Configure One Group Column</h3>

    <show-example example="exampleGroupingOneGroupColumns"></show-example>

    <h3>Example - Explicitly Configure Many Group Columns</h3>

    <show-example example="exampleGroupingManyGroupColumns"></show-example>

    <h3>Example - Auto Configure Many Group Columns</h3>

    <show-example example="exampleGroupingAutoManyGroupColumns"></show-example>

    <h3 id="replacingChildren">Replacing Groups with Children When Open</h3>

    <p>
        Depending on your preference, you may wish to hide parent rows when they are open.
        This gives the impression to the user that the children takes the place of the
        parent row. This feature only makes sense when groups are in different columns.
        To turn this feature on, set <i>groupHideOpenParents=true</i>.
    </p>

    <pre><span class="codeComment">// OPTION 1 - configure with your own columns</span>
var gridOptions = {
    <span class="codeComment">// providing our own group cols, we don't want auto</span>
    groupSuppressAutoColumn: true,
    groupHideOpenParents: true,
    ... <span class="codeComment">// other properties here</span>
}

var colDefs = {
    <span class="codeComment">// the first group column</span>
    {headerName: "Country", cellRenderer: 'group', field: "country", rowGroupIndex: 0,
        cellRendererParams: { restrictToOneGroup: true }
    },

    <span class="codeComment">// the second group column</span>
    {headerName: "Year", cellRenderer: 'group', field: "year", rowGroupIndex: 1,
        cellRendererParams: {
            restrictToOneGroup: true
        }
    },
    ... <span class="codeComment">// other cols here</span>
}

<span class="codeComment">// OR OPTION 2 - use auto columns</span>
var gridOptions = {
    <span class="codeComment">// leave this property out, as want auto columns</span>
    <span class="codeComment">// groupSuppressAutoColumn: true,</span>

    groupHideOpenParents: true,
    ... <span class="codeComment">// other properties here</span>
}

var colDefs = {
    <span class="codeComment">// then provide the cols we want to group by, but hide them an no specific renderer</span>
    {field: "country", rowGroupIndex: 0, hide: true},
    {field: "year", rowGroupIndex: 1, hide: true},
    ... <span class="codeComment">// other cols here</span>
}</pre>

    <p>
        Below shows an example of this. Notice that each group row has
        <a href="../javascript-grid-aggregation/">aggregated values</a>. When the group
        is closed, the group row shows the aggregated result. When the group is open,
        the group row is removed and in it's place the child rows are displayed.
        To allow closing the group again, the group column knows to display the parent
        group in the group column only (so you can click on the icon to close the group).
    </p>

    <p>
        To help demonstrate this, the grid is configured to shade the rows different colors
        for the different group levels.
    </p>

    <show-example example="exampleGroupingHideParents"></show-example>

    <h3>Grouping API</h3>

    <p>
        To expand or contract a group via the API, you fist must get a reference to the rowNode and then call
        <i>rowNode.setExpanded(boolean).</i> This will result in the grid getting updated and displaying the
        correct rows. For example, to expand a group with the name 'Zimbabwe' would be done as follows:
        <pre>gridOptions.api.forEachNode(function(node) {
    if (node.key==='Zimbabwe') {
        node.setExpanded(true);
    }
});</pre>
    </p>

    <p>
        Calling <i>node.setExpanded()</i> causes the grid to get redrawn. If you have many nodes you want to
        expand, then it is best to set node.expanded=true directly, and then call
        <i>api.onGroupExpandedOrCollapsed()</i> when finished to get the grid to redraw the grid again just once.
    </p>

    <h3>Grouping Complex Objects with Keys</h3>

    <p>
        If your rowData has complex objects that you want to group by, then the default grouping
        will convert each object to <i>"[object object]"</i> which will be useless to you. Instead
        you need to get the grid to convert each object into a meaningful string to act as the key
        for the group. You could add a 'toString' method to the objects - but this may not be possible
        if you are working with JSON data. To get around this, use <i>colDef.keyCreator</i>, which
        gets passed a value and should return the string key for that value.
    </p>

    <p>
        The example below shows grouping on the county, with country an object within each row.
        <pre>rowItem = {
    athlete: 'Michael Phelps',
        country: { <span class="codeComment">// country is complex object, so need to provide colDef.keyCreator()</span>
        name: 'United States',
        code: 'US'
    }
    ....
}</pre>
    </p>

    <show-example example="exampleGroupingKeys"></show-example>

    <h3>Grouping Footers</h3>

    <p>
        If you want to include a footer with each group, set the property <i>groupIncludeFooter</i> to true.
        The footer is displayed as the last line of the group when then group is expanded - it is not displayed
        when the group is collapsed.
    </p>
    <p>
        The footer by default will display the word 'Total' followed by the group key. If this is not what you
        want, then use the <i>footerValueGetter</i> option. The following shows two snippets for achieving
        the same, one using a function, one using an expression.
    </p>
    <pre><code>// use a function to return a footer value
cellRenderer: 'group',
cellRendererParams: {
    footerValueGetter: function(params) { return 'Total (' + params.value + ')'},
}}

// use an expression to return a footer value. this gives the same result as above
cellRenderer: 'group',
cellRendererParams: {
    footerValueGetter: '"Total (" + x + ")"'
}}</code></pre>
    <p>
        When showing the groups in one column, the aggregation data is displayed
        in the group header when collapsed, and only in the footer when expanded (ie it moves from the header
        to the footer). To have different rendering, provide a custom <i>groupInnerCellRenderer</i>, where
        the renderer can check if it's a header or footer.
    </p>

    <p>
        Note: The example below uses <a href="../javascript-grid-aggregation/">aggregation</a> which is explained in
        the next section but included here as footer rows only make sense when used with aggregation.
    </p>

    <show-example example="groupingFooters"></show-example>

    </p>

    <h3>Keeping Group State</h3>

    <p>
        When you set new data into the group by default all the group open/closed states are reset.
        If you want to keep the original state, then set the property <i>rememberGroupStateWhenNewData=true</i>.
        The example below demonstrates this. Only half the data is shown in the grid at any given time,
        either the odd rows or the even rows. Hitting the 'Refresh Data' will set the data to 'the other half'.
        Note that not all groups are present in both sets (eg 'Afghanistan' is only present in one group) and
        as such the state is not maintained. A group like 'Australia' is in both sets and is maintained.
    </p>

    <show-example example="exampleKeepingGroupState"></show-example>

    <h3 id="fullWidthRows">Full Width Groups</h3>

    <p>
        Full width groups extend the width of the grid. You have two choices when using full width groups
        using the property <i>embedFullWidthRows</i> as follows:
        <ul>
            <li><b>embedFullWidthRows = false: </b> The group row will always
            span the width of the grid including pinned areas and is not impacted by horizontal scrolling.
                This is the most common usage and thus the default. The only drawback is that for some
            browsers (IE in particular), as you scroll vertically, the group row will lag behind the other rows.</li>
            <li><b>embedFullWidthRows = true: </b> The group row will be split into three sections for center,
                pinned left and pinned right. This is not ideal but works much faster with no IE issues.</li>
        </ul>
        So you might ask which one to use? The answer is the first one (just leave the property out, it's defaulted
        to false) unless you want to avoid IE performance issues.
    </p>
    <h4>Example <i>embedFullWidthRows</i></h4>
    <p>
        The example below demonstrates embedFullWidthRows on and off as follows:
        <ul>
            <li>Both grids have columns pinned left and right.</li>
            <li>Both grids have group rows spanning the grid width.</li>
            <li>The top grid as embedFullWidthRows=false, the bottom grid has embedFullWidthRows=true.</li>
        </ul>
        So with this setup, you will notice the following difference:
        <ul>
            <li>
                In the top grid, the group rows are not impacted by the pinning. In the bottom grid,
                the groups are truncated if you make the Athlete & Year columns to small,
                as the groups are sitting in the pinned section.
            </li>
            <li>
                In the bottom grid, if you unpin the columns (via the column menu) then the group jumps
                to the center.
            </li>
        </ul>
    </p>

    <show-example example="exampleFullWidthRowsComparison"></show-example>

    <p>
        If you are using custom group row rendering (explained below) and embedFullWidthRows = true, the panel
        you are rendering in is provided via the <i>pinned</i> parameter.
    </p>

    <h3>Group Row Rendering</h3>

    <p>
        It is possible to override the rendering of the group row using <i>groupRowRenderer</i> and
        <i>groupRowInnerRenderer</i>. Use groupRowRenderer to take full control of the row rendering,
        and provide a cellRenderer exactly how you would provide one for custom rendering of cells
        for non-groups.
    </p>
    <p>
        The following pieces of code do the exact same thing:
        <pre><code><span class="codeComment">// option 1 - tell the grid to group by row, the grid defaults to using</span>
<span class="codeComment">// the default group cell renderer for the row with default settings.</span>
gridOptions.groupUseEntireRow = true;

<span class="codeComment">// option 2 - this does the exact same as the above, except we configure</span>
<span class="codeComment">// it explicitly rather than letting the grid choose the defaults.</span>
<span class="codeComment">// we tell the grid what renderer to use (the built in renderer) and we</span>
<span class="codeComment">// configure the default renderer with our own inner renderer</span>
gridOptions.groupUseEntireRow = true;
gridOptions.groupRowRenderer:  'group';
gridOptions.groupRowRendererParams: {
    innerRenderer: function(params) {return params.node.key;},
};

<span class="codeComment">// option 3 - again the exact same. we allow the grid to choose the group</span>
<span class="codeComment">// cell renderer, but we provide our own inner renderer.</span>
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
gridOptions.groupRowRenderer: 'group';
gridOptions.groupRowRendererParams: {
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

    <show-example example="exampleGroupRowRendering"></show-example>

    <h3 id="removeSingleChildren">Removing Single Children</h3>

    <p>
        If your data has groups with only one child, then it can make sense to collapse
        these groups as there is no benefit to the user creating groups with just one child,
        it's arguably waste of space.
    </p>

    <p>
        To turn this feature on, set the property <i>groupRemoveSingleChildren=true</i>.
    </p>

    <p>
        The example below shows this feature in action. To demonstrate why this feature is needed
        you can click 'Toggle Grid' to show what the grid would be like without this setting. You
        will see the group UK, German and Sweden have only one child so the group is not giving any extra
        value to the data.
    </p>

    <note>
        Filtering does not impact what groups get removed. For example if you have a group with two
        children, the group is not removed, even if you apply a filter that removes one of the children.
        This is because ag-Grid does grouping first and then applies filters second. If you change the filter,
        only the filter is reapplied, the grouping is not reapplied.
    </note>

    <show-example example="exampleRemoveSingleChildren"></show-example>

    <note>
        It is not possible to mix <i>groupRemoveSingleChildren</i> and <i>groupHideOpenParents</i>.
        Technically, it doesn't make sense. Mixing these two will put you down a black hole so deep not
        even Stephen Hawking will be able to save you.
    </note>

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

<?php include '../documentation-main/documentation_footer.php';?>
