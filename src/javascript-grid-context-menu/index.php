<?php
$key = "Context Menu";
$pageTitle = "ag-Grid Javascript Grid Context Menu";
$pageDescription = "Right clicking on a cell brings up the grid's context menu. You can use the default or configure your own details.";
$pageKeyboards = "ag-Grid Javascript Grid Context Menu";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2><img src="../images/enterprise_50.png" title="Enterprise Feature"/> Context Menu</h2>

    <p>
        The user can bring up the context menu by right clicking on a cell.
        By default, the context menu provides the values 'copy' and 'paste'. Copy will copy the selected
        cells or rows to the clipboard. Paste will always, forever, be disabled.</p>

    <note>
        The 'paste' operation in the context menu is not possible and hence always disabled.
        It is not possible because of a browser security restriction that Javascript cannot
        take data from the clipboard without the user explicitly doing a paste command from the browser
        (eg Ctrl+V or from the browser menu). If Javascript could do this, then websites could steal
        data from the client via grabbing from the clipboard maliciously. The reason why ag-Grid keeps
        the paste in the menu as disabled is to indicate to the user that paste is possible and it provides
        the shortcut as a hint to the user.
    </note>

    <h3>Configuring the Context Menu</h3>

    <p>
        You can customise the context menu by providing a <code>getContextMenuItems()</code> callback.
        Each time the context menu is to be shown, the callback is called to retrieve the items
        to include in the menu. This allows the client application to display a menu individually
        customised to each cell.
    </p>

    <p>
        <code>getContextMenuItems()</code> takes the following object as parameters:
        <snippet>
GetContextMenuItemsParams {
    column: Column, // the column that was clicked
    node: RowNode, // the node that was clicked
    value: any, // the value displayed in the clicked cell
    api: GridApi, // the grid API
    columnApi: ColumnAPI, // the column API
    context: any, // the grid context
    defaultItems: string[] // names of the items that would be provided by default
}</snippet>
    </p>

    <p>
        The result of <code>getContextMenuItems()</code> should be a list with each item either a) a string
        or b) a MenuItem description. Use 'string' to pick from built in menu items (currently 'copy', 'paste'
        or 'separator') and use MenuItem descriptions for your own menu items.
    </p>

    <p>
        If you want to access your underlying data item, you access that through the rowNode as <code>var dataItem = node.data</code>.
    </p>

    <p>
        A MenuItem description looks as follows (items with question marks are optional):
        <snippet>
MenuItemDef {
    name: string, // name of menu item
    disabled?: boolean, // if item should be enabled / disabled
    shortcut?: string, // shortcut (just display text, saying the shortcut here does nothing)
    action?: ()=&gt;void, // function that gets executed when item is chosen
    checked?: boolean, // set to true to provide a check beside the option
    icon?: HTMLElement|string, // the icon to display beside the icon, either a DOM element or HTML string
    subMenu?: MenuItemDef[] // if this menu is a sub menu, contains a list of sub menu item definitions
    cssClasses?: string[]; //Additional CSS classes to be applied to the menu item
    tooltip?: string; //Optional tooltip for the menu item
}</snippet>
    </p>

    <p>
        Note: If you set <code>checked=true</code>, then icon will be ignored, these options are mutually exclusive.
    </p>

    <p>
        If you want to turn off the context menu completely, set the grid property <code>suppressContextMenu=true</code>.
    </p>

    <h3>Built In Menu Items</h3>

    <p>The following is a list of all the default built in menu items with the rules about when they are shown.</p>

    <ul>
        <li><b>autoSizeAll</b>: Auto-size all columns. Always shown.</li>
        <li><b>expandAll</b>: Expand all groups. Only shown if grouping by at least one column.</li>
        <li><b>contractAll</b>: Contract all groups. Only shown if grouping by at least one column.</li>
        <li><b>copy</b>: Copy selected value to clipboard</li>
        <li><b>copyWithHeaders</b>Copy selected value to clipboard with headers.</li>
        <li><b>paste</b>: Always disabled (see note in clipboard section).</li>
        <li><b>resetColumns</b>: Reset all columns.</li>
        <li><b>toolPanel</b>: Show / hide the toolpanel.</li>
        <li><b>export</b>: Export sub menu (containing csvExport and excelExport).</li>
        <li><b>csvExport</b>: Export to CSV using all default export values.</li>
        <li><b>excelExport</b>: Export to Excel using all default export values.</li>
    </ul>

    <h3>Default Context Menu</h3>

    <p>
        One drawback of using the ag-Grid context menu is that you may want to show the browsers context
        menu when debugging, for example in order to access your browsers dev tools. If you want the grid
        to do nothing (and hence allow the browser to display its context menu) then hold down the ctrl
        key while clicking for the context menu.
    </p>

    <p>
        Holding down ctrl & context menu bypasses the grids context menu. If you do want the grids context
        menu, even when ctrl is pressed, then set <i>allowContextMenuWithControlKey=true</i>.
    </p>

    <h3>Context Menu Example</h3>

    <p>
        Below shows a configured context menu in action demonstrating a customised menu with a mix
        of custom items. You should notice the following:
        <ul>
        <li>A mix of built in items and custom items are used.</li>
        <li>The first item uses the contents of the cell to display its value.</li>
        <li>Country and Person are sub menu's. The country sub menu contains icons.</li>
        <li>The menu item 'Always Disabled' has a tooltip.</li>
        <li>The menu item has css classes applied to it.</li>
        <li>The second menu item ('Always Disabled') has a tooltip.</li>
    </ul>
    </p>

    <show-example example="exampleContextMenu" example-height="450px"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
