<?php
$key = "Reference Overview";
$pageTitle = "Reference Overview";
$pageDescription = "Learn how to interface with ag-Grid using events, functions and the API.";
$pageKeyboards = "html5 data grid ag-Grid reference events functions api";
$pageGroup = "reference";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1">
        <img src="../images/svg/docs/interfacing.svg" width="50"/>
        Reference
    </h1>

    <p>
        This section explains how to configure the the grid's properties, events, callbacks and API.
    </p>


    <div class="list-group">
        <a href="../javascript-grid-properties/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/interfacing.svg" width="50"/>
                </div>
                <h3 class="list-group-item-heading">Grid Properties</h3>
                <p class="list-group-item-text">
                    Most features of the grid are set using grid properties. Eg turn on sorting by setting
                    <code>enableSorting=true</code>, or turn on filtering with <code>enableFilter=true</code>.
                </p>
            </div>
        </a>

        <a href="../javascript-grid-api/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/interfacing.svg" width="50"/>
                </div>
                <h3 class="list-group-item-heading">Grid API</h3>
                <p class="list-group-item-text">
                    Interacting with the grid at run time is done through the grid API. Eg to get all the
                    selected rows, call <code>api.getSelectedRows()</code>.
                </p>
            </div>
        </a>

        <a href="../javascript-grid-events/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/interfacing.svg" width="50"/>
                </div>
                <h3 class="list-group-item-heading">Grid Events</h3>
                <p class="list-group-item-text">
                    Your application can listen for certain events within the grid to act on them.
                    Eg <code>sortChanged</code> gets fired when the grid is sorted, <code>rowSelected</code>
                    gets fired when a row is selected.
                </p>
            </div>
        </a>

        <a href="../javascript-grid-callbacks/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/interfacing.svg" width="50"/>
                </div>
                <h3 class="list-group-item-heading">Grid Callbacks</h3>
                <p class="list-group-item-text">
                    If the grid requires information from your application it is done through a grid callback.
                    Eg <code>getMainMenuItems()</code> is called each time a menu is shown and allows your application
                    to customise the menu.
                </p>
            </div>
        </a>

        <a href="../javascript-grid-column-properties/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/interfacing.svg" width="50"/>
                </div>
                <h3 class="list-group-item-heading">Column Properties</h3>
                <p class="list-group-item-text">
                    Columns are configured through column definitions. A column definition contains the column
                    properties. Eg <code>colDef.pinned='left'</code> will set a column to be pinned to the left.
                </p>
            </div>
        </a>

        <a href="../javascript-grid-column-api/" class="list-group-item">
            <div class="float-parent">
                <div class="section-icon-container">
                    <img src="../images/svg/docs/interfacing.svg" width="50"/>
                </div>
                <h3 class="list-group-item-heading">Column API</h3>
                <p class="list-group-item-text">
                    The column API is similar to the grid API, the difference is that the column API groups
                    a set of API methods relevant to columns. Eg the method <code>columnApi.setColumnVisible('country',false)</code>
                    will cause the 'country' column to be hidden.
                </p>
            </div>
        </a>

    </div>

    <h2>
        <img src="/images/svg/javascript.svg" height="50"/>
        <img src="/images/react.png" height="50"/>
        <img src="/images/angularjs.png" height="50"/>
        <img src="/images/polymer-large.png" height="50"/>
        <img src="/images/angular2.png" height="50"/>
        <img src="/images/vue_large.png" height="50"/>
        <img src="../images/webComponents.png" height="50"/>
        <img src="/images/aurelia.png" height="50"/>
        Grid Options
    </h2>

    <p>
        The gridOptions is a 'one stop shop' for the entire interface into the grid. The
        grid options can be used regardless of the framework you are using, however if you
        are using a framework, you can additionally achieve what grid options provides with
        your frameworks bindings. How to configure for the particular framework is explained
        further down this page.
    </p>

    <p>
        The example below shows the different type of items on the gridOptions.
    </p>
<snippet>
var gridOptions = {

    // PROPERTIES - object properties, myRowData and myColDefs are created somewhere in your application
    rowData: myRowData,
    columnDefs: myColDefs,

    // PROPERTIES - simple boolean / string / number properties
    enableColResize: true,
    rowHeight: 22,
    rowSelection: 'single',

    // EVENTS - add event callback handlers
    onRowClicked: function(event) { console.log('a row was clicked'); },
    onColumnResized: function(event) { console.log('a column was resized'); },
    onGridReady: function(event) { console.log('the grid is now ready'); },

    // CALLBACKS
    isScrollLag: function() { return false; }
}
</snippet>
    <p>
        Once the grid is initialised, then the gridOptions will also have available
        the grid's api and columnApi as follows:
    </p>
