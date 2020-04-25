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

<h2>Mini Filter</h2>

<h2>Text Formatter</h2>

<p>
    If specified, this formats the text before applying the mini filter compare logic, useful for instance if substituting
    accented characters or if you want to perform case-sensitive mini filtering. This matches the
    <a href='../javascript-grid-filter-text/#text-formatter'>text formatter used for text filters</a>.
</p>


<snippet>
function replaceAccents(s) {
    return s
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
</snippet>


<?php include '../documentation-main/documentation_footer.php';?>
