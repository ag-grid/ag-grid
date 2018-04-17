<?php
$pageTitle = "Column Header: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Column Headers. The display of column headers can be fine-tuned to change Header Height and Text Orientation for example. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "grid header";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1>Column Headers</h1>

    <p class="lead">
        Each column has a header at the top that typically displays the column name and has access to column
        features, such as sorting, filtering and a column menu. This page explains how you can manage the headers.
    </p>

    <h2>Header Templates</h2>

    <p>
        You can provide a header template used by the default header component for simple layout changes. If you
        want to change the behaviour, please look at creating your own <a href="../javascript-grid-header-rendering/">Custom Header Component.</a>
        The template for the default header is specified in <code>columnDef.headerParams.template</code>
    </p>

    <p>
        This is the default template used in ag-grid
    </p>

    <snippet>&lt;div class="ag-cell-label-container" role="presentation"&gt;
    &lt;span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"&gt;&lt;/span&gt;
    &lt;div ref="eLabel" class="ag-header-cell-label" role="presentation"&gt;
        &lt;span ref="eText" class="ag-header-cell-text" role="columnheader"&gt;&lt;/span&gt;
        &lt;span ref="eFilter" class="ag-header-icon ag-filter-icon"&gt;&lt;/span&gt;
        &lt;span ref="eSortOrder" class="ag-header-icon ag-sort-order" &gt;&lt;/span&gt;
        &lt;span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" &gt;&lt;/span&gt;
        &lt;span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" &gt;&lt;/span&gt;
        &lt;span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" &gt;&lt;/span&gt;
    &lt;/div&gt;
&lt;/div&gt;</snippet>

    <p>When you provide your own template, everything should work as expected as long as you reuse the same refs.</p>
    <table class="table reference">
        <tr>
            <th>Ref</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>eLabel</th>
            <td>The container where there is going to be an onClick mouse listener to trigger the sort.</td>
        </tr>
        <tr>
            <th>eText</th>
            <td>The text displayed on the column</td>
        </tr>
        <tr>
            <th>eFilter</th>
            <td>The container with the icon that will appear if the user filters this column.</td>
        </tr>
        <tr>
            <th>eSortOrder</th>
            <td>In case of sorting my multiple columns, this shows the index that represents the position
                of this column in the order.</td>
        </tr>
        <tr>
            <th>eSortAsc</th>
            <td>In case of sorting ascending the data in the column, this shows the associated icon.</td>
        </tr>
        <tr>
            <th>eSortDesc</th>
            <td>In case of sorting descending the data in the column, this shows the descending icon.</td>
        </tr>
        <tr>
            <th>eSortNone</th>
            <td>In case of no sort being applied, this shows the associated icon. Note this icon by default is empty</td>
        </tr>
    </table>

    <p>
        The ref parameters are used by the grid to identify elements to add functionality to. If you leave an element
        out of your template, the functionality will not be added. For example if you do not specify <code>eLabel</code>
        then the column will not react to click events for sorting.
    </p>

    <note>
        Templates are not meant to let you configure icons, If you are
        looking to change the icons, check our <a href="../javascript-grid-icons">icon docs</a>
    </note>

    <h3>Example - Simple Header Templates</h3>

    <p>
        In the following example you can see how we are reusing the default grid template to change the layout of
        the elements.
    </p>

    <snippet>defaultColDef : {
    width: 100,
    headerComponentParams : {
    template:
        '&lt;div class="ag-cell-label-container" role="presentation"&gt;' +
        '  &lt;span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"&gt;&lt;/span&gt;' +
        '  &lt;div ref="eLabel" class="ag-header-cell-label" role="presentation"&gt;' +
        '    &lt;span ref="eSortOrder" class="ag-header-icon ag-sort-order" &gt;&lt;/span&gt;' +
        '    &lt;span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" &gt;&lt;/span&gt;' +
        '    &lt;span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" &gt;&lt;/span&gt;' +
        '    &lt;span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" &gt;&lt;/span&gt;' +
        '    ** &lt;span ref="eText" class="ag-header-cell-text" role="columnheader"&gt;&lt;/span&gt;' +
        '    &lt;span ref="eFilter" class="ag-header-icon ag-filter-icon"&gt;&lt;/span&gt;' +
        '  &lt;/div&gt;' +
        '&lt;/div&gt;'
    }
}</snippet>

    <p>
        Note that specifying your own templates is compatible with other configurations: 
    </p>
<ul class="content">
        <li>suppressMenu is especified in: Athlete, Country, Date and Bronze columns</li>
        <li>suppressSorting is especified in: Age, Year, Sport Silver and Total columns</li>
        <li>Gold is the only column that doesn't have suppressSorting or suppressSort</li>
    </ul>

    <?= example('Header template', 'header-template', 'vanilla', array("extras" => array("fontawesome"))) ?>

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

    <h3>Example - Header Height and Text Orientation</h3>

    <p>
        The following example shows how you can provide a unique look & feel to the headers. Note that:
    </pre>
    <ul class="content">
        <li>The header heights have all been changed in the gridOptions:
<snippet>
/* Group columns */
groupHeaderHeight:75,

/* Label columns */
headerHeight: 150,

/* Floating filter */
floatingFiltersHeight:50,

/* Pivoting, requires turning on pivot mode. Label columns */
pivotGroupHeaderHeight:50,

/* Pivoting, requires turning on pivot mode. Group columns */
pivotGroupHeaderHeight:100,
</snippet>
        </li>
        <li>The grouped column header <code>Athlete Details</code> has an specific style applied to it to make it bigger. Note
            that the style is slightly different depending if pivoting or not:
<snippet language="css">
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
<snippet language="css">
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

<snippet language="css">
.ag-floating-filter-body input {
    height:49px;
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
<snippet language="css">
.ag-pivot-off .ag-header-cell-label{
    color:#8a6d3b;
}

.ag-pivot-on .ag-header-cell-label{
    color:#1b6d85;
    font-weight: bold;
}</snippet>
        </li>
    </ul>

    <?= example('Header Height and Text Orientation', 'text-orientation', 'generated', array("enterprise" => 1)) ?>

    <h2 id="headerHeight">Dynamic Header Heights</h2>

    <p>
        As you can see in the example below, if you change any of the header heights, this change will be reflected automatically.
        Note how if the value is set to null, it might reuse other values. To see all the interactions check the properties
        descriptions at the top of the page
    </p>

    <?= example('Dynamic Header Height', 'dynamic-height', 'generated', array("enterprise" => 1)) ?>

    <h2 id="customHeader">Custom Header</h2>
    <p>
        Header templates are meant to be used for simple UI customisation, if you need to have more control over the
        header check how to create your own <a href="../javascript-grid-header-rendering/">Header Components</a>.
    </p>



<?php include '../documentation-main/documentation_footer.php';?>