<snippet>
// get the grid to refresh
gridOptions.api.refreshView();

// get the grid to space out its columns
gridOptions.columnApi.sizeColumnsToFit();
</snippet>

    <h3>Two Ways of Event Listening</h3>

    <p>
        In addition to adding event listeners directly onto the gridOptions, it is possible
        to register for events, similar to registering for events on native DOM elements.
        This means there are two ways to listen for events, which again aligns with how DOM elements work.
        The first is to put an <i>onXXX()</i> method (where XXX = the event name) like in
        the example above, the second is to register for the event like in the following example:
    </p>

<snippet>
// create handler function
function myRowClickedHandler(event) {
    console.log('the row was clicked');
}

// add the handler function
gridOptions.api.addEventListener('rowClicked', myRowClickedHandler);
</snippet>

    <h3>Events are Asynchronous</h3>

    <p>
        Grid events are asynchronous so that the state of the grid will be settled by the time your event
        callback gets invoked.
    </p>

    <h3>Default Boolean Properties</h3>

    <p>
        Where the property is a boolean (true or false), then false (or leave blank) is the default value.
        For this reason, on / off items are presented in such was as the most common usage (which will
        be the default) is false, eg suppressCellSelection is worded as such as most people will want cell
        selection to be turned on.
    </p>

    <div>
        <h2>
            <img src="/images/svg/javascript.svg" height="50"/>
            Native Javascript
        </h2>

        <p>
            If you are using plain Javascript then all of
            your interaction with ag-Grid will be through the gridOptions.
        </p>
    </div>

    <div>
        <h2>
            <img src="/images/react.png" height="50px"/>
            React
        </h2>

        <p>
            The gridOptions are fully available as stated above for React. However you can take
            advantage of React's properties and events provided by ag-Grids React Component.
            This is done as follows:
        </p>

        <ul>
            <li><b>Properties</b>: Properties are defined by passing React props down to ag-Grid.</li>
            <li><b>Callbacks</b>: Callbacks are also placed as React Props.</li>
            <li><b>Event Handlers</b>: Event handlers are again placed as React Props.</li>
            <li><b>API</b>: The grid API and column API are provided to you via the onGridReady() event callback.</li>
        </ul>

        <p>
            So in summary, in React, everything is done via React Props. Here is an example:
        </p>

<snippet>
&lt;ag-grid-react-component

    // useful for accessing the component directly via ref
    ref="agGrid"

    // these are simple attributes, not bound to any state or prop
    rowHeight="22"
    rowSelection="multiple"

    // these are bound props, so can use anything in React state or props
    columnDefs={this.props.columnDefs}
    showToolPanel={this.state.showToolPanel}

    // this is a callback
    isScrollLag={this.myIsScrollLagFunction.bind(this)}

    // these are registering event callbacks
    onCellClicked={this.onCellClicked.bind(this)}"
    onColumnResized={this.onColumnEvent.bind(this)}"
    onGridReady={this.onGridReady.bind(this)}" // inside onGridReady, you receive the grid API's if you want
    them
/&gt;
</snippet>

        <p>
            The API's are accessible through the component itself. This is useful in two situations.
            The first is by using an <code>ref</code>. In the example above, the <code>ref</code> is given
            as 'myGrid' which then allows something like this:
        </p>

        <snippet>
            &lt;button onClick={() =&gt; {this.refs.&lt;b&gt;agGrid&lt;/b&gt;.api.deselectAll()}}&gt;Clear Selection&lt;/button&gt;
        </snippet>
    </div>

    <div>
        <h2>
            <img src="/images/angular2.png" height="50px"/>
            Angular
        </h2>

        <p>
            The gridOptions are fully available as stated above for Angular. However you can take
            advantage of Angular's properties and events provided by ag-Grids Angular Component.
            This is done as follows:
        </p>

        <ul>
            <li><b>Attributes</b>: Attributes are defined as normal HTML attributes and set non-bound values.</li>
            <li><b>Properties</b>: Properties are defined as HTML attributes enclosed in square
                brackets and are Angular bound values.
            </li>
            <li><b>Callbacks</b>: Callbacks are actually a type of property, but by convention they are
                always functions and are not for relaying event information. They are bound as properties
                using square brackets. As callbacks are not events, they do not impact the Angular
                event cycle, and as such should not change the state of anything.
            </li>
            <li><b>Event Handlers</b>: Event handlers are defined as HTML attributes enclosed in
                normal brackets and are Angular bound functions.
            </li>
            <li><b>API</b>: The grid API and column API are accessible through the component.</li>
        </ul>

        <p>
            All of the above (attributes, properties, callbacks and event handlers) are registered
            using their 'dash' syntax and not camelcase. For example, the property enableSorting
            is bound using enable-sorting. <i>enable-sorting</i>. The following example shows
            some bindings:
        </p>

