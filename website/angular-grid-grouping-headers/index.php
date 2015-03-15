<?php
$pageTitle = "Angular Compiling";
$pageDescription = "Angular Grid Angular Compiling";
$pageKeyboards = "Angular Grid Angular Compiling";
include '../documentation_header.php';
?>

<div>

    <h2>Grouping Headers</h2>

    Grouping headers allows you to put headers on top of headers, to group the headers.

    <p/>

    To group headers, set the attribute 'groupHeaders' to 'true' in the grid options. Then provide
    a group name for each of the column definitions.

    <p/>

    In the example below, three groups are created: Participant, Competition and Medals.

    <p/>

    If no group is specified for the column, eg the 'Sport' column below, then the header is displayed as normal.

    <p/>

    The example below also demonstrates resizing of groups. The group is resized along with the
    column headers, to maintain the consistency in their widths.

    <show-example example="example1"></show-example>

</div>

<?php include '../documentation_footer.php';?>
