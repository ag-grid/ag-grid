<?php
$pageTitle = "ag-Grid Reference: Overview Section";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. This page is an overview of the Reference documentation. This section explains how to configure the the grid's properties, events, callbacks and API.";
$pageKeywords = "html5 data grid ag-Grid reference events functions api";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<h1>Grid Interface</h1>

<p class="lead">
    This section details the public interface that your application can use to interact with the grid, including
    methods, properties and events.
</p>

<p>
    The grid interface is the combination of the following items:
</p>

<ul>
    <li>
        <a href="../javascript-grid-properties/">Grid Properties</a>: properties used to configure the grid,
         e.g. <code>pagination = true</code>.
    </li>
    <li>
        <a href="../javascript-grid-api/">Grid API</a>: methods used to interact with the grid after it's created,
        e.g. <code>api.getSelectedRows()</code>.
    </li>
    <li>
        <a href="../javascript-grid-events/">Events</a>: events published by the grid to inform applications of changes
        in state, e.g. <code>rowSelected</code>.
    </li>
    <li>
        <a href="../javascript-grid-callbacks/">Grid Callbacks</a>: callbacks are used by the grid to retrieve required
        information from your application, e.g. <code>getRowHeight()</code>.
    </li>
    <li>
        <a href="../javascript-grid-row-node/">Row Node</a>:
        each row in the grid is represented by a Row Node object, which in turn has a reference to the piece of
        row data provided by the application. The Row Node wraps the row data item. The Row Node has attributes,
        methods and events for interacting with the specific row e.g. <code>rowNode.setSelected(true)</code>.
    </li>
</ul>

<h2>Grid Options</h2>

<p>
    The <code>gridOptions</code> object is a 'one stop shop' for the entire interface into the grid. The
    grid options can be used regardless of the framework you are using, but if you are using a framework
    you might find it easier to use your framework's bindings. How to configure for a particular framework
    is explained further down this page.
</p>

<p>
    The example below shows the different types of items available on <code>gridOptions</code>.
</p>

<snippet>
var gridOptions = {
    // PROPERTIES
    // Objects like myRowData and myColDefs would be created in your application
    rowData: myRowData,
    columnDefs: myColDefs,
    pagination: true,
    rowSelection: 'single',

    // EVENTS
    // Add event handlers
    onRowClicked: function(event) { console.log('A row was clicked'); },
    onColumnResized: function(event) { console.log('A column was resized'); },
    onGridReady: function(event) { console.log('The grid is now ready'); },

    // CALLBACKS
    isScrollLag: function() { return false; }
}
</snippet>

<p>
    Once the grid is initialised, you will also have access to the grid API (<code>api</code>) and column API
    (<code>columnApi</code>) on the <code>gridOptions</code> object as shown:
</p>

<snippet>
// refresh the grid
gridOptions.api.refreshView();

// resize columns in the grid to fit the available space
gridOptions.columnApi.sizeColumnsToFit();
</snippet>

<h2>Listening to Events</h2>

<p>
    In addition to adding event listeners directly via the <code>gridOptions</code> object, it is possible to register
    for events, similar to registering for events on native DOM elements. This means there are two ways to listen for
    events: either to use the <code>onXXX()</code> method on the API (where XXX is replaced with the event name), or to
    register for the event. The latter option allows you to add multiple handlers for the same event. The following
    example demonstrates the two options:
</p>

<snippet>
// create handler function
function myRowClickedHandler(event) {
    console.log('The row was clicked');
}

// option 1: use the API
gridOptions.onRowClicked = myRowClickedHandler;

// option 2: register the handler
gridOptions.api.addEventListener('rowClicked', myRowClickedHandler);
</snippet>

<h3>Events Are Asynchronous</h3>

<p>
    Grid events are asynchronous so that the state of the grid will be settled by the time your event
    callback gets invoked.
</p>

<h2>Default Boolean Properties</h2>

<p>
    Where the property is a boolean (<code>true</code> or <code>false</code>), then <code>false</code> (or left blank)
    is the default value. For this reason, on / off items are presented in a way that causes the most common behaviour
    to be used when the value is <code>false</code>. For example, <code>suppressCellSelection</code> is named as such
    because most people will want cell selection to be enabled.
</p>

<h2>Vanilla JavaScript</h2>

<p>If you are using plain Javascript, all of your interaction with ag-Grid will be through <code>gridOptions</code>.</p>

<h2>React</h2>

<p>
    The <code>gridOptions</code> are fully available as stated above for React. However you can take advantage of
    React's properties and events provided by ag-Grid's React Component. This is done as follows:
</p>