<snippet>
&lt;ag-grid-angular
    // give an AngularJS 1.x ID to the grid
    #myGrid

    // these are boolean values, which if included without a value, default to true
    // (which is different to leaving them out, in which case the default is false)
    enable-sorting
    enable-filter

    // these are attributes, not bound, give explicit values here
    row-height="22"
    row-selection="multiple"

    // these are bound properties, bound to the AngularJS 1.x current context (that's what a
    // scope is called in Angular JS 2)
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
            The API's are accessible through the component. This is useful in two situations.
            The first is by using an Angular ID. In the example above, the ID is given
            as '#myGrid' which then allows something like this:
        </p>

        <snippet>
            &lt;button (click)="&lt;b&gt;myGrid&lt;/b&gt;.api.deselectAll()"&gt;Clear Selection&lt;/button&gt;
        </snippet>
    </div>

    <div>
        <h2>
            <img src="/images/polymer-large.png" height="50px"/>
            Polymer
        </h2>

        <p>
            The gridOptions are fully available, you can however you can take
            advantage of Polymers properties and events provided by ag-Grids Polymer Component.
            This is done as follows:
        </p>

        <h3>Properties</h3>

        <p>Properties on <code>ag-grid-polymer</code> can be provided in the following three ways:</p>

        <ul>
            <li>LowerCase: ie: <code>enablesorting</code></li>
            <li>CamelCase: ie: <code>enableSorting</code></li>
            <li>Hyphenated Lowercase: ie: <code>enable-sorting</code></li>
        </ul>

        <p>You can specify the properties in the following ways:</p>

        <ul>
            <li>On the <code>ag-grid-polymer</code>component at declaration time</li>
            <li>On the <code>gridOptions</code> property</li>
        </ul>

        <h4>Properties on <code>ag-grid-polymer</code></h4>

        <snippet>
            // Grid Definition
            &lt;ag-grid-polymer rowData="{{rowData}}"
            enableSorting
            enable-filtering
            ...other properties&gt;&lt;/ag-grid-polymer&gt;
        </snippet>

        <p>Here we've specified 3 properties: <code>rowData</code> is provided with two-way binding.
            <code>enableSorting</code>
            and <code>enable-filtering</code> illustrate how you can specify properties in different cases.</p>

        <h3>Events</h3>

        <p>All data out of the grid comes through events. You can specify the events you want to listen to in the
            following ways:</p>

        <ul>
            <li>On the <code>ag-grid-polymer</code>component at declaration time</li>
            <li>On the <code>gridOptions</code> property</li>
            <li>On the <code>ag-grid-polymer</code>component post creation time, via event listeners</li>
            <li>On the <code>ag-grid-polymer</code>component post creation time, via direct property access</li>
        </ul>

        <h4>Events on <code>ag-grid-polymer</code></h4>

        <snippet>
            // Grid Definition
            &lt;ag-grid-polymer onGridReady="{{onGridReady}}"
            ...other properties&gt;&lt;/ag-grid-polymer&gt;
        </snippet>

        <p>Here we're listening to the <code>gridReady</code> event - as with most events we need to add the "on"
            prefix.</p>

        <note>When defining event listeners in this way it's important to note that the <code>this</code> context will
            be <code>ag-grid-polymer</code>,
            <span>not</span> the containing application element. You will have access to the grids properties directly,
            but not the application element itself.
            The <code>api</code> and <code>columnApi</code> are available directly via <code>this.api</code> and <code>this.columnApi</code>.
        </note>


        <h4>Events via the <code>gridOptions</code> property</h4>

<snippet>
// Grid Definition
&lt;ag-grid-polymer
    gridOptions="{{gridOptions}}"
    ...other properties&gt;
&lt;/ag-grid-polymer&gt;

// Application Code
this.gridOptions.onColumnResized = (event) =&gt; {
    console.log('event via option 3: ' + event);
};
</snippet>

        <h4>Events via Event Listeners on an instance of <code>ag-grid-polymer</code></h4>

<snippet>
// Grid Definition
&lt;ag-grid-polymer id="myGrid"
...other properties&gt;
&lt;/ag-grid-polymer&gt;

