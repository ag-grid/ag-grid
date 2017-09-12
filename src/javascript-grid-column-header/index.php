<?php
$key = "Column Header";
$pageTitle = "Column Header";
$pageDescription = "Explains details about the column header.";
$pageKeyboards = "grid header";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div xmlns="http://www.w3.org/1999/html">

    <h1 class="first-h1" id="headerHeight">Column Headers</h1>

    <p>
        Each column has a header at the top that typically displays the column name and has access to column
        features, such as sorting, filtering and a column menu. This page explains how you can manage the headers.
    </p>

    <h2 id="customHeader">Custom Header</h2>
    <p>
        If you want to customise the contents and / or behaviour of the header, then please refer to the
        section on <a href="../javascript-grid-header-rendering/">Header Components</a>.
    </p>

    <h2 id="headerHeight">Header Height</h2>
    <p>
        These properties can be used to change the different heights used in the headers.
    </p>
    <?php include 'headerHeightProperties.php' ?>
    <?php printPropertiesTable($headerHeightProperties) ?>

    <p>
        All these properties also have setter methods that can be called from the api and will change the header
        heights dynamically.
    </p>
    <?php printPropertiesTable($headerHeightApi) ?>

    <h2 id="textOrientation">Text Orientation</h2>

    <p>
        By default, the text label for the header is display horizontally, ie as normal readable text.
        To display the text in another orientation you have to provide your own css to change the orientation
        and also provide the adequate header heights using the appropriate grid property.
    </p>

    <h2 id="headerHeightExample">Header Height and Text Orientation Example</h2>

    <p>
        The following example shows how you can provide a unique look & feel to the headers. Note that:
    <ul>
        <li>The header heights have all been changed in the gridOptions:
            <snippet>
...

    //Group columns
    groupHeaderHeight:75,

    //Label columns
    headerHeight: 150,

    //Floating filter
    floatingFiltersHeight:50,

    //Pivoting, requires turning on pivot mode. Label columns
    pivotGroupHeaderHeight:50,

    //Pivoting, requires turning on pivot mode. Group columns
    pivotGroupHeaderHeight:100,

...</snippet>
        </li>
        <li>The grouped column header <i>Athlete Details</i> has an specific style applied to it to make it bigger. Note
            that the style is slightly different depending if pivoting or not:
<snippet>
.ag-pivot-off .ag-header-group-cell{
    font-size: 50px;
    color: red;
}

.ag-pivot-on .ag-header-group-cell{
    font-size: 25px;
    color: green;
}</snippet>
        </li>
        <li>
            The column labels have CSS applied to them so they are displayed vertically.
<snippet>
.ag-cell-label-container{
    /*Necessary to allow for text to grow vertically*/
    height: 100%;
}

.ag-header-cell-label {
    /*Necessary to allow for text to grow vertically*/
    height: 100%;
    padding:0 !important;
}

.ag-header-cell-label .ag-header-cell-text{
    /*Force the width corresponding at how much width
    we need once the text is layed out vertically*/
    width: 30px;
    transform: rotate(90deg);
    margin-top: 50px;
    /*Since we are rotating a span*/
    display: inline-block;
}</snippet>
        </li>
        <li>
            The floating filters are using a much bigger area and the font used is bigger and bolder.
            <snippet>
.ag-floating-filter-body input {
    height:49px
}

.ag-floating-filter-button {
    margin-top: -49px;
}

.ag-floating-filter-button button {
    height:49px
}

.ag-floating-filter-body input {
    font-size: 15px;
    font-weight: bold;
}</snippet>
        </li>
        <li>
            The styling of the column labels have also be tweaked depending if pivoting or not
<snippet>
.ag-pivot-off .ag-header-cell-label{
    color:#8a6d3b;
}

.ag-pivot-on .ag-header-cell-label{
    color:#1b6d85;
    font-weight: bold;
}</snippet>
        </li>
    </ul>
    </pre>

    <?= example('Header Height and Text Orientation', 'text-orientation', 'vanilla', array("enterprise" => 1)) ?>

    <h2 id="headerHeight">Dynamic Header Heights</h2>

    <p>
        As you can see in the example below, if you change any of the header heights, this change will be reflected automatically.
        Note how if the value is set to null, it might reuse other values. To see all the interactions check the properties
        descriptions at the top of the page
    </p>

    <?= example('Dynamic Header Height', 'dynamic-height','vanilla', array("enterprise" => 1)) ?>

    <h2 id="refresh-headers-and-footers">Refresh Headers and Footers</h2>

    <p>
        If you call <code>api.recomputeAggregates()</code>, all header and footer rows will subsequently get ripped
        out and redrawn to show the new aggregate values. If you want to refresh all headers and footers without
        recomputing the aggregates, you can call <code>api.refreshCells()</code> - useful if you want to refresh
        for reasons other than the aggregates being recomputed.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>

