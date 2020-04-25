<?php
$pageTitle = "Set Filter: Enterprise Grade Feature of our Datagrid";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter - Mini Filter</h1>

<p class="lead">
    This section describes the Mini Filter and shows how it can be configured to suit application requirements.
</p>

<div class="animated-example">
    <img data-gifffer="mini-filter.gif" data-gifffer-width="99%" style="width: 100%; height: 100%" />
</div>

<p>
    Searching in the Mini Filter narrows the values displayed in the filter list but won't perform any filtering in the
    grid. Hitting the <b>Enter</b> key will will select all displayed values in the filter list and perform filtering
    in the grid.
</p>

<h2>Custom Mini Filter Searches</h2>

<p>
    Sometimes it is necessary to provide custom handling for mini filter searches, for example to substitute accented
    characters or to perform case-sensitive searches.
</p>

<p>
    As with the <a href="../javascript-grid-filter-text/#text-formatter">Text Filter</a> it is possible to supply a
    Text Formatter to the Set Filter which formats the text before applying the mini filter compare logic. The snippet
    below shows how this can be configured:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'athlete',
    filter: 'agSetColumnFilter',
    filterParams: {
        textFormatter: function() {,
            .toLowerCase()
            .replace(/\s/g, '')
            .replace(/[àáâãäå]/g, 'a')
            .replace(/æ/g, 'ae')
            .replace(/ç/g, 'c')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/ñ/g, 'n')
            .replace(/[òóôõö]/g, 'o')
            .replace(/œ/g, 'oe')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ýÿ]/g, 'y')
            .replace(/\W/g, '');
        }
    }
}
SNIPPET
    , 'ts') ?>

<p>
    The following example demonstrates searching . Note the following:
</p>

<ul class="content">
    <li>
        The <b>Athlete</b> Set Filter is supplied a Text Formatter via <code>filterParams.textFormatter</code> to
        ignore accents.
    </li>
    <li>
        Searching using <code>'bjorn'</code> will return all values containing <code>'björn'</code>.
    </li>
</ul>

<?= grid_example('Mini Filter Text Formatter', 'mini-filter-text-formatter', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>



<?php include '../documentation-main/documentation_footer.php';?>
