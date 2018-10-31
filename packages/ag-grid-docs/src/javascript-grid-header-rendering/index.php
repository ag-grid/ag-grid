<?php
$pageTitle = "ag-Grid Components: Header Components";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It supports the use of components, here we discuss how to implment Header Components.";
$pageKeyboards = "ag-Grid Header Rendering";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

    <h1>Header Components</h1>

    <p>
        You can specify what header renderer to use at the column definition level.
        If not specified, the grid's default header rendering components will be used.
    </p>

    <p>
        There are two types of header components:
    </p>

    <ul class="content">
        <li><b>Header Component</b>: For rendering the normal column headers. Configured for columns.</li>
        <li><b>Header Group Component</b>: For rendering column groups. Configured for column groups.</li>
    </ul>

    <p>
        You specify the header component to use in the column definition (or you can set
        in the default column definition to impact all columns).
    </p>

    <snippet>
// a list of column definitions
var myColumns = {

    // these columns use the default header
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Sport", field: "sport"},

    // this column uses a custom header
    {headerName: "Age", field: "age", headerComponent: MyHeaderComponent},

    // you can also specify header components for groups
    {
        headerName: "Medals",
        // custom header component
        headerGroupComponent: MyHeaderGroupComponent,
        children: [
            {headerName: "Gold", field: "gold"},
            {headerName: "Silver", field: "silver"},
            {headerName: "Gold", field: "bronze"}
        ]
    }
}
    </snippet>

    <h2 id="headerComponent">Header Component</h2>

    <p>
        This section details how to put a header component into ag-Grid. How to create header group components is
        explained in the next section.
    </p>

    <h3 id="grid-vs-your-responsibilities">Grid vs Your Responsibilities</h3>

    <p>
        A Header Component allows customising the inside part of the header. The component is wrapped
        inside a header cell so that the grid can take care of some complex logic that you should not
        be worried about, eg the resizing and moving of columns. The HTML of the header cell is similar
        to the following:
    </p>

    <snippet language="html">
&lt;!-- the ag-header-cell is always provided by ag-Grid --&gt;
&lt;!-- column moving and resize logic is put on this element by the grid --&gt;
&lt;div class="ag-header-cell"&gt;

&lt;!-- ag-Grid will also always provide a resize bar (if column resizing
 is enabled) and take care of all the resize logic. the grid usually
 floats this element to the right.--&gt;
&lt;div class="ag-header-cell-resize"&gt;&lt;/div&gt;

&lt;!-- checkbox for selection, if turned on.
 the grid usually floats this element to the left. --&gt;
&lt;div class="ag-header-select-all"&gt;&lt;/div&gt;

&lt;!-- the header component - this is the piece that you can customise --&gt;
&lt;div class="ag-header-component"&gt; &lt;/div&gt;
    </snippet>

    <p> The grid is always responsible for the following: </p>

    <ul class="content">
        <li><a href="../javascript-grid-resizing/"><b>Resizing:</b></a> When enabled, the grid will put an invisible
            widget to be grabbed by
            the mouse for resizing.
        </li>
        <li><a href="../javascript-grid-selection/"><b>Checkbox Selection:</b></a> When enabled, the grid puts a
            checkbox for 'select all' in the header.
        </li>
    </ul>

    <p>
        The header component (your bit) will be responsible for the following:
    </p>

    <ul class="content">
        <li><b>Sorting:</b> You will need to process user interaction for sorting. The default grid
            component sorts when the user clicks the header with the mouse. You may also need to display
            icons as the sort state of the column changes.
        </li>
        <li><b>Filtering:</b> You do not filter via the column (you filter from inside the menu), however
            you may need to display icons as the filter state of the column changes.
        </li>
        <li><b>Menu:</b> If you want the user to be able to open the column menu, you will need to
            manage this user interaction. The default grid component provides a button for the user to click
            to show the menu.
        </li>
        <li><b>Anything Else:</b> Whatever you want, you are probably creating a custom
            header to add your own functionality in.
        </li>
    </ul>

    <h3 id="header-component-interface">Header Component Interface</h3>

    <p>
        Header components work similar to other component types in ag-Grid in which they should
        implement the following interface:
    </p>
    <snippet>
interface IHeaderComp {

    // optional method, gets called once with params
    init?(params: IHeaderCompParams): void;