// Application Code
this.$.myGrid.addEventListener('columnresized', (event) =&gt; {
    console.log('event via option 1: ' + event.agGridDetails);
})
</snippet>

        <p>In this case we need to specify an id on the <code>ag-grid-polymer</code> component in order to access it.
        </p>
        <p>The grid's payload will be available on the events <code>agGridDetails</code> property.</p>

        <h4>Events via direct property access on an instance of <code>ag-grid-polymer</code></h4>

<snippet>
// Grid Definition
&lt;ag-grid-polymer
    id="myGrid"
    ...other properties&gt;
&lt;/ag-grid-polymer&gt;

// Application Code
this.$.myGrid.oncolumnresized = (event) =&gt; {
    console.log('event via option 2: ' + event.agGridDetails);
}
</snippet>

        <p>In this case we need to specify an id on the <code>ag-grid-polymer</code> component in order to access it.
        </p>
        <p>The grid's payload will be available on the events <code>agGridDetails</code> property.</p>

        <h3>Grid Api</h3>

        <p>The Grid API (both <code>api</code> and <code>columnApi</code>) will only be available after the <code>gridReady</code>
            event has been fired.</p>

        <p>You can access the APIs in the following ways</p>
        <ul>
            <li>Store them in the <code>gridReady</code> event - they'll be available via the params argument passed
                into the event
            </li>
            <li>Provide a <code>gridOptions</code> object to the grid pre-creation time. Post creation the APIs will be
                available on the
                <code>gridOptions</code> object.
            </li>
        </ul>

        <h3>Cell Editors, Cell Renderers, Filters etc</h3>

        <p>Please see the relevant sections on <a
                    href="../javascript-grid-cell-rendering-components/#polymerCellRendering">cell renderer's</a>,
            <a href="../javascript-grid-cell-editing/#polymerCellEditing">cell editors</a> and
            <a href="../javascript-grid-filtering/#polymerFiltering">filters</a> for configuring and using Polymer
            Components in ag-Grid.</p>

    </div>

    <div>
        <h2>
            <img src="/images/vue_large.png" height="50px"/>
            VueJS
        </h2>

        <p>
            The gridOptions are fully available as stated above for VueJS. However you can take
            advantage of VueJS's properties and events provided by ag-Grids VueJS Component.
            This is done as follows:
        </p>

        <ul>
            <li><b>Attributes</b>: Attributes are defined as normal HTML attributes and set non-bound values.</li>
            <li><b>Properties</b>: Properties are defined as HTML attributes prefixed with a colon <code>:</code>
                and are VueJS bound values.
            </li>
            <li><b>Callbacks</b>: Callbacks are actually a type of property, but by convention they are
                always functions and are not for relaying event information. They are bound as properties
                prefixed with a colon <code>:</code>. As callbacks are not events, they do not impact the VueJS
                event cycle, and as such should not change the state of anything.
            </li>
            <li><b>Event Handlers</b>: Event handlers are defined as HTML attributes prefixed with a colon
                <code>:</code>
                and are VueJS bound functions.
            </li>
            <li><b>API</b>: The grid API and column API are accessible through the component.</li>
        </ul>

        <p>
            All of the above (attributes, properties, callbacks and event handlers) are registered
            using their 'dash' syntax and not camelcase. For example, the property enableSorting
            is bound using enable-sorting. <i>enable-sorting</i>. The following example shows
            some bindings:
        </p>

<snippet>
&lt;&lt;ag-grid-vue
    // these are attributes, not bound, give explicit values here
    rowHeight="22"
    rowSelection="multiple"

    // these are boolean values
    // (leaving them out will default them to false)
    :enableColResize="true"
    :enableSorting="true"

    // these are bound properties
    :gridOptions="gridOptions"
    :columnDefs="columnDefs"

    // this is a callback
    :isScrollLag="myIsScrollLagFunction"

    // these are registering event callbacks
    :modelUpdated="onModelUpdated"
    :cellClicked="onCellClicked"
&lt;/ag-grid-vue&gt;
</snippet>

        <p>
            The API's are accessible through the component. This is useful in two situations.
            The first is by using an ID. In the example above, the ID is given
            as '#myGrid' which then allows something like this:
        </p>

<snippet>
&lt;button @click="&lt;b&gt;myGrid&lt;/b&gt;.api.deselectAll()"&gt;Clear Selection&lt;/button&gt;
</snippet>

    </div>

    <div>
        <h2>
            <img src="../images/webComponents.png" height="50px"/>
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
            <li><b>Callbacks</b>: Callbacks, like properties, are also set directly on the DOM object using javascript.
            </li>
            <li><b>Event Handlers</b>: Event handlers are registered as normal DOM event handlers, using
                either addEventListener(eventName, handler) or assigning an onXXX method on the DOM object.
            </li>
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
            to Angular, however no binding of properties or event handling.
        </p>

