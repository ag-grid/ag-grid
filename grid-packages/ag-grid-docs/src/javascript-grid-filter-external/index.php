<?php
$pageTitle = "External Filter: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is External Filter which allows you to build filters that live outside of the grid. For example, you can include your own widgets outside the grid for your own filter. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Quick Filter";
$pageGroup = "feature";
define('skipInPageNav', true);
include '../documentation-main/documentation_header.php';
?>

<h1>External Filter</h1>

<p class="lead">
    External filtering allows you to mix your own 'outside of the grid' filtering with the grid's filtering.
</p>

<p>
    The example below shows external filters in action. There are two methods on <code>gridOptions</code> you
    need to implement: <code>isExternalFilterPresent()</code> and <code>doesExternalFilterPass(node)</code>.
</p>

<ul class="content">
    <li>
        <code>isExternalFilterPresent</code> is called exactly once every time the grid senses a filter change.
        It should return <code>true</code> if external filtering is active or <code>false</code> otherwise. If you
        return <code>true</code>, <code>doesExternalFilterPass()</code> will be called while filtering, otherwise
        <code>doesExternalFilterPass()</code> will not be called.
    </li>
    <li>
        <code>doesExternalFilterPass</code> is called once for each row node in the grid. If you return <code>false</code>,
        the node will be excluded from the final set.
    </li>
</ul>

<note>
    If the external filter changes, you need to call <code>api.onFilterChanged()</code> to tell the grid.
</note>

<p>The example below shows an external filter in action.</p>

<?= grid_example('External Filter', 'external-filter', 'generated', ['exampleHeight' => 580, 'modules' => true]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
