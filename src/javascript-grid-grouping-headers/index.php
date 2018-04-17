<?php
$pageTitle = "Column Groups: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Column Groups. Columns can be grouped together into Column Groups. Additionally you can configure groups to be expandable to show and hide columns within the group. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Group Columns ag-Grid";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Column Groups</h1>

    <p>
        Grouping columns allows you to have multiple levels of columns in your header and the ability,
        if you want, to 'open and close' column groups to show and hide additional columns.
    </p>

    <p>
        Grouping columns is done by providing the columns in a tree hierarchy to the grid. There is
        no limit to the number of levels you can provide.
    </p>

    <p>
        Here is a code snippet of providing two groups of columns.
    </p>

    <snippet>
gridOptions.columnDefs = [
    {
        headerName: "Athlete Details",
        children: [
            {headerName: "Name", field: "name"},
            {headerName: "Age", field: "age"},
            {headerName: "Country", field: "country"}
        ]
    },
    {
        headerName: "Sports Results",
        children: [
            {headerName: "Sport", field: "sport"},
            {headerName: "Total", columnGroupShow: 'closed'},
            {headerName: "Gold", columnGroupShow: 'open'},
            {headerName: "Silver", columnGroupShow: 'open'},
            {headerName: "Bronze", columnGroupShow: 'open'}
        ]
    }
];</snippet>

    <h2>Column Definitions vs Column Group Definitions</h2>

    <p>
        The list of columns in <code>gridOptions.columnDefs</code> can be a mix of columns and column groups.
        You can mix and match at will, every level can have any number of columns and groups and in any
        order. What you need to understand when defining as follows:
    </p>
        <ul class="content">
            <li>
                The 'children' attribute is mandatory for groups and not applicable for columns.
            </li>
            <li>
                If a definition has a 'children' attribute, it is treated as a group. If it does not
                have a 'children' attribute, it is treated as a column.
            </li>
            <li>
                Most other attributes are not common across groups and columns (eg 'groupId' is only
                used for groups). If you provide attributes that are not applicable (eg you give a
                column a 'groupId') they will be ignored.
            </li>
        </ul>

    <h2 id="showing-hiding-columns">Showing / Hiding Columns</h2>

    <p>
        A group can have children initially hidden. If you want to show or hide children,
        set <code>columnGroupShow</code> to either 'open' or 'closed' to one or more of the children.
        When a children set has <code>columnGroupShow</code> set, it behaves in the following way:
    </p>
        <ul class="content">
            <li><b>open:</b> The child is only shown when the group is open.</li>
            <li><b>closed:</b> The child is only shown when the group is closed.</li>
            <li><b>everything else:</b> Any other value, including null and undefined, the child is always shown.</li>
        </ul>

    <p>
        If a group has any child that is dependent on the open / closed state, the open / close icon
        will appear. Otherwise the icon will not be shown.
    </p>

    <p>
        Having columns only show when closed is useful when you want to replace a column with
        others. For example, in the code snippet above (and the example below), the 'Total' columns
        is replaced with other columns when the group is opened.
    </p>

    <p>
        If a group has an 'incompatible' set of children, then the group opening / closing will
        not be activated. An incompatible set is one which will have no columns visible
        at some point (ie all are set to 'open' or 'closed').
    </p>

    <h2>Pinning and Groups</h2>

    <p>
        Pinned columns break groups. So if you have a group with 10 columns, 4 of which are
        inside the pinned area, two groups will be created, one with 4 (pinned) and one
        with 6 (not pinned).
    </p>

    <h2>Moving Columns and Groups</h2>

    <p>
        If you move columns so that columns in a group are no longer adjacent, then the group
        will again be broken and displayed as one or more groups in the grid.
    </p>

    <h2>Resizing Groups</h2>

    <p>
        If you grab the group resize bar, it resizes each child in the group evenly distributing
        the new additional width. If you grab the child resize bar, only that one column will
        be resized.
    </p>

    <p>
        <img src="headerResize.jpg" class="img-fluid">
    </p>

    <h2 id="colouring-groups">Coloring Groups</h2>

    <p>
        The grid doesn't color the groups for you. However you can use the column definition
        <code>headerClass</code> for this purpose. The <code>headerClass</code> attribute is available
        on both columns and column groups.
    </p>

    <snippet>columnDefs = [
    {
        headerName: 'Athlete Details',
        // this CSS class will get applied to the header group
        headerClass: 'my-css-class',
        // then children as normal
        children: [ ... ]
    }
]</snippet>

    <h2>Align the Header Group Label To The right</h2>

<p>
The labels in the grouping headers are positioned with <code>float: left</code>. 
To make the group headers right-aligned, add the following  rule set in your application, after the grid's stylesheets. 
Change the theme class to the one you use.
</p>

<snippet language="css">
.ag-theme-balham .ag-header-group-cell-label span {
    float: right;
}
</snippet>

    <h2 id="grouping-example">Grouping Example</h2>

    <p>
        Here is a basic example of grouping in action.
    </p>

    <?= example('Basic Grouping', 'basic-grouping', 'generated') ?>

    <h2 id="grouping-example-with-marrychildren-set">Marry Children</h2>

    <p>
        Sometimes you want columns of the group to always stick together. To achieve this,
        set the column group property <code>marryChildren=true</code>. The example below
        demonstrates the following:
    </p>

    <ul class="content">
        <li>
            Both 'Athlete Details' and 'Sports Results' have <code>marryChildren=true</code>.
        </li>
        <li>
            If you move columns inside these groups, you will not be able to move the column out of
            the group. For example, if you drag 'Athlete', it is not possible to drag it out of the
            'Athlete Details' group.
        </li>
        <li>
            If you move a non group column, eg 'Extra 3', it will not be possible to place it in the
            middle of a group and hence impossible to break the group apart.
        </li>
        <li>
            It is possible to place a column between groups (eg you can place 'Extra 3' between
            the 'Athlete Details' and 'Sports Results').
        </li>
    </ul>

    <?= example('Marry Children', 'marry-children', 'generated') ?>

    <h2 id="advanced-grouping-example">Advanced Grouping Example</h2>

    <p>
        And here, to hammer in the 'no limit to the number of levels or groups', we have a more
        complex example. The grid here doesn't make much sense, it's just using the same Olympic
        Winners data and going crazy with the column groups.
        The example also demonstrates the following features:
    </p>

    <ul class="content">
        <li>
            Using the API to open and close groups. To do this, you will need
            to provide your groups with an ID during the definition, or look up the groups ID via the API
            (as an ID is generated if you don't provide one).
        </li>
        <li>
            Demonstrates <code>colDef.openByDefault</code> property, where it sets this on F
            and G groups, resulting in these groups appearing as open by default.
        </li>
        <li>
            Uses <code>defaultColGroupDef</code> and <code>defaultColDef</code> to apply a class to some of
            the headers. Using this technique, you can apply style to any of the header sections.
        </li>
    </ul>

    <?= example('Advanced Grouping', 'advanced-grouping', 'generated', array("extras" => array("fontawesome"))) ?>


<?php include '../documentation-main/documentation_footer.php';?>
