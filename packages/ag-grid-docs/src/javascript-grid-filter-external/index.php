<?php
$pageTitle = "External Filter: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is External Filter which allows you to build filters that live outside of the grid. For example, you can include your own widgets outside the grid for your own filter. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Quick Filter";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>External Filter</h1>

<p class="lead">
    It is common for you to want to have widgets on the top of your grid that influence the grids filtering.
    External filtering allows you to mix your own 'outside of the grid' filtering with the grids filtering.
</p>

<p>
    The example below shows external filters in action. There are two methods on gridOptions you
    need to implement: <code>isExternalFilterPresent()</code> and <code>doesExternalFilterPass(node)</code>.
</p>

<ul class="content">
    <li>
        <code>isExternalFilterPresent</code> is called exactly once every time the grid senses a filter change.
        It should return true if external filtering is active, otherwise false. If you return true, then
        doesExternalFilterPass() will be called while filtering, otherwise doesExternalFilterPass() will
        not be called.
    </li>
    <li>
        <code>doesExternalFilterPass</code> is called once for each row node in the grid. If you return false,
        the node will be excluded from the final set.
    </li>
</ul>

<note>
    If the external filter changes, then you need to call api.onFilterChanged() to tell the grid.
</note>

<p> The example below shows the external filters in action.  </p>

<?= example('External Filter', 'external-filter', 'vanilla') ?>

<?php include '../documentation-main/documentation_footer.php';?>
