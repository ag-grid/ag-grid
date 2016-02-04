<?php
$key = "Header Rendering";
$pageTitle = "AngularJS Angular Grid Header Rendering";
$pageDescription = "AngularJS Angular Grid Header Rendering";
$pageKeyboards = "AngularJS Angular Grid Header Rendering";
include '../documentation_header.php';
?>

<div>

    <h2>Header Templates & Rendering</h2>

    <p>
        You can change how the headers in the grid are rendered. You have two choices:
        <ul>
        <li><b>Header Templates:</b> This allows full control of the entire header cell, including
        icons (menu, filter, sort) and resize drag bar. Good if you want to structure the entire
        header differently e.g. move icons above text label.</li>
        <li><b>Header Rendering:</b> This keeps the template and allows you to render specifics in
        the label part of the header. Good if you want cosmetic changes to the label only e.g.
        include an image instead of text for the label.</li>
    </ul>

    <h2>Header Templates</h2>

    <p>
        You provide a header template to change the overall layout of a header cell. You can provide
        header templates in the following places:
    <ul>
        <li><b>colDef.headerCellTemplate:</b> Can be a string of HTML, a DOM element, or a function
            that returns a string of HTML or a DOM element.</li>
        <li><b>gridOptions.headerCellTemplate:</b> Can be a string of HTML or a DOM element.</li>
        <li><b>gridOptions.getHeaderCellTemplate:</b> A function that returns a string of HTML or
            a DOM element.</li>
    </ul>
    </p>

    <p>
        The list above is confusing. What it's saying is you can specify the template in the colDef
        or the gridOptions. If colDef, one property is used for function and non-function variants.
        For gridOptions, the function and non-function variant is split. This was to keep the grid
        consistent with other properties and callbacks.
    </p>

    <p>
        The parameters available to the function variant are as follows:
    </p>

    <table class="table">
        <tr>
            <th>Value</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>column</th>
            <td>The column this header is for.</td>
        </tr>
        <tr>
            <th>colDef</th>
            <td>The colDef this header is for.</td>
        </tr>
        <tr>
            <th>context</th>
            <td>The grid context, as provided in the gridOptions.</td>
        </tr>
        <tr>
            <th>api</th>
            <td>The grid API.</td>
        </tr>
    </table>

    <p>
        To get the template to work, you just need to ensure it has the following IDs:
    <ul>
        <li>agResizeBar - The resize bar.</li>
        <li>agSortDesc - Icon for descending sort.</li>
        <li>agSortAsc - Icon for ascending sort.</li>
        <li>agNoSort - Icon for 'no sort'.</li>
        <li>agFilter - Icon for filter.</li>
        <li>agText - Container to put header title.</li>
    </ul>
    The grid will then attach the relevant logic to each element. If you do NOT include any of
    the above, the grid will still work but just not display what's missing, eg if missing agFilter,
    then when filtering, the grid will not try and show the filter icon.
    </p>


    <p>
        The example below shows defining header templates in different ways. The <i>gridOptions.headerCellTemplate</i>
        is provided with a string of HTML that is used for all the columns bar 'Country'. The 'Country' column
        definition is provided with a function that returns a DOM element (not a string) with some functionality
        attached to it. The functionality shows a message when you click on the additional 'Calendar' icon.
    </p>
    <show-example example="exampleHeaderTemplate"></show-example>

    <p>
        For your reference, the default header template is as follows:
    </p>
    <pre><code>&lt;div class="ag-header-cell">
    &lt;div id="agResizeBar" class="ag-header-cell-resize">&lt;/div>
    &lt;span id="agMenu" class="ag-header-icon ag-header-cell-menu-button">&lt;/span>
    &lt;div class="ag-header-cell-label">
        &lt;span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon">&lt;/span>
        &lt;span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon">&lt;/span>
        &lt;span id="agNoSort" class="ag-header-icon ag-sort-none-icon">&lt;/span>
        &lt;span id="agFilter" class="ag-header-icon ag-filter-icon">&lt;/span>
        &lt;span id="agText" class="ag-header-cell-text">&lt;/span>
    &lt;/div>
&lt;/div></code></pre>

    <h4>Header Templates and Custom Icons</h4>

    <p>
        If you are providing your own header template, then any custom icons you specify in the
        <i>gridOptions.icons</i> will be ignored.
    </p>

    <h2>Header Rendering</h2>

    <p>
        Header rendering allows you to control what's inside the label in a header.
        The default header rendering can be replaced by providing a header renderer in the grid options
        (for all columns), or by specifying it for individual columns.
    </p>

    <p>
        As with the cell renderers, the header renderer is a function that takes params specific to the
        column. The returned result can be a) a string of HTML or b) an HTML element object.
    </p>

    <p>
        You have the option to use AngularJS for the custom renderer. If you require AngularJS for header
        rendering, then set the grid option value 'angularCompileHeaders' to true.
    </p>

    <p>
        Header renderers receive the following parameters:
    </p>

    <table class="table">
        <tr>
            <th>Value</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>value</th>
            <td>The value to render, ie the header name.</td>
        </tr>
        <tr>
            <th>colDef</th>
            <td>The colDef this header is for.</td>
        </tr>
        <tr>
            <th>context</th>
            <td>The grid context, as provided in the gridOptions.</td>
        </tr>
        <tr>
            <th>$scope</th>
            <td>If Angular compiling the headers, contains the scope for this header column.</td>
        </tr>
        <tr>
            <th>api</th>
            <td>The grid API.</td>
        </tr>
        <tr>
            <th>eHeaderCell</th>
            <td>The outer header cell. Unlike cellRenderers, this is not virtual, it's the actual cell.</td>
        </tr>
    </table>

    <p>
        The example below shows using a header renderer to add angle brackets to the header
        name and to also add click handling to the header, so that the header changes color with a click.
    </p>

    <show-example example="example1"></show-example>

</div>

<?php include '../documentation_footer.php';?>