<ul class="content">
    <li><b>Properties</b>: properties are defined by passing React props down to ag-Grid.</li>
    <li><b>Callbacks</b>: callbacks are also defined using React Props.</li>
    <li><b>Event Handlers</b>: event handlers are also defined using React Props.</li>
    <li><b>API</b>: The grid API and column API are provided to you via the <code>onGridReady()</code> event callback.</li>
</ul>

<p>
    So in summary, in React, everything is done via React Props. Here is an example:
</p>

<snippet language="jsx">
&lt;AgGridReact
    ref="agGrid" // useful for accessing the component directly via ref
    rowSelection="multiple" // simple attributes, not bound to any state or prop

    // these are bound props, so can use anything in React state or props
    columnDefs={this.props.columnDefs}
    showToolPanel={this.state.showToolPanel}

    // this is a callback
    isScrollLag={this.myIsScrollLagFunction.bind(this)}

    // these are registering event callbacks
    onCellClicked={this.onCellClicked.bind(this)}
    onColumnResized={this.onColumnEvent.bind(this)}

    // inside onGridReady, you receive the grid APIs if you want them
    onGridReady={this.onGridReady.bind(this)}
/&gt;
</snippet>

<p>
    The APIs are also accessible through the component itself. For example, above the <code>ref</code> is given as
    <code>'myGrid'</code> which then allows the API to be accessed like this:
</p>

<snippet language="jsx">
    &lt;button onClick={() =&gt; this.refs.agGrid.api.deselectAll()}&gt;Clear Selection&lt;/button&gt;
</snippet>

<h2>Angular</h2>

<p>
    The <code>gridOptions</code> are fully available as stated above for Angular. However you can take advantage of
    Angular's properties and events provided by ag-Grid's Angular Component. This is done as follows:
</p>

<ul class="content">
    <li><b>Attributes</b>: attributes are defined as normal HTML attributes and set non-bound values.</li>
    <li><b>Properties</b>: properties are defined as HTML attributes enclosed in square
        brackets and are Angular bound values.
    </li>
    <li><b>Callbacks</b>: callbacks are actually a type of property, but by convention they are
        always functions and are not for relaying event information. They are bound as properties
        using square brackets. As callbacks are not events, they do not impact the Angular
        event cycle, and as such should not change the state of anything.
    </li>
    <li><b>Event Handlers</b>: event handlers are defined as HTML attributes enclosed in
        normal brackets and are Angular bound functions.
    </li>
    <li><b>API</b>: the grid API and column API are accessible through the component.</li>
</ul>

<p>
    All of the above (attributes, properties, callbacks and event handlers) are registered using their 'dash' syntax
    and not camel-case. For example, the property <code>rowAnimation</code> is bound using <code>row-animation</code>.
    The following example shows some bindings:
</p>

<snippet>
&lt;ag-grid-angular
    #myGrid // assign an angular ID to the grid

    // these are boolean values, which if included without a value, default to true
    // (if they are not specified, the default is false)
    row-animation
    pagination

    // these are attributes, not bound, give explicit values here
    row-selection="multiple"

    // these are bound properties, bound to the AngularJS 1.x current context (that's what a
    // scope is called in Angular 2)
    [column-defs]="columnDefs"
    [show-tool-panel]="showToolPanel"

    // this is a callback
    [is-scroll-lag]="myIsScrollLagFunction"

    // these are registering event callbacks
    (cell-clicked)="onCellClicked($event)"
    (column-resized)="onColumnEvent($event)"&gt;
&lt;/ag-grid-angular&gt;
</snippet>

<p>
    The APIs are also accessible through the component. For example, above the ID is given as <code>'#myGrid'</code>
    which then allows the API to be accessed like this:
</p>

<snippet>
    &lt;button (click)="myGrid.api.deselectAll()"&gt;Clear Selection&lt;/button&gt;
</snippet>

<h2>Polymer</h2>

<p>
    The <code>gridOptions</code> are fully available, but you can also advantage of Polymer's properties and events
    provided by ag-Grid's Polymer Component. This is done as follows:
</p>

<h3>Properties</h3>

<p>Properties on <code>ag-grid-polymer</code> can be provided in the following three ways:</p>

<ul class="content">
    <li>LowerCase: <code>rowanimation</code></li>
    <li>CamelCase: <code>rowAnimation</code></li>
    <li>Hyphenated Lowercase: <code>row-animation</code></li>
</ul>

<p>You can specify the properties in the following ways:</p>

<ul class="content">
    <li>On the <code>ag-grid-polymer</code>component at declaration time</li>
    <li>On the <code>gridOptions</code> property</li>
</ul>

<h4>Properties on <code>ag-grid-polymer</code></h4>

<snippet language="html">
&lt;ag-grid-polymer rowData="{{rowData}}" rowAnimation pivot-mode&gt;&lt;/ag-grid-polymer&gt;
</snippet>

