<?php
$key = "Header Rendering";
$pageTitle = "ag-Grid Header Rendering";
$pageDescription = "ag-Grid Header Rendering";
$pageKeyboards = "ag-Grid Header Rendering";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="header-components">Header Components</h2>

    <p>
        You can specify what header renderer to use at the column definition level.
        If not specified, the grid's default header rendering components will be used.
    </p>

    <p>
        There are two types of header components:
        <ul>
            <li><b>Header Component</b>: For rendering the normal column headers. Configured for columns.</li>
            <li><b>Header Group Component</b>: For rendering column groups. Configured for column groups.</li>
        </ul>
    </p>

    <p>
        You specify the header component to use in the column definition (or you can set
        in the default column definition to impact all columns).
    </p>

    <pre><span class="codeComment">// a list of column definitions</span>
var myColumns = {

    <span class="codeComment">// these columns use the default header</span>
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Sport", field: "sport"},

    <span class="codeComment">// this column uses a custom header</span>
    {headerName: "Age", field: "age", headerComponent: MyHeaderComponent},

    <span class="codeComment">// you can also specify header components for groups</span>
    {
        headerName: "Medals",
        <span class="codeComment">// custom header component</span>
        headerGroupComponent: MyHeaderGroupComponent,
        children: [
            {headerName: "Gold", field: "gold"},
            {headerName: "Silver", field: "silver"},
            {headerName: "Gold", field: "bronze"}
        ]
    }
}
</pre>

    <note>
        Header Components were introduced in v8 of ag-Grid. Before this customising the header was done
        a different way. The old way is described below and marked 'deprecated'. A future version of
        ag-Grid will remove the old way. HOWEVER - we will not remove it until we have come up with a
        way to allow changing the default template of the new header components.
    </note>

    <h2 id="headerComponent">Header Component</h2>

    <p>
        This section details how to put a header component into ag-Grid. How to create header <b>group</b> components
        is explained in the next section.
    </p>

    <h3 id="grid-vs-your-responsibilities">Grid vs Your Responsibilities</h3>

    <p>
        A Header Component allows customising the inside part of the header. The component is wrapped
        inside a header cell so that the grid can take care of some complex logic that you should not
        be worried about, eg the resizing and moving of columns. The HTML of the header cell is similar
        to the following:
    </p>
<pre><span class="codeComment">// the ag-header-cell is always provided by ag-Grid</span>
<span class="codeComment">// column moving and resize logic is put on this element by the grid</span>
&lt;div class="ag-header-cell">

    <span class="codeComment">// ag-Grid will also always provide a resize bar (if column resizing</span>
    <span class="codeComment">// is enabled) and take care of all the resize logic. the grid usually</span>
    <span class="codeComment">// floats this element to the right.</span>
    &lt;div class="ag-header-cell-resize"/>

    <span class="codeComment">// checkbox for selection, if turned on.</span>
    <span class="codeComment">// the grid usually floats this element to the left.</span>
    &lt;div class="ag-header-select-all"/>

    <span class="codeComment">// the header component - this is the piece that you can customise</span>
    &lt;div class="ag-header-component"/>
