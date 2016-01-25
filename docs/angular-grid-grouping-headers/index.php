<?php
$key = "Grouping Columns";
$pageTitle = "AngularJS Angular Grid Group Columns ag-Grid";
$pageDescription = "AngularJS Angular Grid Group Columns ag-Grid";
$pageKeyboards = "AngularJS Angular Grid Group Columns ag-Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Grouping Columns</h2>

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

    <pre><code>gridOptions.columnDefs = [
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
];</code></pre>

    <h3>Column Definitions vs Column Group Definitions</h3>

    <p>
        The list of columns in <i>gridOptions.columnDefs</i> can be a mix of columns and column groups.
        You can mix and match at will, every level can have any number of columns and groups and in any
        order. What you need to understand when defining as as follows:
        <ul>
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
    </p>

    <h3>Showing / Hiding Columns</h3>

    <p>
        A group can have children initially hidden. If you want to show or hide children,
        set <i>columnGroupShow</i> to either 'open' or 'closed' to one or more of the children.
        When a children set have <i>columnGroupShow</i> set, it behaves in the following way:
        <ul>
            <li><b>open:</b> The child is only shown when the group is open.</li>
            <li><b>closed:</b> The child is only shown when the group is closed.</li>
            <li><b>everything else:</b> Any other value, including null and undefined, the child is always shown.</li>
        </ul>
    </p>

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
        If a group has a 'incompatible' set of children, then the group opening / closing will
        not be activated. An incompatible set is one which will have no columns visible
        at some point (ie all are set to 'open' or 'closed').
    </p>

    <h3>Pinning and Groups</h3>

    <p>
        Pinned columns break groups. So if you have a group with 10 columns, 4 of which are
        inside the pinned area, two groups will be created, one with 4 (pinned) and one
        with 6 (not pinned).
    </p>

    <h3>Moving Columns and Groups</h3>

    <p>
        If you move columns so that columns in a group are no longer adjacent, then the group
        will again be broken and displayed as one or more groups in the grid.
    </p>

    <h3>Resizing Groups</h3>

    <p>
        If you grab the group resize bar, it resizes each child in the group evenly distributing
        the new additional width. If you grab the child resize bar, only that one column will
        be resized.
    </p>

    <p>
        <img src="headerResize.jpg"/>
    </p>

    <h3>Grouping Example</h3>

    <p>
        Here is a basic example of grouping in action.
    </p>

    <show-example example="example1"></show-example>

    <h4>Advanced Grouping Example</h4>

    <p>
        And here, to hammer in the 'no limit to the number of levels or groups', we have a more
        complex example. The grid here doesn't make much sense, it's just using the same Olympic
        Winners data and going crazy with the column groups.
    </p>

    <p>
        The example also shows using the API to open and close groups. To do this, you will need
        to provide your groups with an ID during the definition, or look up the groups ID via the API
        (as an ID is generated if you don't provide one).
    </p>

    <show-example example="exampleColumnGroupComplex"></show-example>

</div>

<?php include '../documentation_footer.php';?>
