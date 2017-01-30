<?php
$key = "Header Rendering";
$pageTitle = "ag-Grid Header Rendering";
$pageDescription = "ag-Grid Header Rendering";
$pageKeyboards = "ag-Grid Header Rendering";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Header Rendering</h2>

    <p>
        Header rendering is done using header components. You can specify header components to change the
        look and / or behaviour of the headers in the grid. There are two types of header components:
        <ul>
            <li><b>Header Component</b>: For rendering the normal column headers.</li>
            <li><b>Header Group Component</b>: For rendering column groups.</li>
        </ul>
    </p>

    <note>
        Header Components were introduced in v8 of ag-Grid. Before this customising the header was done
        a different way. The old way is described below and marked 'deprecated'. V9 of ag-Grid will remove
        support for the old way.
    </note>

    <h2 id="headerComponent">Header Component</h2>

    <p>
        This section details how to put a header component into ag-Grid.
    </p>

    <h3>Grid vs Your Responsibilities</h3>

    <p>
        A Header Component allows customising the inside part of the header. The component is wrapped
        inside a header cell so that the grid can take care of some logic that you don't want to
        customise, eg the resizing and moving of columns. The HTML of the header cell is similar
        to the following:
    </p>
<pre><span class="codeComment">// the ag-header-cell is always provided by ag-Grid</span>
<span class="codeComment">// column moving and resize logic is put on this element by the grid</span>
&lt;div class="ag-header-cell">

    <span class="codeComment">// ag-Grid will also always provide a resize bar if required</span>
    <span class="codeComment">// and take care of all the resize logic</span>
    &lt;div class="ag-header-cell-resize"/>

    <span class="codeComment">// the header component - this is the piece that you can customise</span>
    &lt;div class="ag-header-component"/>
&lt;/div>
</pre>

    <p>
        The grid is always responsible for placing, moving and resizing columns. The header component
        is responsible for the following:
        <ul>
        <li><b>Sorting:</b> You will need to process user interaction for sorting, the default grid
        component sorts when the user clicks the header with the mouse. You may also need to display
        icons as the sort state of the column changes.</li>
        <li><b>Filtering:</b> You do not filter via the column (you filter from inside the menu), however
        you may need to display icons as the filter state of the column changes.</li>
        <li><b>Menu:</b> If you want the user to be able to open the column menu, you will need to
        manage this user interaction.</li>
    </ul>
    </p>

    <h3>Header Component Interface</h3>

    <p>
        Header components work similar to other component types in ag-Grid in which they should
        implement the following interface:
    </p>
    <pre>export interface IHeaderComp {

    <span class="codeComment">// optional method, gets called once with params</span>
    init?(params: IHeaderCompParams): void;

    <span class="codeComment">// gets called once, you should return the HTML element</span>
    getGui(): HTMLElement;

    <span class="codeComment">// optional method, gets called once, when component is destroyed</span>
    destroy?(): void;

}</pre>

    <p>The params passed to <i>init()</i> are as follows:</p>
    <pre>export interface IHeaderCompParams {

    <span class="codeComment">// the column the header is for</span>
    column: Column;

    <span class="codeComment">// the text label to render. if the column is using a headerValueGetter,</span>
    <span class="codeComment">// the displayName will take this into account.</span>
    displayName: string;

    <span class="codeComment">// whether sorting is enabled for the column. only put sort logic into</span>
    <span class="codeComment">// your header if this is true.</span>
    enableSorting: boolean;

    <span class="codeComment">// whether menu is enabled for the column. only display a menu button</span>
    <span class="codeComment">// in your header if this is true.</span>
    enableMenu: boolean;

    <span class="codeComment">// callback to request the grid to sort by this column. pass multiSort=true</span>
    <span class="codeComment">// if you want to do a multi sort (eg user has shift held down when they click)</span>
    progressSort(multiSort: boolean): void; <span style="color: darkred; ">##### is this method name right?</span>

    <span class="codeComment">// callback to request the grid to show the column menu.</span>
    <span class="codeComment">// pass in the html element of the column menu to have the </span>
    <span class="codeComment">// grid position the menu over the button.</span>
    showColumnMenu(menuButton: HTMLElement): void; <span style="color: darkred; ">##### is this method name right?</span>
}</pre>

    <h3>Sorting</h3>

    <p>
        How you interact with the user for sorting (eg do you listen for mouse clicks?) is up to you.
        The grid helps you by providing column state and events.
    </p>

    <p>
        After the user requests a sort, you should call the progresSort() <span style="color: darkred; ">##### is this method name right?</span> method on the params callback.
    </p>

    <pre><span class="codeComment">// tell the grid when you want to progress the sorting</span>
