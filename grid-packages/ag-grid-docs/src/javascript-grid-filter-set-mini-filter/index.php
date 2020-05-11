<?php
$pageTitle = "Set Filter - Mini Filter";
$pageDescription = "Enterprise feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Set Filter. Set Filter works like Excel, providing checkboxes to select values from a set. Version 20 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid JavaScript Data Grid Excel Set Filtering";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Set Filter - Mini Filter</h1>

<p class="lead">
    This section describes the behaviour of the Mini Filter and shows how it can be configured.
</p>

<div class="animated-example">
    <img data-gifffer="mini-filter.gif" data-gifffer-width="99%" style="width: 100%; height: 100%" />
</div>

<p>
    The Mini Filter allows the user to search for particular values in the Filter List. Entering text into
    the Mini Filter will narrow down the presented list of values shown inside the Set Filter, but by default will not
    filter the data inside the grid.
</p>

<p>
    When the <code>Enter</code> key is pressed while on the Mini Filter, the Set Filter will exclusively select all
    values in the Filter List that pass the Mini Filter and apply the filter immediately (note that even if an Apply
    Button is used, hitting <code>Enter</code> applies the filter).
</p>

<p>
    Alternatively, you can choose to have the Mini Filter applied as the user is typing, i.e. as the Filter List is
    filtered, the Set Filter will be applied as described above so that the results in the grid will also be filtered
    at the same time. To enable this behaviour, set <code>applyMiniFilterWhileTyping&nbsp;=&nbsp;true</code>.
</p>

<h2>Mini Filter Options</h2>

<p>
    The following example demonstrates different Mini Filter options. Note the following:
</p>

<ul class="content">
    <li>
        The Athlete column's Set Filter shows the Mini Filter with default behaviour.
    </li>
    <li>
        The Country column's Set Filter does not have a Mini Filter as <?= inlineCode('filterParams.suppressMiniFilter = true') ?>.
    </li>
    <li>
        The Sport column's Set Filter applies the Mini Filter as you type as <?= inlineCode('filterParams.applyMiniFilterWhileTyping = true') ?>.
    </li>
</ul>

<?= grid_example('Mini Filter Options', 'mini-filter-options', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>

<h2>Custom Mini Filter Searches</h2>

<p>
    Sometimes it is necessary to provide custom handling for Mini Filter searches, for example to substitute accented
    characters or to perform case-sensitive searches.
</p>

<p>
    As with the <a href="../javascript-grid-filter-text/#text-formatter">Text Filter</a> it is possible to supply a
    Text Formatter to the Set Filter which formats the text before applying the Mini Filter compare logic. The snippet
    below shows how this can be configured:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'athlete',
    filter: 'agSetColumnFilter',
    filterParams: {
        textFormatter: function(value) {
            return value
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
) ?>

<p>
    The following example demonstrates searching when there are accented characters. Note the following:
</p>

<ul class="content">
    <li>
        The Athlete column's Set filter is supplied a text formatter via <code>filterParams.textFormatter</code> to
        ignore accents.
    </li>
    <li>
        Searching using <code>'bjorn'</code> will return all values containing <code>'björn'</code>.
    </li>
</ul>

<?= grid_example('Mini Filter Text Formatter', 'mini-filter-text-formatter', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel']]) ?>

<h2>API Reference</h2>

<?= createDocumentationFromFile('../javascript-grid-filter-set/setFilterParams.json', 'filterParams', ['applyMiniFilterWhileTyping', 'suppressMiniFilter', 'textFormatter']) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section: <a href="../javascript-grid-filter-set-api">Set Filter API</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
