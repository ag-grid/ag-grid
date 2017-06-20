<?php
$key = "Tree Data";
$pageTitle = "ag-Grid Providing Tree Data";
$pageDescription = "You can provide the data to your grid in a tree format. This page explains how to set this up.";
$pageKeyboards = "ag-Grid Javascript Tree";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="tree-data">Tree Data</h2>

    <p>It is possible to provide the data to ag-Grid in a tree structure. This can be used to provide a view of
    a tree (such as a file browser, this is what the <a href="../example-file-browser/">File Browser</a>
        example does) or you can provide data already
    grouped (eg maybe you are going the grouping in our database).</p>

    <note>Providing data in a tree structure is in replace of the ag-Grid provided row grouping. If you are
    providing the data as a tree structure, then the row grouping features will not be available.</note>

    <p>To provide data as a tree structure, you should provide a <i>getNodeChildDetails()</i> callback function.
    The existence of this function tells the grid the data is already structured. When you set data into the grid,
    the callback function will get called exactly once for each element in the structure. What you should
    return from the function is as follows:
    <ul>
        <li><b>Leaf Nodes: </b> Return nothing (null or undefined).</li>
        <li><b>Group Nodes: </b> Return back a nodeChildDetails structure with the following:
            <ul>
                <li>group: Always set to 'true'</li>
                <li>children: Provide a list of children to this group item.</li>
                <li>expanded: Set to true to expand by default, otherwise false.</li>
                <li>field: The field (eg 'File Name' or 'Country').</li>
                <li>key: The key (eg 'readme.txt' or 'Ireland').</li>
            </ul>
        </li>
    </ul>
    </p>

    <h2 id="tree-data-example">Tree Data Example</h2>

    <p>Below shows a simple example of providing already structured data. Notice that you can also provide
    data to the group level nodes (Sausage, Spaceman and Winklepicker) - this is where you would put aggregation
    values or group titles if needed.</p>

    <p>Also take a look at the <a href="../example-file-browser/">File Browser</a> example for a full example.</p>

    <show-example example="exampleTree"></show-example>



</div>

<?php include '../documentation-main/documentation_footer.php';?>
