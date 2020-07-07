<?php
$pageTitle = "Pivot Tables: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Pivoting: Make columns out of values by Pivoting on the data, similar to Pivot Tables in Excel. Pivoting allows you to take a columns values and turn them into columns. Enterprise feature of ag-Grid supporting Angular, React, Javascript and many more.";
$pageKeywords = "ag-Grid JavaScript Grid Pivot";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1 class="heading-enterprise">Pivoting - API</h1>

    <p class="lead">
        Pivoting allows you to take a columns values and turn them into columns. For example you can pivot on Country
        to make columns for Ireland, United Kingdom, USA etc.
    </p>

    <h2>Pivot API</h2>

    <p>
        Below shows examples of using the pivot API directly. Use this is you want to build out your own toolPanel.
    </p>

    <p>
        The example also demonstrates exporting to CSV while using Pivot. Basically what you see inside the grid
        is what will be exported.
    </p>

    <?= grid_example('Pivot API', 'api', 'generated', ['enterprise' => true, 'exampleHeight' => 620, 'modules' => ['clientside', 'rowgrouping', 'menu', 'setfilter', 'columnpanel', 'filterpanel', 'csv']]) ?>

    <h2 id="hideOpenParents">Hide Open Parents</h2>

    <p>
        The example below shows mixing in different options for the row group column. For more info on these properties,
        see <a href="../javascript-grid-grouping/">Grouping Rows</a>.
    </p>
        <ul class="content">
        <li><code>groupHideOpenParents=true: </code> So that when the row group is expanded, the parent row is not
        shown.</li>
        <li><code>groupMultiAutoColumn=true: </code> So that one group column is created for each
        row group column (country and athlete)</li>
        <li><code>groupDefaultExpanded=2: </code> So that all the groups are opened by default</li>
        </ul>

    <?= grid_example('Hide Open Parents', 'hide-open-parents', 'generated', ['enterprise' => true, 'exampleHeight' => 650, 'modules' => ['clientside', 'rowgrouping', 'menu', 'columnpanel', 'filterpanel']]) ?>

    <h2 id="change-detection">Change Detection and Pivot</h2>

    <p>
        While pivoting, you can do delta changes to your data and have the grid reflect this
        delta changes with animations.
    </p>

    <p>
        This is demonstrated in the section on
        <a href="../javascript-grid-change-detection/#change-detection-and-pivot">Change Detection and Pivot</a>,
        so rather that repeat, check out the example there.
    </p>


<?php include '../documentation-main/documentation_footer.php';?>
