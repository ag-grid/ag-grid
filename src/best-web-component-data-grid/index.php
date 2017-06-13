<?php
$key = "Getting Started Web Components";
$pageTitle = "Web Component Datagrid";
$pageDescription = "A feature rich datagrid designed for Enterprise. Easily integrate with Web Components to deliver filtering, grouping, aggregation, pivoting and much more.";
$pageKeyboards = "Best Javascript Web Component Datagrid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

        <h2 id="implementing-the-web-components-datagrid">
            <img src="../images/svg/docs/getting_started.svg" width="50" />
            <img style="vertical-align: middle" src="../images/webComponents.png" height="25px"/>
            Getting Started
        </h2>

    <?php include '../javascript-grid-getting-started/ag-grid-dependency.php' ?>


    <h3>Download ag-Grid-Enterprise</h3>

    <table>
        <tr>
            <td style="padding: 10px;"><img src="../images/bower.png"/></td>
            <td>
                <b>Bower</b><br/>
                bower install ag-grid-enterprise
            </td>

            <td style="width: 20px;"/>

            <td style="padding: 10px;"><img src="../images/npm.png"/></td>
            <td>
                <b>NPM</b><br/>
                npm install ag-grid-enterprise
            </td>

            <td style="width: 20px;"/>

            <td style="padding: 10px;"><img src="../images/github.png"/></td>
            <td>
                <b>Github</b><br/>
                Download from <a href="https://github.com/ceolter/ag-grid-enterprise">Github</a>
            </td>
        </tr>
    </table>

    <h3>Referencing ag-Grid-Enterprise</h3>

    <p>
        ag-Grid-Enterprise is also distributed as both a self contained bundle and also via a CommonJS package.
    </p>

    <p>As with the ag-Grid example, all we need to do is reference the ag-grid-enterprise dependency and we're good
        to go:</p>
    <pre>
&lt;html&gt;
&lt;head&gt;
    &lt;script src="path-to-ag-grid-enterprise/ag-grid-enterprise.js"&gt;&lt;/script&gt;
    &lt;script src="example1.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div id="myGrid" style="height: 100%;" class="ag-fresh"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>
    <note>
        <strong>Self Contained Bundles</strong>

        <p>Do <b>not</b> include both ag-Grid and ag-Grid-Enterprise self contained bundles. The ag-Grid-Enterprise
            contains ag-Grid.</p>
    </note>

    <p>The creation of the Grid would be the same as the ag-Grid example above.</p>

    <h4>ag-Grid Enterprise Bundle Types</h4>
    <p>
        Again similar to ag-Grid, ag-Grid-Enterprise has 4 bundles:
    <ul>
        <li>dist/ag-grid-enterprise.js -> standard bundle containing JavaScript and CSS</li>
        <li>dist/ag-grid-enterprise.min.js -> minified bundle containing JavaScript and CSS</li>
        <li>dist/ag-grid-enterprise.noStyle.js -> standard bundle containing JavaScript without CSS</li>
        <li>dist/ag-grid-enterprise.min.noStyle.js -> minified bundle containing JavaScript without CSS</li>
    </ul>
    </p>

    <p>Even if you are using React, AngularJS 1.x, Angular, VueJS or Web Components, the above is all you need
        to
        do.
        Any grid you create will be an enterprise grid once you load the library.</p>

    <h4>CommonJS</h4>
    <p>
        If using CommonJS, you one need to include ag-Grid-Enterprise into your project. You do not need to
        execute any code inside it. When ag-Grid-Enterprise loads, it will register with ag-Grid such that the
        enterprise features are available when you use ag-Grid.
    </p>

    <pre>// ECMA 5 - using nodes require() method
var AgGrid = require('ag-grid');
// only include this line if you want to use ag-grid-enterprise
require('ag-grid-enterprise');

// ECMA 6 - using the system import method
import {Grid} from 'ag-grid/main';
// only include this line if you want to use ag-grid-enterprise
import 'ag-grid-enterprise/main';
</pre>
</div>

    <p>
        <a href="http://webcomponents.org/">Web Components</a> are reusable user interface widgets that are created
        using open Web technology. They are part of the browser and so they do not depend on external libraries
        such as AngularJS 1.x or JQuery.
    </p>
    <p>
        Web Components are of particular interest to ag-Grid as I see them as the future for reusable components.
        A true Web Component will be reusable in any framework. Angular's directives are based on Web Components.
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

    <h4 id="using-ag-grid-web-component">Using ag-Grid Web Component</h4>


    <p>
        When using Web Components, you have the choice of using the bundled version of ag-Grid
        or the CommonJS version.
    </p>
    <p>
        When the ag-Grid script loads, it does not register the Web Component. This is because the
        Web Component is an optional part of ag-Grid and you need to tell ag-Grid you
        want to use it.
    </p>

    <pre><code>// get ag-Grid to install the web component
agGrid.initialiseAgGridWithWebComponents();</code></pre>

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

    <h2 id="basic-web-components-example">Basic Web Components Example</h2>

    <p>
        The example below shows a simple grid using Web Components.
    </p>

    <show-example example="example-wc" example-height="160px"></show-example>

    <h2 id="advanced-web-components-example">Advanced Web Components Example</h2>

    <show-example example="webComponentDataGrid"></show-example>

    <h2 id="destroy">Destroy</h2>

    <p>
        To get the grid to release resources, call api.destroy(). If you do not do this, old grids will hang around
        and add to a memory leak problem in your application.
    </p>

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

<show-example example="webComponentDataGrid-wc"></show-example>

<h2 id="next-steps">Next Steps...</h2>

<p>
    Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
    to learn about accessing all the features of the grid.
</p>



<?php include '../documentation-main/documentation_footer.php';?>
