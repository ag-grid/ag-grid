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

<p>
    The Mini Filter allows the user to search for particular values in the Filter List. Entering text into
    the Mini Filter will narrow down the presented list of values shown inside the Set Filter, but by default will not
    filter the data inside the grid.
</p>

<div class="animated-example">
    <img data-gifffer="mini-filter.gif" data-gifffer-width="99%" style="width: 100%; height: 100%" />
</div>

<h2>Keyboard Shortcuts</h2>

<p>
    When the <code>Enter</code> key is pressed while on the Mini Filter, the Set Filter will exclusively select all
    values in the Filter List that pass the Mini Filter and apply the filter immediately (note that even if an Apply
    Button is used, hitting <code>Enter</code> applies the filter).
</p>

<p>
    Alternatively, you can choose to have the Mini Filter applied as the user is typing, i.e. as the Filter List is
    filtered, the Set Filter will be applied as described above so that the results in the grid will also be filtered
    at the same time. To enable this behaviour, use the following:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'country',
    filter: 'agSetColumnFilter',
    filterParams: {
        applyMiniFilterWhileTyping: true,
    },
}
SNIPPET
) ?>

<p>
    The following example demonstrates this behaviour. Note the following:
</p>

<ul class="content">
    <li>
        The Athlete column's Set Filter shows the Mini Filter with default behaviour. Try typing in the Mini Filter to
        search the Filter List, and then hit the <code>Enter</code> key and notice how the grid is filtered using the
        displayed values.
    </li>
    <li>
        The Country column's Set Filter applies the Mini Filter as you type as <?= inlineCode('filterParams.applyMiniFilterWhileTyping = true') ?>.
    </li>
</ul>

<?= grid_example('Mini Filter Keyboard Shortcuts', 'mini-filter-keyboard-shortcuts', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter', 'menu'], 'reactFunctional' => true]) ?>

<h2>Custom Searches</h2>

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

<?= grid_example('Mini Filter Text Formatter', 'mini-filter-text-formatter', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter', 'menu', 'columnpanel'], 'reactFunctional' => true]) ?>

<h2>Text Customisation</h2>

<p>Text used in the Mini Filter can be customised using <a href="../javascript-grid-localisation/">Localisation</a>.</p>

<p>
    The text shown as a placeholder in the Mini Filter textbox can be customised by setting
    <code>'searchOoo'</code>.
</p>

<p>
    When no matching values are found when typing in the Mini Filter, a message is displayed. This can be customised by
    setting <code>'noMatches'</code>.
</p>

<p>The example below shows this text being customised.</p>

<?= grid_example('Text Customisation', 'text-customisation', 'generated', ['enterprise' => true, 'modules' => ['clientside', 'setfilter', 'menu'], 'reactFunctional' => true]) ?>

<h2>Hiding the Mini Filter</h2>

<p>
    By default, the Mini Filter is shown whenever the Set Filter is used. If you would like to hide it, you can use the
    following:
</p>

<?= createSnippet(<<<SNIPPET
// ColDef
{
    field: 'country',
    filter: 'agSetColumnFilter',
    filterParams: {
        suppressMiniFilter: true,
    },
}
SNIPPET
) ?>

<p>
    The following example demonstrates hiding the mini filter. Note the following:
</p>

<ul class="content">
    <li>
        The Athlete column's Set Filter shows the Mini Filter by default.
    </li>
    <li>
        The Country column's Set Filter does not have a Mini Filter as <?= inlineCode('filterParams.suppressMiniFilter = true') ?>.
    </li>
</ul>

<?= grid_example('Hiding the Mini Filter', 'mini-filter-hiding', 'generated', ['enterprise' => true, 'exampleHeight' => 565, 'modules' => ['clientside', 'setfilter', 'menu'], 'reactFunctional' => true]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section: <a href="../javascript-grid-filter-set-api">Set Filter API</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