<snippet>
&lt;ag-grid-angular
    // normal id for CSS selector inside Javascript
    id="myGrid"

    // these are boolean values, which if included without a value, default to Yes
    enable-sorting
    enable-filter

    // these are attributes, not bound, give explicit values here
    row-height="22"
    row-selection="multiple"
&lt;/ag-grid-angular&gt;
</snippet>

        <p>
            Then the callbacks and event handling are done in the Javascript as follows:
        </p>

<snippet>
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
</snippet>

    </div>

    <div>
        <h2>
            <img src="/images/aurelia.png" height="50px"/>
            Aurelia
        </h2>
        <p>The gridOptions are fully available as stated above for Aurelia. However you can take advantage of Aurelia's
            properties and events provided by ag-Grids Aurelia Component. This is done as follows:</p>
        <ul>
            <li><b>Events:</b> All data out of the grid comes through events. These use
                Aurelia event bindings eg <i>model-updated.call="onModelUpdated()"</i>.
                As you interact with the grid, the different events are fixed and
                output text to the console (open the dev tools to see the console).
            </li>
            <li><b>Properties:</b> All the data is provided to the grid as Aurelia
                bindings. These are bound onto the ag-Grid properties bypassing the
                elements attributes. The values for the bindings come from the parent
                controller.
            </li>
            <li><b>Attributes:</b> When the property is just a simple string value, then
                no binding is necessary, just the value is placed as an attribute
                eg <i>row-height.bind="22"</i>.
            </li>
            <li><b>Changing Properties:</b> When a property changes value, Aurelia
                automatically passes the new value onto the grid. This is used in
                the following locations:<br/>
                a) The 'quickFilter' on the top right updates the quick filter of
                the grid.
                b) The 'Show Tool Panel' checkbox has its value bound to the 'showToolPanel'
                property of the grid.
                c) The 'Refresh Data' generates new data for the grid and updates the
                <i>rowData</i> property.
            </li>
        </ul>

        <p>
            The example has ag-Grid configured through the template in the following ways:
        </p>

<snippet>
// notice the grid has an id called agGrid, which can be used to call the API
&lt;ag-grid-aurelia class="ag-theme-fresh"
    // items bound to properties on the controller
    grid-options.bind="gridOptions"
    column-defs.bind="columnDefs"
    show-tool-panel.bind="showToolPanel"
    row-data.bind="rowData"

    // boolean values 'turned on'
    enable-col-resize
    enable-sorting
    enable-filter
    group-headers
    suppress-row-click-selection
    tool-panel-suppress-groups
    tool-panel-suppress-values
    debug

    // simple values
    row-height.bind="22"
    row-selection="multiple"

    // event callbacks
    model-updated.call="onModelUpdated()"
    cell-clicked.call="onCellClicked($event)"
    cell-double-clicked.call="onCellDoubleClicked($event)"
    cell-context-menu.call="onCellContextMenu($event)"
    cell-value-changed.call="onCellValueChanged($event)"
    cell-focused.call="onCellFocused($event)"
    row-selected.call="onRowSelected($event)"
    selection-changed.call="onSelectionChanged()"
    before-filter-changed.call="onBeforeFilterChanged()"
    after-filter-changed.call="onAfterFilterChanged()"
    filter-modified.call="onFilterModified()"
    before-sort-changed.call="onBeforeSortChanged()"
    after-sort-changed.call="onAfterSortChanged()"
    virtual-row-removed.call="onVirtualRowRemoved($event)"
    row-clicked.call="onRowClicked($event)"
    ready.call="onReady($event)"

    column-everything-changed.call="onColumnEvent($event)"
    column-row-group-changed.call="onColumnEvent($event)"
    column-value-changed.call="onColumnEvent($event)"
    column-moved.call="onColumnEvent($event)"
    column-visible.call="onColumnEvent($event)"
    column-group-opened.call="onColumnEvent($event)"
    column-resized.call="onColumnEvent($event)"
    column-pinned-count-changed.call="onColumnEvent($event)"&gt;
&lt;/ag-grid-aurelia&gt;
</snippet>

    </div>

    <h2>Next Steps...</h2>

    <p>
        And that's it Doc, now you know how to interface with the grid. Go now and find out about all
        the great attributes, properties, callbacks and events you can use.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