&lt;/div>
</pre>

    <p>
        The grid is always responsible for the following:
        <ul>
            <li><a href="../javascript-grid-resizing/"><b>Resizing:</b></a> When enabled, the grid will put an invisible widget to be grabbed by
            the mouse for resizing.</li>
            <li><a href="../javascript-grid-selection/"><b>Checkbox Selection:</b></a> When enabled, the grid puts a checkbox for 'select all' in the header.</li>
        </ul>
    </p>

    <p>
        The header component (your bit) will be responsible for the following:
        <ul>
        <li><b>Sorting:</b> You will need to process user interaction for sorting. The default grid
        component sorts when the user clicks the header with the mouse. You may also need to display
        icons as the sort state of the column changes.</li>
        <li><b>Filtering:</b> You do not filter via the column (you filter from inside the menu), however
        you may need to display icons as the filter state of the column changes.</li>
        <li><b>Menu:</b> If you want the user to be able to open the column menu, you will need to
        manage this user interaction. The default grid component provides a button for the user to click
        to show the menu.</li>
        <li><b>Anything Else:</b> Whatever you want, you are probably creating a custom
            header to add your own functionality in.</li>
    </ul>
    </p>

    <h3 id="header-component-interface">Header Component Interface</h3>

    <p>
        Header components work similar to other component types in ag-Grid in which they should
        implement the following interface:
    </p>
    <pre>interface IHeaderComp {

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

    <span class="codeComment">// the name to display for the column. if the column is using a headerValueGetter,</span>
    <span class="codeComment">// the displayName will take this into account.</span>
    displayName: string;

    <span class="codeComment">// whether sorting is enabled for the column. only put sort logic into</span>
    <span class="codeComment">// your header if this is true.</span>
    enableSorting: boolean;

    <span class="codeComment">// whether menu is enabled for the column. only display a menu button</span>
    <span class="codeComment">// in your header if this is true.</span>
    enableMenu: boolean;

    <span class="codeComment">// callback to progress the sort for this column.</span>
    <span class="codeComment">// the grid will decide the next sort direction eg ascending, descending or 'no sort'.</span>
    <span class="codeComment">// pass multiSort=true if you want to do a multi sort (eg user has shift held down when they click)</span>
    progressSort(multiSort: boolean): void;

    <span class="codeComment">// callback to set the sort for this column.</span>
    <span class="codeComment">// pass the sort direction to use ignoring the current sort eg one of 'asc', 'desc' or null (for no sort).</span>
    <span class="codeComment">// pass multiSort=true if you want to do a multi sort (eg user has shift held down when they click)</span>
    setSort(sort: string, multiSort?: boolean): void;

    <span class="codeComment">// callback to request the grid to show the column menu.</span>
    <span class="codeComment">// pass in the html element of the column menu to have the </span>
    <span class="codeComment">// grid position the menu over the button.</span>
    showColumnMenu(menuButton: HTMLElement): void;

     <span class="codeComment">// The grid API</span>
    api: any;
}</pre>

    <h3 id="sorting">Sorting</h3>

    <p>
        How you interact with the user for sorting (eg do you listen for mouse clicks?) is up to you.
        The grid helps you by providing column state and events for getting and setting the sort.
    </p>

    <p>
        After the user requests a sort, you should call ONE of the following:
        <ol>
            <li><i>params.progressSort(multiSort):</i> This is the simplest. Call it to progress the sort on
            the column to the next stage. Using this uses the grid logic for working out what the
            next sort stage is (eg 'descending' normally follows 'ascending').</li>
            <li><i>params.setSort(direction, multiSort):</i> Use this to set to sort to a specific state. Use this
            if you don't want to use the grids logic for working out the next sort state.</li>
        </ol>
    </p>

    <pre><span class="codeComment">// option 1) tell the grid when you want to progress the sorting</span>
myHeaderElement.addEventListener('click', function(event) {
    <span class="codeComment">// in this example, we do multi sort if shift key is pressed</span>
    params.progressSort(event.shiftKey);
});

<span class="codeComment">// or option 2) tell the grid when you want to set the sort explicitly</span>
<span class="codeComment">// button that always sorts ASCENDING</span>
mySortAscButton.addEventListener('click', function(event) {
    params.setSort('asc', event.shiftKey);
});
<span class="codeComment">// button that always sorts DESCENDING</span>
mySortDescButton.addEventListener('click', function(event) {
    params.setSort('desc', event.shiftKey);
});
</pre>

    <p>
        To know when a column's sort state has change (eg when to update your icons), you should listen
        for <i>sortChanged</i> event on the column.
    </p>
    <pre><span class="codeComment">// listen to the column for sort events</span>
