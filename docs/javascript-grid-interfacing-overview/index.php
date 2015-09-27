<?php
$key = "Interfacing Overview";
$pageTitle = "Interfacing Overview";
$pageDescription = "Learn how to interface with ag-Grid using events, functions and the API.";
$pageKeyboards = "html5 data grid ag-Grid interfacing events functions api";
include '../documentation_header.php';
?>

<div>

    <h2>Interfacing Overview</h2>

    <p>
        The interface to ag-Grid is modelled around Web Components. This gives ag-Grid a consistent
        feel to already existing DOM elements (nice for everyone). It also has the added benefit
        of fitting nicely into AngularJS 2.
    </p>
    <p>
        Each interaction with the grid can be broken down into the following categories:
    </p>
    <ul>
        <li><b>Properties</b>: Properties are for changing the state inside the grid. These are
        analogous to properties on a DOM object.</li>
        <li><b>Events</b>: Events are for handling changes from the grid. These are analogous
        to events in the DOM.</li>
        <li><b>Callbacks</b>: Functions that you provide that the grid calls, as a way of
        modifying behaviour of the grid. This is the grid asking the application a question
        such as 'what color should this cell be', it is not a means to pass state into or
        out of the grid.</li>
        <li><b>API</b>: API into the grid, to provide features that are not representable
        via properties and events.</li>
    </ul>

    <p>
        Even if you do not use AngularJS 2 or Web Components, the model above is
        good for understanding the interface, as it helps towards it been self documenting
        and predictable.
    </p>

    <h2>
        <img src="/images/javascript.png" height="50"/>
        <img src="/images/angularjs.png" height="50px"/>
        <img src="/images/angular2.png" height="50px"/>
        <img src="/images/webComponents.png" height="50px"/>
        Grid Options
    </h2>

    <p>
        The gridOptions is a 'one stop shop' for the entire interface into the grid. The
        grid options can be used regardless of the framework you are using, however if you
        are using AngularJS 2 or Web Components, you can achieve what grid options
        provides you with in other ways.
    </p>

    <p>
        The example below shows the different type of items on the gridOptions.
    </p>
    <pre><code>var gridOptions = {
    // PROPERTIES - object properties, myRowData and myColDefs are created somewhere in your application
    rowData: myRowData,
    colDef: myColDefs,

    // PROPERTIES - simple boolean / string / number properties
    enableColResize: true,
    groupHeaders: false,
    rowHeight: 22,
    rowSelection: 'single',

    // EVENTS - add event callback handlers
    onRowClicked: function(event) { console.log('a row was clicked'); },
    onColumnResized: function(event) { console.log('a column was resized'); },
    onReady: function(event) { console.log('the grid is now ready'); },

    // CALLBACKS
    isScrollLag: function() { return false; }
}</code></pre>
    <p>
        Once the grid is initialised, then the gridOptions will also have available
        the grid's api and columnApi as follows:
    </p>
    <pre><code>// get the grid to refresh
gridOptions.api.refreshView();

// get the grid to space out it's columns
gridOptions.columnApi.sizeColumnsToFit();
</code></pre>

    <h3>Two Ways of Event Binding</h3>

    <p>
        In addition to adding event listeners directly onto the gridOptions, it is possible
        to register for events, similar to registering for events on native DOM elements.
        This means there are two ways to listen for events, which again aligns with how DOM elements work.
        The first is to put an <i>onXXX()</i> method (where XXX = the event name) like in
        the example above, the second is to register for the event like in the following example:
    </p>

    <pre><code>// create handler function
function myRowClickedHandler(event) {
    console.log('the row was clicked');
}

// add the handler function
gridOptions.api.addEventListener('rowClicked', myRowClickedHandler);
</code></pre>

    <h3>Default Boolean Properties</h3>

    <p>
        Where the property is a boolean (true or false), then false (or leave blank) is the default value.
        For this reason, on / off items are presented in such was as the most common usage (which will
        be the default) is false, eg suppressCellSelection is worded as such as most people will want cell
        selection to be turned on.
    </p>

    <h2>
        <img src="/images/javascript.png" height="50"/><img src="/images/angularjs.png" height="50px"/>
        Native Javascript and AngularJS 1.x
    </h2>

    <p>
        If you are using plain Javascript or AngularJS 1.x, then all of your interaction
        with ag-Grid will be through the gridOptions.
    </p>

    <h2>
        <img src="/images/angular2.png" height="50px"/>
        AngularJS 2
    </h2>

    <p>
        The gridOptions are fully available as stated above for AngularJS 2. However you can take
        advantage of AngularJS 2's properties and events provided by ag-Grids AngularJS 2's Component.
        This is done as follows:
    </p>

    <ul>
        <li><b>Attributes</b>: Attributes are defined as normal HTML attributes and set non-bound values.</li>
        <li><b>Properties</b>: Properties are defined as HTML attributes enclosed in square
            brackets and are AngularJS 2 bound values.</li>
        <li><b>Callbacks</b>: Callbacks are actually a type of property, but by convention they are
            always functions and are not for relaying event information. They are bound as properties
            using square brackets. As callbacks are not events, they do not impact the AngularJS 2
            event cycle, and as such should not change the state of anything.</li>
        <li><b>Event Handlers</b>: Event handlers are defined as HTML attributes enclosed in
            normal brackets and are AngularJS 2 bound functions.</li>
        <li><b>API</b>: The grid API and column API are accessible through the component.</li>
    </ul>

    <p>
        All of the above (attributes, properties, callbacks and event handlers) are registered
        using their 'dash' syntax and not camelcase. For example, the property enableSorting
        is bound using enable-sorting. <i>enable-sorting</i>. The following example shows
        some bindings:
    </p>

    <pre><code>&lt;ag-grid-ng2
    // give an AngularJS ID to the grid
    #myGrid

    // these are boolean values, which if included without a value, default to true
    // (which is different to leaving them out, in which case the default is false)
    enable-sorting
    enable-filter

    // these are attributes, not bound, give explicit values here
    row-height="22"
    row-selection="multiple"

    // these are bound properties, bound to the AngularJS current context (that's what a
    // scope is called in Angular JS 2)
    [column-defs]="columnDefs"
    [show-tool-panel]="showToolPanel"

    // this is a callback
    [is-scroll-lag]="myIsScrollLagFunction"

    // these are registering event callbacks
    (cell-clicked)="onCellClicked($event)"
    (column-resized)="onColumnEvent($event)">
