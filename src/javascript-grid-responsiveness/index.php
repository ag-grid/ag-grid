<?php
$key = "Responsiveness";
$pageTitle = "ag-Grid Responsiveness";
$pageDescription = "ag-Grid Responsive Web Design";
$pageKeyboards = "ag-Grid Responsive Web Design";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="responsiveness">Responsive Web Design</h2>

    <p>
        We can dynamically react to screen changes by making use of the grid API features. In this section we describe
        a few recommended approaches to resize the grid and show/hide columns based on screen size changes.
    </p>

    <note>These recipes below are suggestions - as the grid can be placed & positioned in your application in many ways and
    with many frameworks the suggestions below may not work out of the box in your particular application, but they should serve
    to help point you in the right direction.</note>

    <h3>Dynamic Resizing with Horizontal Scroll</h3>

    <p>
        The quickest way to achieve a responsive grid is to set the grid's containing div to a percentage. With this
        simple change the grid will automatically resize based on the div size and columns that can't fit in the viewport
        will simply be hidden and available to the right via the scrollbar.
    </p>

    <show-example example="example"></show-example>

    <h3>Dynamic Resizing without Horizontal Scroll</h3>

    <p>Sometimes you want to have columns that don't fit in the current viewport to simply be hidden altogether with no
    horizontal scrollbar.</p>

    <p>To achieve this determine the width of the grid and work out how many columns could fit in that space, hiding any that
    don't fit, constantly updating based on the <code>gridSizeChanged</code> event firing:</p>

<pre>
<span class="codeComment">// get the current grids width</span>
var gridWidth = document.getElementById('myGrid').offsetWidth;

<span class="codeComment">// keep track of which columns to hide/show</span>
var columnsToShow = [];
var columnsToHide = [];

<span class="codeComment">// iterate over all columns (visible or not) and work out</span>
<span class="codeComment">// now many columns can fit (based on their minWidth)</span>
var totalColsWidth = 0;
var allColumns = gridOptions.columnApi.getAllColumns();
for (var i = 0; i < allColumns.length; i++) {
    let column = allColumns[i];
    totalColsWidth += column.getMinWidth();
    if(totalColsWidth > gridWidth) {
        columnsToHide.push(column.colId);
    } else {
        columnsToShow.push(column.colId);
    }
}

<span class="codeComment">// show/hide columns based on current grid width</span>
gridOptions.columnApi.setColumnsVisible(columnsToShow, true);
gridOptions.columnApi.setColumnsVisible(columnsToHide, false);

<span class="codeComment">// fill out any available space to ensure there are no gaps</span>
gridOptions.api.sizeColumnsToFit();
</pre>

    <p>This example is best seen when opened in a new tab - then change the horizontal size of the browser and watch as
    columns hide/show based on the current grid size.</p>

    <show-example example="example1"></show-example>

    <h3>Dynamic Vertical Resizing</h3>

    <p>Sometimes the vertical height of the grid is greater than the number of rows you have it in.  You can dynamically
    set the row heights to fill the available height as follows:</p>

<pre>
<span class="codeComment">// get the height of the grid body - this excludes the height of the headers</span>
var gridHeight = document.getElementsByClassName('ag-body')[0].offsetHeight;

<span class="codeComment">// get the rendered rows</span>
var renderedRows = gridOptions.api.getRenderedNodes();

<span class="codeComment">// if the rendered rows * min height is greater than available height, just just set the height</span>
<span class="codeComment">// to the min and let the scrollbar do its thing</span>
if(renderedRows.length * minRowHeight >= gridHeight) {
    if(currentRowHeight !== minRowHeight) {
        currentRowHeight = minRowHeight;
        gridOptions.api.resetRowHeights();
    }
} else {
    <span class="codeComment">// set the height of the row to the grid height / number of rows available</span>
    currentRowHeight = Math.floor(gridHeight / renderedRows.length);
    console.log(gridHeight + " / " + currentRowHeight);
    gridOptions.api.resetRowHeights();
}
</pre>

    <p>This example is best seen when opened in a new tab - then change the horizontal size of the browser and watch as
        columns hide/show based on the current grid size.</p>

    <show-example example="example2"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
