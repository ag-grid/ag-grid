<?php
$pageTitle = "Pivot Tables: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Pivoting: Make columns out of values by Pivoting on the data, similar to Pivot Tables in Excel. Pivoting allows you to take a columns values and turn them into columns. Enterprise feature of ag-Grid supporting Angular, React, Javascript and many more.";
$pageKeywords = "ag-Grid JavaScript Grid Pivot";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Pivoting - Sub Totals</h1>

<p class="lead">
    There are several ways to provide sub total details.
</p>

<h2>Expandable Pivot Groups</h2>

<p>
    By default pivot column groups are collapsed when there is more than one pivot column. To disable this
    behaviour use the following grid option:
</p>

<?= createSnippet(<<<SNIPPET
suppressExpandablePivotGroups = true
SNIPPET
) ?>

<p>TODO: update docs</p>

<?= grid_example('Expandable Pivot Groups', 'collapsable-groups', 'generated', ['enterprise' => true, 'exampleHeight' => 655, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel', 'filterpanel']]) ?>

<h2>Pivot Row Totals</h2>

<p>
    When in pivot mode you can also include automatically calculated Row Total Columns. These total columns will use
    the provided aggregation function on the value columns to 'roll-up' each group level.
</p>

<p>
    To enable Pivot Row Totals, declare the following property: <code>gridOption.pivotRowTotals = 'before' | 'after'</code>.
    The values <code>before</code> and <code>after</code> are used to control the position of the row total columns
    relative to the other pivot columns.
</p>

<p>
    The example below demonstrates Pivot Row Totals as follows:
</p>
<ul class="content">
    <li>Pivot Row Totals are positioned before the other pivot group columns using:
        <code>gridOption.pivotRowTotals = 'before'</code>.</li>
    <li>Pivot Row Totals are added for each of the value columns: 'gold', 'silver' and 'bronze'. </li>
    <li>Pivot Column Group Total are also added using: <code>gridOptions.pivotColumnGroupTotals = 'after'</code>.</li>
    <li>Expanding pivot column groups reveals the in the last position as 'after' is used.</li>
</ul>

<?= grid_example('Pivot Row Totals', 'row-totals', 'generated', ['enterprise' => true, 'exampleHeight' => 655, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel', 'filterpanel']]) ?>


<h2>Pivot Column Group Totals</h2>
<p>
    When in pivot mode you can also include automatically calculated total pivot columns. These total columns will use the provided
    aggregation function on the value columns to 'roll-up' each group level.
</p>
<p>
    Pivot column groups that contain more than one child will have a total column included. Expanding this group will reveal
    the columns that make up this total value.
</p>

<p>
    To enable total columns set <code>gridOptions.pivotColumnGroupTotals = 'before' | 'after'</code>. The
    values <code>before</code> and <code>after</code> are used to control the relative position of the total column
    when the group is expanded.
</p>

<note>
    <code>gridOptions.pivotTotals = true</code> has now been deprecated in favour of the new property
    <code>gridOptions.pivotColumnGroupTotals = 'before' | 'after'</code>.
</note>

<p>
    All value columns must use the same aggregation function for the total column to make sense, otherwise the
    total column will not be included.
</p>

<p>
   The example below demonstrates Pivot Column Group Totals as follows:
</p>
   <ul class="content">
       <li>Pivot Column Group Totals added on ['sport', 'year'] columns.</li>
       <li>Expanding pivot groups reveals columns that make up totals.</li>
   </ul>

<?= grid_example('Pivot Column Group Totals', 'totals', 'generated', ['enterprise' => true, 'exampleHeight' => 655, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel', 'filterpanel']]) ?>

<?php include '../documentation-main/documentation_footer.php';?>
