<?php
$key = "Getting Started Web Components";
$pageTitle = "Best Web Component Grid";
$pageDescription = "Shows how to use ag-Grid to build a Javascript grid using Web Components and without using any framework";
$pageKeyboards = "Best Javascript Web Component Data Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started - Web Components</h2>

    <p>
        <a href="http://webcomponents.org/">Web Components</a> are reusable user interface widgets that are created
        using open Web technology. They are part of the browser and so they do not depend on external libraries
        such as AngularJS or JQuery.
    </p>
    <p>
        Web Components are of particular interest to ag-Grid as I see them as the future for reusable components.
        A true Web Component will be reusable in any framework. Angular 2's directives are based on Web Components.
    </p>
    <note>
        Web components are an emerging technology and not available in all browsers. Some browsers lacking support
        can be plugged using polyfills. The examples on this page use
        <a href="http://cdnjs.com/libraries/webcomponentsjs">webcomponent.js</a>
        polyfill from Google. The examples on this page have been tested to work with latest versions of Chrome
        and Firefox on Windows. They failed using IE 11 and Safari on Windows. I have not done extensive testing
        on which browsers Web Components as what browsers support Web Components and which don't is not a grid
        problem / discussion, it's specific to Web Components. If you are going to use Web Components in your
        application, then which browsers your application will run on is a big question you need to answer for
        yourself.
    </note>

    <h4>Using ag-Grid Web Component</h4>

    <p>
        ag-Grid registers as a tag named 'ag-grid'. To insert a grid into your application, use the
        ag-grid tag and then either provide the grid options through Javascript or provide options
        through html attributes.
    </p>

    <p>
        HTML Code:
        <pre><code>&lt;ag-grid id="myGrid">&lt;/ag-grid></code></pre>
        Javascript Code:<br/>
    <pre><code>var myGrid = document.querySelector('#myGrid');
myGrid.setGridOptions(gridOptions);</code></pre>
    </p>

    <h2>Basic Web Components Example</h2>

    <p>
        The example below shows a simple grid using Web Components.
    </p>

    <show-example example="example1" example-height="160px"></show-example>

    <h2>Complex Web Components Example</h2>

    <p>
        The complex example for Web Components is similar to that for AngularJS 2. This is on purpose as
        AngularJS 2 components are based on Web Components. The example demonstrates the following:
    </p>

    <ul>
        <li><b>Events:</b> All data out of the grid comes through events. These events
            are native browser events and can be listened to one of: <br/>
            a) Calling <i>addEventListener(eventName, handler)</i> on the element<br/>
            b) Add an <i>onXXX</i> handler directly to the element or<br/>
            c) Add an <i>onXXX</i> handler directly to the grid options. <br/>
            In the example,
            the event 'columnResized' is added in each of these three ways.
        </li>
        <li><b>Attributes:</b> Attributes can be used for setting up the grid.
            The example uses such properties for the simple data types (ie when
            they are not Javascript objects). Notice that boolean attributes are defaulted
            to 'true' IF the attribute is provided WITHOUT any value. If the attribute is not provided,
            it is taken as false. Attributes can be changed after the grid is initialised,
            and the grid will update if appropriate (eg open up your dev tools and
            change the 'group-headers' and set it to 'false').
        </li>
        <li><b>Properties:</b> The more complex properties (eg row and column data)
            are attached directly to the grid DOM element.
        </li>
        <li><b>Grid API:</b> The grid can be interfaced with through it's API. The following
            interact via the API:<br/>
            a) The quickFilter text.<br/>
            b) The Grid API and Column API buttons<br/>
            c) The 'Refresh Data via API' buton<br/>
        </li>
        <li><b>Changing Attributes & Properties:</b> When an attribute or property changes value,
            the grid, if appropriate, acts on this change. This is done in the example in the following locations:
            <br/>
            a) The 'Show Tool Panel' checkbox has it's value bound to the 'showToolPanel'
            property of the grid.
            <br/>
            b) The 'Refresh Data via Element' generates new data for the grid by attaching
            it to the <i>rowData</i> property.
        </li>
    </ul>

    <show-example example="webComponentDataGrid"></show-example>

    <h2>Destroy</h2>

    <p>
        To get the grid to release resources, call api.destroy(). If you do not do this, old grids will hang around
        and add to a memory leak problem in your application.
    </p>

    <h2>Next Steps...</h2>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/index.php">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>

</div>

<?php include '../documentation_footer.php';?>
