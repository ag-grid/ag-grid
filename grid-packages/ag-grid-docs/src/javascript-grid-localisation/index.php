<?php
$pageTitle = "Localisation: Styling & Appearance with our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Localisation. Support your desired languages with Localisation. Version 23 is available for download now, take it for a free two month trial.";
$pageKeywords = "ag-Grid Internationalisation Internationalization i18n Localisation Localization l10n";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Localisation</h1>

<p class="lead">
    All the displayed text in the grid is customisable for the purposes of localisation.
    This is done by providing locale information to the grid for the required language.
    This is done by either providing an object of key->value pairs via the <code>localeText</code>
    property, or providing a <code>localeTextFunc</code> callback to hook the grid up to your
    applications localisation.
</p>

<p>
    The default language of the grid is American English. The grid does not come with other
    locales. If you want to provide the grid in another language, you must provide to the
    grid the relevant locale information.
</p>



<h2>Creating a Locale</h2>

<p>
    The grid by default does not need a locale. If no locale is provide, the grid will
    default to English. If a locale is provided but is missing values, the default English
    will be used for the missing values.
</p>

<p>
    An example full locale file is provided below. To support other languages, the first step
    is to copy this file and translate the values into the required language.
</p>

<div style="height: 400px; overflow: auto;">
    <?php
    ob_start();
    include './localisation/locale.en.js';
    $buffer = ob_get_clean();
    echo createSnippet($buffer);
    ?>
</div>

<p>
    You can download the full file from <a href="./localisation/locale.en.js" download>here</a>.
</p>

<p>
    There is one locale file for all of the grid. The file covers all modules across all of
    ag-Grid Enterprise and ag-Grid Free. This was done on purpose as having multiple files
    for each module would provide to much confusion. The decision was made to keep it simple
    in one file.
</p>

<h2>Installing a Locale</h2>

<p>
    To install a locale into the grid, set the locale object to the grid's <code>localeText</code>
    property. The example below shows this in action:
</p>

<p>
    The example below shows installing a locale file. The example has two local files
    <code>locale.en.js</code> and <code>locale.zzz.js</code>. The second one is a dummy
    locale, it just adds "zzz" to the start of each value. This is done so that the example
    looks different - otherwise is would just display English as normal and there would be
    no way of knowing if the locale was working or not as English is the default.
</p>
<p>
    This to try in the example are as follows:
</p>
<ol>
    <li>Open up in Plunker.</li>
    <li>
        Change the locale to English by changing <code>localeText = AG_GRID_LOCALE_ZZZ</code>
        to <code>localeText = AG_GRID_LOCALE_EN</code>.
    </li>
    <li>Edit values in <code>locale.en.js</code> and observe the changes in the grid.</li>
</ol>

<?= grid_example('Localisation', 'localisation', 'generated', ['enterprise' => true, 'exampleHeight' => 650]) ?>

<h2>Locale Callback</h2>

<p>
    Providing a locale for the grid does not fit in with localisation libraries or localisation
    for a broader application. If you want the grid to take from an application wide locale,
    then implement the <code>localeTextFunc</code> to act as a bridge between the grid
    and the applications localisation.
</p>

<p>
    The example below shows providing a callback for the grid's localisation. The example
    for simplicity just returns back the default value in upper case. In a real world application,
    the callback would use the applications localisation.
</p>

<?= grid_example('Callback', 'callback', 'generated', ['enterprise' => true, 'exampleHeight' => 650]) ?>

<p>
    In a real world application, the callback would look something like this:
</p>

<?= createSnippet(<<<SNIPPET
function localeTextFunc(key, defaultValue) {
    // to avoid key clash with external keys, we add 'grid' to the start of each key.
    var gridKey = 'grid.' + key;

    // look the value up using an application wide service
    return applicationLocaleService(gridKey);
}
SNIPPET
) ?>

<?php include '../documentation-main/documentation_footer.php';?>
