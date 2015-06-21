<?php
$key = "Grouping Headers";
$pageTitle = "AngularJS Angular Grid Group Headers";
$pageDescription = "AngularJS Angular Grid Group Headers";
$pageKeyboards = "AngularJS Angular Grid Group Headers";
include '../documentation_header.php';
?>

<div>

    <h2>Grouping Headers</h2>

    <p>
        Grouping headers allows you to put headers on top of headers, to group the headers.
    </p>

    <p>
        To group headers, set the attribute 'groupHeaders' to 'true' in the grid options. Then provide
        a group name for each of the column definitions.
    </p>

    <p>
        In the example below, three groups are created: Participant, Competition and Medals.
    </p>

    <p>
        If no group is specified for the column, eg the 'Sport' column below, then the header is displayed as normal.
    </p>

    <h4>Showing / Hiding Columns</h4>

    <p>
        A group can have columns initially hidden. If you want to show or hide columns,
        set <i>headerGroupShow</i> to either 'open' or 'closed' to one or more of the columns in the
        group. When a column definition has <i>headerGroupShow</i> set, it behaves in the following way:
        <ul>
            <li><b>open:</b> The column is only shown when the group is open.</li>
            <li><b>closed:</b> The column is only shown when the group is closed.</li>
            <li><b>everything else:</b>Any other value, including null and undefined, the column is always shown.</li>
        </ul>
    </p>

    <p>
        If any column is dependent on the group been opened or closed, the grid will pick
        up on this and display the open / close icon in the group header.
    </p>

    <p>
        Having columns only show when closed is useful when you want to replace a column with
        others. For example, when close you could have an entire address in one column that
        is then replaced with separate columns for each line when opened.
    </p>

    <p>
        If a group has a 'incompatible' set of columns, then the group opening / closing will
        not be activated. An incompatible set is one which will have no columns visible
        at some point (ie all are set to 'open' or 'closed').
    </p>

    <h4>Pinning and Groups</h4>

    <p>
        Pinned columns break groups. So if you have a group with 10 columns, 4 of which are
        inside the pinned area, two groups will be created, one with 4 (pinned) and one
        with 6 (not pinned).
    </p>
    <p>
        When hiding columns, the pinned column count still counts these columns. Hence
        opening / closing columns doesn't impact the columsn that are considered pinned.
    </p>

    <h4>Resizing Groups</h4>

    <p>
        If you grab the top half of the bar, it resizes each column in the group. If you grab the bottom half,
        it resizes the last column only.
    </p>

    <p>
        <img src="headerResize.jpg"/>
    </p>

    <h4>Grouping Example</h4>

    Here is an example of grouping in action. Notice the medals group shows totals when close, and numbers per
    medal type (and not total) when open. Check out the 'icons' section on how to override the icon
    for opening / closing groups.

    <show-example example="example1"></show-example>

</div>

<?php include '../documentation_footer.php';?>