column.addEventListener('sortChanged', function() {

    <span class="codeComment">// get sort state from column</span>
    var sort = column.getSort();
    console.log('sort state of column is ' + sort); <span class="codeComment">// prints one of ['asc',desc',null]</span>

    <span class="codeComment">// then do what you need, eg set relevant icons visible</span>
    var sortingAscending = sort==='asc';
    var sortingDescending = sort==='desc';
    var notSorting = !sortingAscending && !sortingDescending;
    <span class="codeComment">// how you update your GUI accordingly is up to you</span>
});

<span class="codeComment">// don't forget to remove your listener in your destroy code</span>
</pre>

    <h3 id="filtering">Filtering</h3>

    <p>
        The header doesn't normally initiate filtering. If it does, use the standard grid API to
        set the filter. The header will typically display icons when the filter is applied. To
        know when to show a filter icon, listen to the column for filterChanged events.
    </p>

    <pre><span class="codeComment">// listen to the column for filter events</span>
column.addEventListener('filterChanged', function() {
    <span class="codeComment">// when filter changes on the col, this will print one of [true,false]</span>
    console.log('filter of column is ' + column.isFilterActive());
});

<span class="codeComment">// don't forget to remove your listener in your destroy code</span>
</pre>


    <h3 id="menu">Menu</h3>

    <p>
        How you get the user to ask for the column menu is up to you. When you want to display
        the menu, call the <i>params.showColumnMenu()</i> callback. The callback takes the HTML
        element for the button so that it can place the menu over the button (so the menu appears
        to drop down from the button).
    </p>

    <pre>myMenuButton.addEventListener('click', function() {
    params.showColumnMenu(myMenuButton);
});</pre>

    <h3 id="complementing-params">Complementing Params</h3>

    <p>
        On top of the parameters provided by the grid, you can also provide your own parameters.
        This is useful if you want to 'configure' your header component. For example, you might
        have a header component for formatting currency but that needs the currency symbol.
    </p>

    <pre>colDef = {
    ...
    headerComponent: MyHeaderComponent;
    headerComponentParams : {
        currencySymbol: '£' <span class="codeComment">// the pound symbol will be placed into params</span>
    }
}
</pre>

    <h3 id="example-header-component">Example - Header Component</h3>

    <p>
        The example below shows a header component in action. The following can be observed
        in the demo:
        <ul>
            <li>Column moving and resizing is working without requiring any logic in the header component.</li>
            <li>Some columns have suppressMenu=true, so the header component doesn't show the menu.</li>
            <li>Some columns have suppressSorting=true, so the header component doesn't add sorting logic.</li>
            <li>The header component uses additional parameters to allowing configuring the menu icon.</li>
        </ul>
    </p>

    <show-example example="exampleHeaderComponent"></show-example>

    <h2 id="headerGroupComponent">Header Group Component</h2>

    <p>
        This section details how to put a header group component into ag-Grid.
    </p>

    <h3 id="grid-vs-your-responsibilities">Grid vs Your Responsibilities</h3>

    <p>
        As with normal headers, ag-Grid will always handle resize and column moving.
        The grid does not handle selection checkbox as this feature is only at the
        non-grouped header level.
        The header group component (your bit) is responsible for the following:
    </p>

    <ul>
        <li><b>Group Open / Close:</b> If the group can expand (one or more columns visibility
        depends on the open / closed state of the group) then your header group component
        should handle the interaction with the user for opening and closing groups.</li>
        <li><b>Anything Else:</b> Whatever you want, it's your component!</li>
    </ul>

    <h3 id="header-group-component-interface">Header Group Component Interface</h3>

    <p>
        The header group component interface is almost identical to the above header component.
        The only difference is the params object passed to the <i>init()</i> method.
    </p>

    <pre>export interface IHeaderGroupComp {

    <span class="codeComment">// optional method, gets called once with params</span>
    init?(params: IHeaderGroupCompParams): void;

    <span class="codeComment">// gets called once, you should return the HTML element</span>
    getGui(): HTMLElement;

    <span class="codeComment">// optional method, gets called once, when component is destroyed</span>
    destroy?(): void;

}</pre>


    <p>The params passed to <i>init()</i> are as follows:</p>
    <pre>export interface IHeaderGroupParams {

    <span class="codeComment">// the column group the header is for</span>
    columnGroup: ColumnGroup;

    <span class="codeComment">// the text label to render. if the column is using a headerValueGetter,</span>
    <span class="codeComment">// the displayName will take this into account.</span>
    displayName: string;

    <span class="codeComment">// opens / closes the column group</span>
    setExpanded(expanded: boolean): void;
}</pre>

    <h3 id="opening-closing-groups">Opening / Closing Groups</h3>

    <p>
        Not all column groups can open and close, so you should display open / close
        features accordingly. To check if a column group should have
        open / close functionality, check the <i>isExpandable()</i> method on the column
        group.
    </p>

    <pre>var showExpandableIcons = params.columnGroup.isExpandable()</pre>

    <p>
        To check if a column group is open or closed, check the <i>isExpanded()</i> method
        on the column group.
    </p>

    <pre>var groupIsOpen = params.columnGroup.isExpanded();</pre>

    <p>
        To open / close a column group, use the <i>params.setExpanded(boolean)</i> method.
    </p>

    <pre><span class="codeComment">// this code toggles the expanded state</span>
