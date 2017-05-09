<?php
$key = "Column Header";
$pageTitle = "Column Header";
$pageDescription = "Explains details about the column header.";
$pageKeyboards = "grid header";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div xmlns="http://www.w3.org/1999/html">

    <h2 id="headerHeight">Column Header</h2>

    <p>
        Each column has a header at the top that typically displays the column name and has access to column
        features, such as sorting, filtering and a column menu. This page explains how you can manage the headers.
    </p>

    <h3 id="headerHeight">Header Height</h3>
    <p>
        These properties can be used to change the different heights used in the headers.
    </p>
    <?php include 'headerHeightProperties.php' ?>
    <?php printPropertiesTable($headerHeightProperties) ?>

    <h3 id="headerHeightExample">Header Height and Text Orientation Example</h3>

    <p>
        By default, the text label for the header is display horizontally, ie as normal readable text.
        To display the text in another orientation you have to provide your own css and provide with the adequate
        header heights.
    </p>


    <p>
        The following example shows how you can provide a unique look & feel to the headers. Note that:
    <ul>
        <li>The header heights have all been changed in the gridOptions:
            <pre>
[...]
<span class="codeComment">//Ahtlete Details</span>
groupHeaderHeight:75,
<span class="codeComment">//Vertically oriented column labels</span>
headerHeight: 150,
<span class="codeComment">//Floating filter</span>
floatingFiltersHeight:50,
<span class="codeComment">//Pivoting, requires turning on pivot mode</span>
pivotHeaderHeight:30,
[...]
            </pre>
        </li>
        <li>The grouped column header "Athlete details" has an specific style applied to it to make it bigger:
            <pre>
.ag-header-group-cell{
    font-size: 50px;
}
            </pre>
        </li>
        <li>
            The column labels have CSS applied to them so they are displayed vertically and the sort arrows make
            sense.
            <pre>
.ag-header-cell-label {
    transform: rotate(90deg);
    margin-top: 50px;
    text-overflow: clip;
}
.ag-header-cell-label svg{
    transform: rotate(-90deg);
}
            </pre>
        </li>
        <li>
            The floating filters are using a much bigger area and the font used is bigger and bolder.
            <pre>
.ag-floating-filter-body input{
    height:49px
}

.ag-floating-filter-button{
    margin-top: -49px;
}

.ag-floating-filter-button button {
    height:49px
}

.ag-floating-filter-body input {
    font-size: 15px;
    font-weight: bold;
}
            </pre>
        </li>
        <li>
            In pivot mode, the font size used has also been increased, but is not as big as the one used for the column
            grouping. To test this enable pivot, put athlete as a row group, and gold, silver, bronze and total as
            values
            <pre>
.ag-header-pivot{
    font-size: 18px;
}
            </pre>
        </li>
    </ul>
    </pre>


    <show-example example="exampleDynamicHeaders"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
