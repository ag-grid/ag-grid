<?php
$pageTitle = "Context Menu: Enterprise Grade Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Context Menu. The Context Menu appears when you right click on a cell. Use the default options or provide your own. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Javascript Grid Context Menu";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Context Menu</h1>

    <p class="lead">
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

    <h2>Configuring the Context Menu</h2>

    <p>
        You can customise the context menu by providing a <code>getContextMenuItems()</code> callback.
        Each time the context menu is to be shown, the callback is called to retrieve the items
        to include in the menu. This allows the client application to display a menu individually
        customised to each cell.
    </p>

    <p>
        <code>getContextMenuItems()</code> takes the following object as parameters:
</p>
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

    <p>
        The result of <code>getContextMenuItems()</code> should be a list with each item either a) a string
        or b) a MenuItem description. Use 'string' to pick from built in menu items (currently 'copy', 'paste'
        or 'separator') and use MenuItem descriptions for your own menu items.
    </p>

    <p>
        If you want to access your underlying data item, you access that through the rowNode as <code>var dataItem = node.data</code>.
    </p>

    <p>
        A <code>MenuItem</code> description looks as follows (items with question marks are optional):
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

    <h2>Built In Menu Items</h2>

    <p>The following is a list of all the default built in menu items with the rules about when they are shown.</p>

    <ul class="content">
        <li><code>autoSizeAll</code>: Auto-size all columns. Always shown.</li>
        <li><code>expandAll</code>: Expand all groups. Only shown if grouping by at least one column.</li>
        <li><code>contractAll</code>: Contract all groups. Only shown if grouping by at least one column.</li>
        <li><code>copy</code>: Copy selected value to clipboard</li>
        <li><code>copyWithHeaders</code>Copy selected value to clipboard with headers.</li>
        <li><code>paste</code>: Always disabled (see note in clipboard section).</li>
        <li><code>resetColumns</code>: Reset all columns.</li>
        <li><code>toolPanel</code>: Show / hide the toolpanel.</li>
        <li><code>export</code>: Export sub menu (containing csvExport and excelExport).</li>
        <li><code>csvExport</code>: Export to CSV using all default export values.</li>
        <li><code>excelExport</code>: Export to Excel using all default export values.</li>
    </ul>

    <h2>Default Context Menu</h2>

    <p>
        One drawback of using the ag-Grid context menu is that you may want to show the browsers context
        menu when debugging, for example in order to access your browsers dev tools. If you want the grid
        to do nothing (and hence allow the browser to display its context menu) then hold down the ctrl
        key while clicking for the context menu.
    </p>

    <p>
        Holding down ctrl & context menu bypasses the grids context menu. If you do want the grids context
        menu, even when ctrl is pressed, then set <code>allowContextMenuWithControlKey=true</code>.
    </p>

    <h2>Hiding the Context Menu</h2>

    <p>
        Hide the context menu with the grid API <code>hidePopupMenu()</code>, which will hide
        either the context menu or the <a href="../javascript-grid-column-menu">column menu</a>,
        whichever is showing.
    </p>

    <h2>Context Menu Example</h2>

    <p>
        Below shows a configured context menu in action demonstrating a customised menu with a mix
        of custom items. You should notice the following:
    </p>
    <ul class="content">
        <li>A mix of built in items and custom items are used.</li>
        <li>The first item uses the contents of the cell to display its value.</li>
        <li>Country and Person are sub menu's. The country sub menu contains icons.</li>
        <li>The menu item 'Always Disabled' has a tooltip.</li>
        <li>The menu item has css classes applied to it.</li>
        <li>The second menu item ('Always Disabled') has a tooltip.</li>
    </ul>

    <?= example('Context Menu Example', 'context-menu', 'generated', array("enterprise" => 1)) ?>

    <h2 id="popup-parent">Popup Parent</h2>

    <p>
        Under most scenarios, the menu will fit inside the grid. However if the grid is small and / or the menu
        is very large, then the menu will not fit inside the grid and it will be clipped. This will lead to
        a bad user experience.
    </p>

    <p>
        The following demonstrates the bad user experience - try to open the context menu or the column
        menu in the grid. The menu will not be fully visible.
    </p>

    <?= example('Small Grid Problem', 'popup-parent-problem', 'generated', array("enterprise" => 1)) ?>

    <p>
        The solution is to set the <code>popupParent</code> element which can be set in the following ways:
        <ul>
            <li>Property <code>popupParent</code>: Set as a grid property.</li>
            <li>API <code>setPopupParent(element)</code>: Set via the grid API.</li>
        </ul>
        Each mechanism allows you to set the popup parent to any HTML DOM element. The element must:
        <ol>
            <li>Exist in the dom.</li>
            <li>
                Cover the same area as the grid (or simple be a parent of the grid), so that when the
                popup is positioned, it can be positioned over the grid.
            </li>
        </ol>
        Most of the time, you will simple set the popup parent to the document body.
    </p>

    <p>
        The example below is identical to the previous example except it sets the popup parent
        to the document body.
    </p>

    <?= example('Small Grid Solution', 'popup-parent-solution', 'generated', array("enterprise" => 1)) ?>



<?php include '../documentation-main/documentation_footer.php';?>