var oldValue = params.columnGroup.isExpanded();
var newValue = !oldValue;
params.setExpanded(newValue);</pre>

    <p>
        To know if a group is expanded or collapsed, listen for the <i>expandedChanged</i>
        event on the column group.
    </p>

    <pre><span class="codeComment">// get a reference to the original column group</span>
var columnGroup = params.columnGroup.getOriginalColumnGroup();
<span class="codeComment">// create listener</span>
var listener = function() { console.log('group was opened or closed'); };
<span class="codeComment">// add listener</span>
columnGroup.addEventListener('expandedChanged', listener);

<span class="codeComment">// don't forget to remove the listener in your destroy method</span>
columnGroup.removeEventListener('expandedChanged', listener);</pre>

    <h3 id="example-header-group-cells">Example - Header Group Cells</h3>

    <show-example example="exampleHeaderGroupComponent"></show-example>

    <?php if (isFrameworkAngular2()) { ?>
        <?php include './angular.php';?>
    <?php } ?>

    <?php if (isFrameworkAurelia()) { ?>
        <?php include './aurelia.php';?>
    <?php } ?>

    <?php if (isFrameworkReact()) { ?>
        <?php include './react.php';?>
    <?php } ?>

    <?php if (isFrameworkVue()) { ?>
        <?php include './vuejs.php';?>
    <?php } ?>

    <hr>
    <p>&nbsp;</p>
    <p>&nbsp;</p>

    <!-- old bit, to be removed when we release v9 -->

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

        <h4 id="grid-api">Grid API</h4>

        <p>There are two methods useful in the API for showing the column menu if you don't like the provided logic:</p>
        <ul>
            <li><b>showColumnMenuAfterButtonClick(colKey, buttonElement)</b>: Shows a menu and positions relative
                to the provided button element - so it appears over the element giving the impression of the dropdown menu.</li>
            <li><b>showColumnMenuAfterMouseClick(colKey, mouseEvent)</b>: Shows a menu and positions relative
                to the provided mouse event - use this for context menu, so the menu appears where you click the mouse.</li>
        </ul>
        <p>It is unusual to use these methods, only use them if you can't get what you want from the normal behaviour.</p>

        <h4 id="example-header-template">Example Header Template</h4>
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

        <h4 id="header-templates-and-custom-icons">Header Templates and Custom Icons</h4>

        <p>
            If you are providing your own header template, then any custom icons you specify in the
            <i>gridOptions.icons</i> will be ignored.
        </p>

    </div>

    <div style="border-left: 4px solid lightcoral; padding-left: 4px;">
        <h2 id="deprecated-header-rendering"><span style="color: darkred;">DEPRECATED -</span> Header Rendering</h2>

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
            You have the option to use AngularJS 1.x for the custom renderer. If you require AngularJS 1.x for header
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
