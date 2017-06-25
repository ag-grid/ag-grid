<?php if (!isFrameworkAll()) { ?>
    <h2 id="implementing-the-web-components-datagrid"><img style="vertical-align: middle" src="../images/webComponents.png" height="25px"/> Next Steps</h2>
<?php } ?>

<h2 id="complex-web-components-example">Complex Web Components Example</h2>

<p>
    The complex example for Web Components is similar to that for Angular. This is on purpose as
    Angular components are based on Web Components. The example demonstrates the following:
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
    <li><b>Grid API:</b> The grid can be interfaced with through its API. The following
        interact via the API:<br/>
        a) The quickFilter text.<br/>
        b) The Grid API and Column API buttons<br/>
        c) The 'Refresh Data via API' buton<br/>
    </li>
    <li><b>Changing Attributes & Properties:</b> When an attribute or property changes value,
        the grid, if appropriate, acts on this change. This is done in the example in the following locations:
        <br/>
        a) The 'Show Tool Panel' checkbox has its value bound to the 'showToolPanel'
        property of the grid.
        <br/>
        b) The 'Refresh Data via Element' generates new data for the grid by attaching
        it to the <i>rowData</i> property.
    </li>
</ul>

<show-example example="webComponentDataGrid-wc"></show-example>

<?php include '../javascript-grid-getting-started/ag-grid-bundletypes.php' ?>

<?php include '../javascript-grid-getting-started/ag-grid-commonjs.php' ?>

<?php include '../javascript-grid-getting-started/ag-grid-enterprise-dependency.php' ?>

<h2 id="next-steps">Next Steps...</h2>

<p>
    Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
    to learn about accessing all the features of the grid.
</p>