<p>
    Here we've specified three properties: <code>rowData</code> is provided with two-way binding, and
    <code>rowAnimation</code> and <code>pivot-mode</code> illustrate how you can specify properties using different
    cases.
</p>

<h3>Events</h3>

<p>
    All data out of the grid comes through events. You can specify the events you want to listen to in the
    following ways:
</p>

<ul class="content">
    <li>On the <code>ag-grid-polymer</code>component at declaration time</li>
    <li>On the <code>gridOptions</code> property</li>
    <li>On the <code>ag-grid-polymer</code>component post creation time, via event listeners</li>
    <li>On the <code>ag-grid-polymer</code>component post creation time, via direct property access</li>
</ul>

<h4>Events on <code>ag-grid-polymer</code></h4>

<snippet language="html">
    &lt;ag-grid-polymer onGridReady="{{onGridReady}}"&gt;&lt;/ag-grid-polymer&gt;
</snippet>

<p>
    Here we're listening to the <code>gridReady</code> event - as with most events we need to add the "on" prefix.
</p>

<note>
    When defining event listeners in this way it's important to note that the <code>this</code> context will be
    <code>ag-grid-polymer</code>, <span>not</span> the containing application element. You will have access to the
    grid's properties directly, but not the application element itself. The <code>api</code> and <code>columnApi</code>
    are available directly via <code>this.api</code> and <code>this.columnApi</code>.
</note>

<h4>Events via the <code>gridOptions</code> property</h4>

<snippet language="html">
&lt;ag-grid-polymer gridOptions="{{gridOptions}}" &gt;&lt;/ag-grid-polymer&gt;
</snippet>
<snippet>
this.gridOptions.onColumnResized = event =&gt; {
    console.log('Event via option 1: ' + event);
};
</snippet>

<h4>Events via Event Listeners on an instance of <code>ag-grid-polymer</code></h4>

<snippet language="html">
&lt;ag-grid-polymer id="myGrid"&gt;&lt;/ag-grid-polymer&gt;
</snippet>
<snippet>
this.$.myGrid.addEventListener('columnresized', event =&gt; {
    console.log('Event via option 2: ' + event.agGridDetails);
});
</snippet>

<p>
    In this case we need to specify an ID on the <code>ag-grid-polymer</code> component in order to access it.
</p>

<p>
    The grid's payload will be available on the event's <code>agGridDetails</code> property.
</p>

<h4>Events via direct property access on an instance of <code>ag-grid-polymer</code></h4>

<snippet language="html">
&lt;ag-grid-polymer id="myGrid"&gt;&lt;/ag-grid-polymer&gt;
</snippet>
<snippet>
this.$.myGrid.oncolumnresized = event =&gt; {
    console.log('Event via option 3: ' + event.agGridDetails);
};
</snippet>

<p>
    In this case we need to specify an ID on the <code>ag-grid-polymer</code> component in order to access it.
</p>

<p>
    The grid's payload will be available on the event's <code>agGridDetails</code> property.
</p>

<h3>Grid API</h3>

<p>
    The Grid API (both <code>api</code> and <code>columnApi</code>) will only be available after the
    <code>gridReady</code> event has been fired.
</p>

<p>
    You can access the APIs in the following ways:
</p>

<ul class="content">
    <li>
        Store them from the <code>gridReady</code> event - they'll be available via the <code>params</code> argument
        passed into the event
    </li>
    <li>
        Provide a <code>gridOptions</code> object to the grid pre-creation time. Post-creation the APIs will be
        available on the <code>gridOptions</code> object.
    </li>
</ul>

<h3>Cell Editors, Cell Renderers, Filters etc.</h3>

<p>
    Please see the relevant sections on
    <a href="../javascript-grid-cell-rendering-components/#polymerCellRendering">cell renderers</a>,
    <a href="../javascript-grid-cell-editing/#polymerCellEditing">cell editors</a> and
    <a href="../javascript-grid-filtering/#polymerFiltering">filters</a> for configuring and using Polymer
    Components in ag-Grid.
</p>

<h2>VueJS</h2>

<p>
    The <code>gridOptions</code> are fully available as stated above for VueJS. However, you can take advantage of
    VueJS's properties and events provided by ag-Grid's VueJS Component. This is done as follows:
</p>

<ul class="content">
    <li><b>Attributes</b>: attributes are defined as normal HTML attributes and set non-bound values.</li>
    <li><b>Properties</b>: properties are defined as HTML attributes prefixed with a colon (<code>:</code>)
        and are VueJS bound values.
    </li>
    <li>
        <b>Callbacks</b>: callbacks are actually a type of property, but by convention they are always functions and
        are not for relaying event information. They are bound as properties prefixed with a colon (<code>:</code>). As
        callbacks are not events, they do not impact the VueJS event cycle, and as such should not change the state of
        anything.
    </li>
    <li>
        <b>Event Handlers</b>: event handlers are defined as HTML attributes prefixed with a colon (<code>:</code>)
        and are VueJS bound functions.
    </li>
    <li><b>API</b>: The grid API and column API are accessible through the component.</li>