&lt;/ag-grid-ng2></code></pre>

    <p>
        The API's are accessible through the component. This is useful in two situations.
        The first us by using an AngularJS 2 ID. In the example above, the ID is given
        as '#myGrid' which then allows something like this:
    </p>

    <pre><code>&lt;button (click)="<b>agGrid</b>.api.deselectAll()">Clear Selection&lt;/button></code></pre>

    <h2>
        <img src="/images/webComponents.png" height="50px"/>
        Web Components
    </h2>

    <p>
        The gridOptions are fully available as stated above for Web Components. However you can take
        advantage of Web Components attributes for setting properties and also directly accessing
        the Web Components DOM object for interacting with the component. This is done as follows:
    </p>

    <ul>
        <li><b>Attributes</b>: Attributes are defined as normal HTML attributes and set non-bound values.</li>
        <li><b>Properties</b>: Properties are set directly onto the DOM object using javascript.</li>
        <li><b>Callbacks</b>: Callbacks, like properties, are also set directly on the DOM object using javascript.</li>
        <li><b>Event Handlers</b>: Event handlers are registered as normal DOM event handlers, using
            either addEventListener(eventName, handler) or assigning an onXXX method on the DOM object.</li>
        <li><b>API</b>: The grid API and column API are accessible through the DOM object.</li>
    </ul>

    <p>
        Bindings are registered using their 'dash' syntax and not camelcase. For example,
        the property enableSorting is bound using <i>enable-sorting</i>.
    </p>

    <p>
        Properties and callbacks are set using standard camelcase, no changes are done.
    </p>

    <p>
        <b>Web Components Events are all done using lowercase</b>. This keeps the event
        handling consistent with native DOM elements, however breaks away from the camel case
        of how events are managed by the other frameworks ag-Grid supports.
    </p>

    <p>
        This example shows setting up as a Web Component in HTML. Notice it's simliar
        to AngularJS 2, however no binding of properties or event handling.
    </p>

    <pre><code>&lt;ag-grid-ng2
    // normal id for CSS selector inside Javascript
    id="myGrid"

    // these are boolean values, which if included without a value, default to Yes
    enable-sorting
    enable-filter

    // these are attributes, not bound, give explicit values here
    row-height="22"
    row-selection="multiple"
&lt;/ag-grid-ng2></code></pre>

    <p>
        Then the callbacks and event handling are done in the Javascript as follows:
    </p>

<pre><code>
var myGrid = document.querySelector('#myGrid');
// calling a method directly on the ag-Grid DOM element.
// calling setGridOptions starts up the grid and is mandatory (even if gridOptions is empty)
myGrid.setGridOptions(gridOptions);

// add events to grid option 1 - add an event listener
myGrid.addEventListener('columnresized', function(event) {
    console.log('got an event via option 1');
});

// add events to grid option 2 - callback on the element
myGrid.oncolumnresized = function(event) {
    console.log('got an event via option 2');
};

// add events to grid option 3 - callback on the grid options
// remember we can still use everything in gridOptions, the
// Web Components features are all in addition
gridOptions.onColumnResized = function(event) {
    console.log('got an event via option 3');
};

// call something on the API
myGrid.api.refreshView();
myGrid.columnApi.sizeColumnsToFit();

// change a property
myGrid.quickFilterText = 'sandy';
myGrid.showToolPanel = true;
</code></pre>

    <h2>Next Steps...</h2>

    <p>
        And that's it Doc, now you know how to interface with the grid. Go now and find out about all
        the great attributes, properties, callbacks and events you can use. Interact
        well. Be safe. Don't do drugs.
    </p>

</div>

<?php include '../documentation_footer.php';?>