    // can get called more than once, you should return the HTML element
    getGui(): HTMLElement;

    // optional method, gets called once, when component is destroyed
    destroy?(): void;

}
    </snippet>

    <p>The params passed to <code>init()</code> are as follows:</p>

    <snippet>
export interface IHeaderCompParams {

    // the column the header is for
    column: Column;

    // the name to display for the column. if the column is using a headerValueGetter,
    // the displayName will take this into account.
    displayName: string;

    // whether sorting is enabled for the column. only put sort logic into
    // your header if this is true.
    enableSorting: boolean;

    // whether menu is enabled for the column. only display a menu button
    // in your header if this is true.
    enableMenu: boolean;

    // callback to progress the sort for this column.
    // the grid will decide the next sort direction eg ascending, descending or 'no sort'.
    // pass multiSort=true if you want to do a multi sort (eg user has shift held down when
    // they click)
    progressSort(multiSort: boolean): void;

    // callback to set the sort for this column.
    // pass the sort direction to use ignoring the current sort eg one of 'asc', 'desc' or null
    // (for no sort). pass multiSort=true if you want to do a multi sort (eg user has shift held
    // down when they click)
    setSort(sort: string, multiSort?: boolean): void;

    // callback to request the grid to show the column menu.
    // pass in the html element of the column menu to have the
    // grid position the menu over the button.
    showColumnMenu(menuButton: HTMLElement): void;

    // The grid API
    api: any;
}</snippet>

    <h3 id="sorting">Sorting</h3>

    <p>
        How you interact with the user for sorting (eg do you listen for mouse clicks?) is up to you.
        The grid helps you by providing column state and events for getting and setting the sort.
    </p>

    <p>
        After the user requests a sort, you should call ONE of the following:
    </p>

    <ol class="content">
        <li><code>params.progressSort(multiSort):</code> This is the simplest. Call it to progress the sort on
            the column to the next stage. Using this uses the grid logic for working out what the
            next sort stage is (eg 'descending' normally follows 'ascending').
        </li>
        <li><code>params.setSort(direction, multiSort):</code> Use this to set to sort to a specific state. Use this
            if you don't want to use the grids logic for working out the next sort state.
        </li>
    </ol>

    <snippet>
// option 1) tell the grid when you want to progress the sorting
myHeaderElement.addEventListener('click', function(event) {
    // in this example, we do multi sort if shift key is pressed
    params.progressSort(event.shiftKey);
});

// or option 2) tell the grid when you want to set the sort explicitly
// button that always sorts ASCENDING
mySortAscButton.addEventListener('click', function(event) {
    params.setSort('asc', event.shiftKey);
});

// button that always sorts DESCENDING
mySortDescButton.addEventListener('click', function(event) {
    params.setSort('desc', event.shiftKey);
});</snippet>

    <p>
        To know when a column's sort state has change (eg when to update your icons), you should listen
        for <code>sortChanged</code> event on the column.
    </p>

    <snippet>
// listen to the column for sort events
column.addEventListener('sortChanged', function() {

    // get sort state from column
    var sort = column.getSort();
    console.log('sort state of column is ' + sort); // prints one of ['asc',desc',null]

    // then do what you need, eg set relevant icons visible
    var sortingAscending = sort==='asc';
    var sortingDescending = sort==='desc';
    var notSorting = !sortingAscending && !sortingDescending;
    // how you update your GUI accordingly is up to you
});

// don't forget to remove your listener in your destroy code</snippet>

    <h3 id="filtering">Filtering</h3>

    <p>
        The header doesn't normally initiate filtering. If it does, use the standard grid API to
        set the filter. The header will typically display icons when the filter is applied. To
        know when to show a filter icon, listen to the column for filterChanged events.
    </p>

    <snippet>
// listen to the column for filter events
column.addEventListener('filterChanged', function() {
    // when filter changes on the col, this will print one of [true,false]
    console.log('filter of column is ' + column.isFilterActive());
});

// don't forget to remove your listener in your destroy code</snippet>

    <h3 id="menu">Menu</h3>

    <p>
        How you get the user to ask for the column menu is up to you. When you want to display
        the menu, call the <code>params.showColumnMenu()</code> callback. The callback takes the HTML
        element for the button so that it can place the menu over the button (so the menu appears
        to drop down from the button).
    </p>

    <snippet>