</ul>

<p>
    All of the above (attributes, properties, callbacks and event handlers) are registered using their 'dash' syntax
    and not camel-case. For example, the property <code>pivotMode</code> is bound using <code>pivot-mode</code>. The
    following example shows some bindings:
</p>

<snippet language="html">
&lt;ag-grid-vue
    // these are attributes, not bound, give explicit values here
    rowSelection="multiple"

    // these are boolean values
    // (leaving them out will default them to false)
    :rowAnimation="true"
    :pivot-mode="true"

    // these are bound properties
    :gridOptions="gridOptions"
    :columnDefs="columnDefs"

    // this is a callback
    :isScrollLag="myIsScrollLagFunction"

    // these are registering event callbacks
    :modelUpdated="onModelUpdated"
    :cellClicked="onCellClicked"&gt;
&lt;/ag-grid-vue&gt;
</snippet>

<p>
    The APIs are accessible through the component. For example, above the ID is given as '#myGrid' which then allows
    the API to be accessed like this:
</p>

<snippet>
&lt;button @click="myGrid.api.deselectAll()"&gt;Clear Selection&lt;/button&gt;
</snippet>

<h2>Web Components</h2>

<p>
    The <code>gridOptions</code> are fully available as stated above for Web Components. However you can take advantage
    of Web Components attributes for setting properties and also directly accessing the Web Components DOM object for
    interacting with the component. This is done as follows:
</p>

<ul class="content">
    <li><b>Attributes</b>: attributes are defined as normal HTML attributes and set non-bound values.</li>
    <li><b>Properties</b>: properties are set directly onto the DOM object using JavaScript.</li>
    <li><b>Callbacks</b>: callbacks, like properties, are also set directly on the DOM object using JavaScript.</li>
    <li>
        <b>Event Handlers</b>: event handlers are registered as normal DOM event handlers, using
        either <code>addEventListener(eventName, handler)</code> or assigning an <code>onXXX</code> method on the DOM
        object.
    </li>
    <li><b>API</b>: The grid API and column API are accessible through the DOM object.</li>
</ul>

<p>
    Bindings are registered using their 'dash' syntax and not camel-case. For example, the property
    <code>rowAnimation</code> is bound using <code>row-animation</code>.
</p>

<p>
    Properties and callbacks are set using standard camel-case; no changes are made.
</p>

<p>
    <b>Web Components Events are all done using lowercase</b>. This keeps the event handling consistent with native
    DOM elements, but breaks away from the camel-case of how events are managed by the other frameworks ag-Grid
    supports.
</p>

<p>
    This example shows setting up as a Web Component in HTML. Notice it's similar to Angular, but without binding of
    properties or event handling.
</p>

<snippet>
&lt;ag-grid
    // normal ID for CSS selector inside JavaScript
    id="myGrid"

    // these are boolean values, which if included without a value, default to true
    row-animation

    // these are attributes, not bound, give explicit values here
    row-height="22"
    row-selection="multiple"&gt;
&lt;/ag-grid&gt;
</snippet>

<p>
    Then the callbacks and event handling are done in JavaScript as follows:
</p>

<snippet>
var myGrid = document.querySelector('#myGrid');

// calling a method directly on the ag-Grid DOM element.
// calling setGridOptions starts up the grid and is mandatory (even if gridOptions is empty)
myGrid.setGridOptions(gridOptions);

// add events to grid, option 1 - add an event listener
myGrid.addEventListener('columnresized', function(event) {
    console.log('Got an event via option 1');
});

// add events to grid, option 2 - callback on the element
myGrid.oncolumnresized = function(event) {
    console.log('Got an event via option 2');
};

// add events to grid, option 3 - callback on the grid options
// remember we can still use everything in gridOptions, the
// Web Components features are all in addition
gridOptions.onColumnResized = function(event) {
    console.log('Got an event via option 3');
};

// call something on the API
myGrid.api.refreshView();
myGrid.columnApi.sizeColumnsToFit();

// change a property
myGrid.quickFilterText = 'sandy';
myGrid.showToolPanel = true;
</snippet>

<h2>Next Steps</h2>

<p>
    That's it, Doc! Now you know how to interface with the grid. Go now and find out about all the great
    <a href="../javascript-grid-properties/">properties</a>,
    <a href="../javascript-grid-api/">methods</a>,
    <a href="../javascript-grid-callbacks/">callbacks</a> and
    <a href="../javascript-grid-events/">events</a> you can use.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