myHeaderElement.addEventListener('click', function() {
    params.progressSort(); <span style="color: darkred; ">##### is this method name right?</span>
});
</pre>

    <p>
        To know when a column's sort state has change (eg when to update your icons), you should listen
        for <i>sortChanged</i> events on the columns.
    </p>
    <pre><span class="codeComment">// listen to the column for sort events</span>
column.addEventListener('sortChanged', function() {
    <span class="codeComment">// when sort changes on the col, this will print one of ['asc',desc',null]</span>
    console.log('sort state of column is ' + column.getSort());
});</pre>

    <h3>Filtering</h3>

    <p>
        The header doesn't normally initiate filtering. If it does, use the standard grid API to
        set the filter. The header will typically display icons when the filter is applied. To
        know when to show a filter icon, listen to the column for filterChanged events.
    </p>

    <pre><span class="codeComment">// listen to the column for filter events</span>
column.addEventListener('filterChanged', function() {
    <span class="codeComment">// when filter changes on the col, this will print one of [true,false]</span>
    console.log('filter of column is ' + column.isFilterActive());
});</pre>

    <note>
        Remember to remove listeners to the column if you add them. This can be done in the destroy
        method of your header component.
    </note>

    <h3>Menu</h3>

    <p>
        How you get the user to ask for the column menu is up to you. When you want to display
        the menu, call the <i>params.showColumnMenu() callback.</i>
    </p>

    <pre>myMenuButton.addEventListener('click', function() {
    params.showColumnMenu(myMenuButton);
});</pre>

    <h3>Example - Header Cells</h3>

    <p style="color: darkgreen; font-size: 30px;">
        Alberto to provide example
    </p>

    <h2>Header Group Rendering</h2>

    <div style="border-left: 4px solid lightcoral; padding-left: 4px;">
        <h2><span style="color: darkred;">DEPRECATED -</span> Header Templates</h2>

        <note>Header components (explained above) replace the need for header templates. If using header templates,
            you should refactor your code to use header components instead. Support for header templates will be
            dropped in ag-Grid v9.</note>

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
            <li>agHeaderCellLabel - Container when clicked the column will sort. Usually contains text and icons.</li>
        </ul>
        The grid will then attach the relevant logic to each element. If you do NOT include any of
        the above, the grid will still work but just not display what's missing, eg if missing agFilter,
        then when filtering, the grid will not try and show the filter icon.
        </p>

        <note>
            The template you provide must contain exactly one root DOM element (eg a div) and should not contain
            any leading or trailing spaces before the start and end tags.
        </note>

        <h4>Grid API</h4>

        <p>There are two methods useful in the API for showing the column menu if you don't like the provided logic:</p>
        <ul>
            <li><b>showColumnMenuAfterButtonClick(colKey, buttonElement)</b>: Shows a menu and positions relative
            to the provided button element - so it appears over the element giving the impression of the dropdown menu.</li>
            <li><b>showColumnMenuAfterMouseClick(colKey, mouseEvent)</b>: Shows a menu and positions relative
            to the provided mouse event - use this for context menu, so the menu appears where you click the mouse.</li>
        </ul>
        <p>It is unusual to use these methods, only use them if you can't get what you want from the normal behaviour.</p>

        <h4>Example Header Template</h4>
        <p>
            The example below shows defining header templates in different ways. The <i>gridOptions.headerCellTemplate</i>
            is provided with a string of HTML that is used for all the columns bar 'Athlete' and 'Country'.
            The 'Country' column
            definition is provided with a function that returns a DOM element (not a string) with some functionality
            attached to it. The functionality shows a message when you click on the additional 'Calendar' icon.

            The 'Athlete' column uses the two api methods above, one api method to show menu when you mouse click on the button,
            and the other api method to show menu when you right click on the athlete header.
        </p>
        <show-example example="exampleHeaderTemplate"></show-example>

        <p>
            For your reference, the default header template is as follows:
        </p>
        <pre><code>&lt;div class="ag-header-cell">
        &lt;div id="agResizeBar" class="ag-header-cell-resize">&lt;/div>
        &lt;span id="agMenu" class="ag-header-icon ag-header-cell-menu-button">&lt;/span>
        &lt;div id="agHeaderCellLabel" class="ag-header-cell-label">
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

    </div>

    <div style="border-left: 4px solid lightcoral; padding-left: 4px;">
        <h2><span style="color: darkred;">DEPRECATED -</span> Header Rendering</h2>

        <note>Header components (explained above) replace the need for header rendering. If using header rendering,
            you should refactor your code to use header components instead. Support for header rendering will be
            dropped in ag-Grid v9.</note>

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

</div>

<?php include '../documentation-main/documentation_footer.php';?>
