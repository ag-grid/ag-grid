<?php
$pageTitle = "ag-Grid Reference: Grid Callbacks";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This reference guide covers all of the available Grid Callbacks.";
$pageKeyboards = "javascript data grid ag-Grid Callbacks";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

    <h1 id="callbacks" class="first-h1">Grid Callbacks</h1>

    <p class="lead">
        All of these grid callbacks are available through the <code>GridOptions</code> interface.
    </p>

    <table class="table reference">
        <tr>
            <th>isExternalFilterPresent()</th>
            <td>Grid calls this method to know if external filter is present.</td>
        </tr>
        <tr>
            <th>doesExternalFilterPass(node)</th>
            <td>Return true if external filter passes, otherwise false.</td>
        </tr>
        <tr>
            <th>getRowClass(params)</th>
            <td>Callback version of property 'rowClass'. Function should return a string or an array of strings.</td>
        </tr>
        <tr>
            <th>getRowStyle(params)</th>
            <td>Callback version of property 'rowStyle'. Function should return an object of CSS values.</td>
        </tr>
        <tr>
            <th>getRowHeight(params)</th>
            <td>Callback version of property 'rowHeight'. Function should return a positive number.</td>
        </tr>
        <tr>
            <th>headerCellRenderer(params)</th>
            <td>Provide a function for custom header rendering.</td>
        </tr>
        <tr>
            <th>groupRowAggNodes(nodes)</th>
            <td>Callback for grouping. See the section on <a href="../javascript-grid-grouping/#groupingCallbacks">row grouping</a> for detailed explanation.</td>
        </tr>
        <tr>
            <th>getBusinessKeyForNode(node)</th>
            <td>Return a business key for the node. If implemented, then each row in the dom will have an attribute
                <code>row-id='abc'</code> where abc is what you return as the business key. This is useful for automated
            testing, as it provides a way for your tool to identify rules based on unique business keys.</td>
        </tr>
        <tr>
            <th>getHeaderCellTemplate</th>
            <td>Function to use instead of headerCellTemplate, should return string or html DOM element.</td>
        </tr>
        <tr>
            <th>getNodeChildDetails(callback)</th>
            <td>Allows you to pass tree structure data to the grid, or row data that is already grouped.</td>
        </tr>
        <tr>
            <th>getChildCount(data)</th>
            <td>
                For <a href="../javascript-grid-server-side-model/">Server-side Row Model</a> only. Allows
                setting the child count for a group row.
            </td>
        </tr>
        <tr>
            <th>processRowPostCreate(params)</th>
            <td>Allows you to process rows after they are created. So you can do final adding of custom attributes etc.</td>
        </tr>
        <tr>
            <th>getRowNodeId(data)</th>
            <td>Allows you to set the id for a particular row node based on the data. Useful for selection and
                server side sorting and filtering for paging and virtual pagination.</td>
        </tr>
        <tr>
            <th>isFullWidthCell(rowNode)</th>
            <td>Tells the grid if this row should be rendered using <a href="../javascript-grid-master-detail/">fullWidth</a>.</td>
        </tr>
        <tr>
            <th>isRowSelectable(rowNode)</th>
            <td>Callback to be used to determine which rows are selectable. By default rows are selectable, return false
                to make row un-selectable. For more details see
                <a href="../javascript-grid-selection/#specify-selectable-rows">Specify Selectable Rows</a>.</td>
        </tr>
        <tr>
            <th>isRowMaster(dataItem)</th>
            <td>Callback to be used with <a href="../javascript-grid-master-detail">Master Detail</a> to determine if
                a row should be master row. If false is returned no detail row will exist for this row.</td>
        </tr>
        <tr>
            <th>postSort(rowNodes)</th>
            <td>Callback to perform additional sorting after the grid has sorted the rows. For more details see <a href="../javascript-grid-sorting/#post-sort">Post Sort</a>.</td>
        </tr>
        <tr>
            <th>doesDataFlower(dataItem)</th>
            <td>Tells the grid if this row should flower.</td>
        </tr>
        <tr>
            <th>navigateToNextCell(params)</th>
            <td>Allows overriding the default behaviour for when user hits navigation (arrow) key.</td>
        </tr>
        <tr>
            <th>tabToNextCell(params)</th>
            <td>Allows overriding the default behaviour for when user hits tab key.</td>
        </tr>
        <tr>
            <th>getDocument()</th>
            <td>Allows overriding what document is used. Currently used by Drag and Drop (may extend to other places
                in the future). Use this when you want the grid to use a different document than the one available
                on the global scope. This can happen if docking out components (something which Electron supports).</td>
        </tr>
        <tr>
            <th>getContextMenuItems(params)</th>
            <td>For customising the context menu.</td>
        </tr>
        <tr>
            <th>getMainMenuItems(params)</th>
            <td>For customising the main 'column header' menu.</td>
        </tr>
        <tr>
            <th>processCellForClipboard(params)</th>
            <td>Allows you to process cells for the clipboard. Handy if you have date objects that you need
                to have a particular format if importing into Excel.</td>
        </tr>
        <tr>
            <th>processCellFromClipboard(params)</th>
            <td>Allows you to process cells from the clipboard. Handy if you have for example number fields,
                and want to block non-numbers from getting into the grid.</td>
        </tr>
        <tr>
            <th>sendToClipboard(params)</th>
            <td>Allows you to get the data that would otherwise go to the clipboard. To be used when you want
                to control the 'copy to clipboard' operation yourself.</td>
        </tr>
        <tr>
            <th>processSecondaryColDef(colDef)</th>
            <td>Callback to be used with pivoting, to allow changing the second column definition.</td>
        </tr>
        <tr>
            <th>processSecondaryColGroupDef(colGroupDef)</th>
            <td>Callback to be used with pivoting, to allow changing the second column group definition.</td>
        </tr>
        <tr>
            <th>postProcessPopup(params)</th>
            <td>Allows user to process popups after they are created. Applications can use this if they want to, for
                example, reposition the popup.</td>
        </tr>
        <tr>
            <th>defaultGroupSortComparator(nodeA, nodeB)</th>
            <td>
                Allows default sorting of groups. See
                <a href="../javascript-grid-grouping/#default-group-order">Default Group Order</a>.
            </td>
        </tr>

        <?php include_once '../javascript-grid-pagination/paginationProperties.php' ?>
        <?php printPropertiesRows($paginationCallbacks) ?>
    </table>

<?php include '../documentation-main/documentation_footer.php';?>