myMenuButton.addEventListener('click', function() {
    params.showColumnMenu(myMenuButton);
});</snippet>

    <h3 id="complementing-params">Complementing Params</h3>

    <p>
        On top of the parameters provided by the grid, you can also provide your own parameters.
        This is useful if you want to 'configure' your header component. For example, you might
        have a header component for formatting currency but that needs the currency symbol.
    </p>

    <snippet>
colDef = {
    ...
    headerComponent: MyHeaderComponent;
    headerComponentParams : {
        currencySymbol: '£' // the pound symbol will be placed into params
    }
}</snippet>

    <h3 id="example-header-component">Example - Header Component</h3>

    <p>
        The example below shows a header component in action. The following can be observed
        in the demo:
    </p>

    <ul class="content">
        <li>Column moving and resizing is working without requiring any logic in the header component.</li>
        <li>Some columns have suppressMenu=true, so the header component doesn't show the menu.</li>
        <li>Some columns have suppressSorting=true, so the header component doesn't add sorting logic.</li>
        <li>The header component uses additional parameters to allowing configuring the menu icon.</li>
    </ul>

    <?= example('Header component', 'header-component', 'generated', array("processVue" => true, "extras" => array("fontawesome"), "showResult" => true, 'onlyShow' => 'vanilla')) ?>

    <?php include './angular.php'; ?>

    <?php include './react.php'; ?>

    <?php include './aurelia.php'; ?>

    <?php include './vuejs.php'; ?>

    <h2>Header Group Component</h2>

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

    <ul class="content">
        <li><b>Group Open / Close:</b> If the group can expand (one or more columns visibility
            depends on the open / closed state of the group) then your header group component
            should handle the interaction with the user for opening and closing groups.
        </li>
        <li><b>Anything Else:</b> Whatever you want, it's your component!</li>
    </ul>

    <h3 id="header-group-component-interface">Header Group Component Interface</h3>

    <p>
        The header group component interface is almost identical to the above header component.
        The only difference is the params object passed to the <code>init()</code> method.
    </p>

    <snippet>
export interface IHeaderGroupComp {

    // optional method, gets called once with params
    init?(params: IHeaderGroupCompParams): void;

    // can be called more than once, you should return the HTML element
    getGui(): HTMLElement;

    // optional method, gets called once, when component is destroyed
    destroy?(): void;

}</snippet>


    <p>The params passed to <code>init()</code> are as follows:</p>
    <snippet>
export interface IHeaderGroupParams {

    // the column group the header is for
    columnGroup: ColumnGroup;

    // the text label to render. if the column is using a headerValueGetter,
    // the displayName will take this into account.
    displayName: string;

    // opens / closes the column group
    setExpanded(expanded: boolean): void;
}</snippet>

    <h3 id="opening-closing-groups">Opening / Closing Groups</h3>

    <p>
        Not all column groups can open and close, so you should display open / close
        features accordingly. To check if a column group should have
        open / close functionality, check the <code>isExpandable()</code> method on the column
        group.
    </p>

    <snippet>
var showExpandableIcons = params.columnGroup.isExpandable()
    </snippet>

    <p>
        To check if a column group is open or closed, check the <code>isExpanded()</code> method
        on the column group.
    </p>

    <snippet>
var groupIsOpen = params.columnGroup.isExpanded();
    </snippet>

     <p>
        To open / close a column group, use the <code>params.setExpanded(boolean)</code> method.
    </p>

    <snippet>
// this code toggles the expanded state
var oldValue = params.columnGroup.isExpanded();
var newValue = !oldValue;
params.setExpanded(newValue);
    </snippet>

    <p>
        To know if a group is expanded or collapsed, listen for the <code>expandedChanged</code>
        event on the column group.
    </p>

    <snippet>
// get a reference to the original column group
var columnGroup = params.columnGroup.getOriginalColumnGroup();
// create listener
var listener = function() { console.log('group was opened or closed'); };
// add listener
columnGroup.addEventListener('expandedChanged', listener);

// don't forget to remove the listener in your destroy method
columnGroup.removeEventListener('expandedChanged', listener);</snippet>

    <h3 id="example-header-group-cells">Example - Header Group Cells</h3>

    <?= example('Header Group', 'header-group-component', 'generated', array("processVue" => true, "extras" => array("fontawesome"), "showResult" => true)) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
