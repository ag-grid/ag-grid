<?php
$key = "Icons";
$pageTitle = "AngularJS Angular Grid Icons";
$pageDescription = "Angular Grid comes with default icons that are created using SVG. You can provide your own icons for the grid to use.";
$pageKeyboards = "AngularJS Angular Grid Pinning";
include '../documentation_header.php';
?>

<div>

    <h2>Icons</h2>

    <p>
        Angular Grid comes with default icons that are created using SVG. You can provide your own icons for the grid to use.
    </p>

    <p>
        The icons that can be changed are:
        <ul>
            <li>Sort icons on header</li>
            <li>Filter icon on header</li>
            <li>Menu icon on header</li>
            <li>Group open / close icon in headers</li>
            <li>Group expand / contact icon in rows</li>
            <li>Tool panel show / hide column</li>
            <li>Tool panel remove from group</li>
        </ul>
    </p>

    <p>
        The icons can either be set on the grid options (all icons) or on the column definition (all except group).
        If defined in both the grid options and column definitions, the column definition will get used. This
        allows you to specify defaults in the grid options to fall back on, and then provide individual icons for
        specific columns. This is handy if, for example, you want to include 'A..Z' as string sort icons and just
        the simple arrow for other columns.
    </p>

    <p>
        The icons are set as follows:
    </p>

    <pre>
gridOptions.icons = {
    menu: myMenuIcon,
    filter: myFilterIcon,
    sortAscending: mySortAscIcon,
    sortDescending: mySortDescIcon,
    sortUnSort: myUnSortIcon,
    groupExpanded: myGroupExpandedIcon,
    groupContracted: myGroupContractedIcon,
    headerGroupOpened: myGroupExpandedIcon,
    headerGroupClosed: myGroupContractedIcon
    columnVisible: myColumnVisibleIcon,
    columnHidden: myColumnHiddenIcon,
    columnRemoveFromGroup: myColumnRemoveFromGroupIcon
}
</pre>

    <p>
        Setting the icons on the column definitions is identical, except group icons are not used in column definitions.
    </p>

    <p>
        The icon can be any of the following:
        <ul>
            <li>
                <b>String:</b> The string will be treated as html. Use to return just text, or HTML tags.
            </li>
            <li>
                <b>Function:</b> A function that returns either a String or a DOM node or element.
            </li>
        </ul>
    </p>

    <p>
        The example below shows a mixture of different methods for providing icons. The grouping is done with images,
        and the header icons use a mix of Font Awesome and strings.
    </p>

    <show-example example="icons"></show-example>
</div>

<?php include '../documentation_footer.php';?>
