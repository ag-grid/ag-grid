<?php
$key = "Column Menu";
$pageTitle = "ag-Grid Javascript Grid Column Menu";
$pageDescription = "Clicking the menu icon on a header brings up the grid's column menu. This page describes how to configure the menu.";
$pageKeyboards = "ag-Grid Javascript Grid Column Menu";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2><img src="../images/enterprise_50.png" title="Enterprise Feature"/> Column Menu</h2>

    <h3>Showing the Column Menu</h3>

    <p>
        The menu will be displayed by default and will be made up of three panels. You have the following
        grid properties to suppress showing an individual panel or not showing the menu at all:
        <ul>
        <li><b>suppressMenuFilterPanel</b>: Set to true to not show filter panel.</li>
        <li><b>suppressMenuMainPanel</b>: Set to true to not show main panel.</li>
        <li><b>suppressMenuColumnPanel</b>: Set to true to not show column selection panel.</li>
    </ul>
        To not show the menu at all, set all three above to <i>true</i>. In addition, you can set the
    attribute <i>suppressMenu=true</i> to the column definition to not show the menu for a particular column.
    </p>

    <h3>Customising the Menu</h3>

    <p>
        The main menu panel, by default, will show a set of items. You can adjust which of these items get display, or you
        can start from scratch and provide your own items. To customise the menu, provide the <i>getMainMenuItems()</i>
        callback.
    </p>

    <p>
        <i>getContextMenuItems()</i> takes the following object as parameters:
        <pre>GetMainMenuItemsParams {
    column: Column, // the column that was clicked
    api: GridApi, // the grid API
    columnApi: ColumnAPI, // the column API
    context: any, // the grid context
    defaultItems: string[] // list of the items that would be displayed by default
}</pre>
    </p>

    <p>
        The result of <i>getContextMenuItems()</i> should be a list with each item either a) a string
        or b) a MenuItem description. Use 'string' to pick from built in menu items (listed below)
        and use MenuItem descriptions for your own menu items.
    </p>

    <p>
        A MenuItem description looks as follows (items with question marks are optional):
        <pre>MenuItem {
    name: string, // name of menu item
    disabled?: boolean, // if item should be enabled / disabled
    shortcut?: string, // shortcut (just display text, saying the shortcut here does nothing)
    action?: ()=>void, // function that gets executed when item is chosen
    checked?: boolean, // set to true to provide a check beside the option
    icon?: HTMLElement|string, // the icon to display beside the icon, either a DOM element or HTML string
    subMenu?: MenuItemDef[] // if this menu is a sub menu, contains a list of sub menu item definitions
}
</pre>

    <h3>Built In Menu Items</h3>

    <p>The following is a list of all the default built in menu items with the rules about when they are shown.</p>

    <ul>
        <li><b>pinSubMenu</b>: Submenu for pinning. Always shown.</li>
        <li><b>valueAggSubMenu</b>: Submenu for value aggregation. Always shown.</li>
        <li><b>autoSizeThis</b>: Auto-size the current column. Always shown.</li>
        <li><b>autoSizeAll</b>: Auto-size all columns. Always shown.</li>
        <li><b>rowGroup</b>: Group by this column. Only shown if column is not grouped.</li>
        <li><b>rowUnGroup</b>: Un-group by this column. Only shown if column is grouped.</li>
        <li><b>resetColumns</b>: Reset column details. Always shown.</li>
        <li><b>expandAll</b>: Expand all groups. Only shown if grouping by at least one column.</li>
        <li><b>contractAll</b>: Contract all groups. Only shown if grouping by at least one column.</li>
    </ul>

    <p>
        Reading the list above it can be understood that the list <i>defaultItems</i> changes on
        different calls to the <i>getContextMenuItems()</i> callback, depending on, for example,
        what columns are current used for grouping.
    </p>

    <p>
        If you do not provide a <i>getContextMenuItems()</i> callback, then the rules alone decides what gets shown.
        If you do provide a <i>getContextMenuItems()</i>, then the <i>defaultItems</i> will be filled using the
        rules above and you return from the callback whatever you want, using the <i>defaultItems</i> only
        if you want to.
    </p>

    <h3>Menu Item Separators</h3>
    <p>You can add menu item separators as follows:</p>
    <pre>menuItems.push('separator')</pre>

    <h3>Example Column Menu</h3>

    <p>
        The example below shows the <i>getMainMenuItems()</i> in action. To demonstrate different scenarios,
        the callback returns something different based on the selected column as follows:
        <ul>
        <li>Athlete column appends custom items to the list of built in items.</li>
        <li>Athlete column contains a sub menu.</li>
        <li>Age column provides custom items and adds one built in default item.</li>
        <li>Country column trims down the default items by removing values.</li>
        <li>All other columns return the default list.</li>
    </ul>
    </p>

    <show-example example="exampleColumnMenu" example-height="450px"></show-example>

    <h3>Overriding Column Menu Width</h3>
    <p>You can override the menu width by overriding the corresponding CSS:</p>

    <pre>.ag-set-filter-list {
    width: 500px !important;
}</pre>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
