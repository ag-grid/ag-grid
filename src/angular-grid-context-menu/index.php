<?php
$key = "Context Menu";
$pageTitle = "ag-Grid Javascript Grid Context Menu";
$pageDescription = "Right clicking on a cell brings up the grid's context menu. You can use the default or configure your own details.";
$pageKeyboards = "ag-Grid Javascript Grid Context Menu";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Context Menu</h2>

    <p>
        <?php include '../enterprise.php';?>
        &nbsp;
        Context menu is available in ag-Grid Enterprise.
    </p>

    <p>
        Set the grid property <i></i> The user can bring up the context menu by right clicking on a cell.
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
        You can customise the context menu by providing a <i>getContextMenuItems()</i> callback.
        Each time the context menu is to be shown, the callback is called to retrieve the items
        to include in the menu. This allows the client application to display a menu individually
        customised to each cell.
    </p>

    <p>
        <i>getContextMenuItems()</i> takes the following object as parameters:
        <pre>GetContextMenuItemsParams {
    column: Column, // the column that was clicked
    node: RowNode, // the node that was clicked
    value: any, // the value displayed in the clicked cell
    api: GridApi, // the grid API
    columnApi: ColumnAPI, // the column API
    context: any // the grid context
}</pre>
    </p>

    <p>
        The result of <i>getContextMenuItems()</i> should be a list with each item either a) a string
        or b) a MenuItem description. Use 'string' to pick from built in menu items (currently 'copy', 'paste'
        or 'separator') and use MenuItem descriptions for your own menu items.
    </p>

    <p>
        A MenuItem description looks as follows (items with question marks are optional):
        <pre>MenuItem {
    name: string, // name of menu item
    disabled?: boolean, // if item should be enabled / disabled
    shortcut?: string, // shortcut (just display text, saying the shortcut here does nothing)
    action?: ()=>void, // function that gets executed when item is chosen
    checked?: boolean, // set to true to provide a check beside the option
    icon?: HTMLElement|string // the icon to display beside the icon, either a DOM element or HTML string
}
</pre>
    </p>

    <p>
        Note: If you set <i>checked=true</i>, then icon will be ignored, these options are mutually exclusive.
    </p>

    <p>
        If you want to turn off the context menu completely, set the grid property <i>suppressContextMenu=true</i>.
    </p>

    <h3>Context Menu Example</h3>

    <p>
        Below shows a configured context menu in action demonstrating a customised menu with a mix
        of custom items, built in items and the separator. Notice that the first item displays the contents
        of the cell that was clicked on.
    </p>

    <show-example example="exampleContextMenu" example-height="450px"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
