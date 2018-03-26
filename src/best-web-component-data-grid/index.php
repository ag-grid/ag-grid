<?php
$pageTitle = "ag-Grid: The Best Web Component Datagrid in the World";
$pageDescription = "A feature rich data grid designed for Enterprise applications. Easily integrate with Web Components to deliver filtering, grouping, aggregation, pivoting and much more. Try our Community version now or take a free 2 month trial of Enterprise Version.";
$pageKeyboards = "Web Component Grid";
$pageGroup = "basics";
include '../getting-started/header.php';
?>

<div>

    <h1 id="implementing-the-web-components-datagrid">
        <img src="../images/svg/docs/getting_started.svg" width="50" />
        <img style="vertical-align: middle" src="../images/webComponents.png" height="25px"/>
        Web Component Grid
    </h1>

    <p>
        ag-Grid can be used as a Web Component grid inside your application. This page details how to get started.
    </p>

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

    <note>Full working examples of the ag-Grid Web Component can be found in <a href="https://github.com/ag-grid/ag-grid-webcomponent">Github</a>,
        illustrating both a Simple Grid and a Rich Grid.</note>

    <h3>Dependencies</h3>

    <p>Using ag-Grid as a Web Component requires two dependencies: <code>ag-grid-webcomponent</code> and
        <span style="font-style: italic;font-weight: bold">either</span> <code>ag-grid</code> or <code>ag-grid-enterprise,</code>.</p>


    <h3>Download ag-Grid-WebComponent</h3>

    <table>
        <tr>
            <td style="padding: 10px;"><img src="../images/bower.png"/></td>
            <td>
                <b>Bower</b><br/>
                bower install ag-grid-webcomponent
            </td>

            <td style="width: 20px;"/>

            <td style="padding: 10px;"><img src="../images/npm.png"/></td>
            <td>
                <b>NPM</b><br/>
                npm install ag-grid-webcomponent
            </td>

            <td style="width: 20px;"/>

            <td style="padding: 10px;"><img src="../images/github.png"/></td>
            <td>
                <b>Github</b><br/>
                Download from <a href="https://github.com/ag-grid/ag-grid-webcomponent">Github</a>
            </td>
        </tr>
    </table>

    <h3>Referencing ag-Grid-WebComponent</h3>

    <p>
        To use <code>ag-grid-webcomponent</code> you need to import it in your html file:
    </p>

    <snippet>
&lt;link rel="import" href="path-to-ag-grid-webcomponent/ag-grid-webcomponent/ag-grid.html"&gt;</snippet>

    <h3>Download ag-Grid</h3>

    <table>
        <tr>
            <td style="padding: 10px;"><img src="../images/bower.png"/></td>
            <td>
                <b>Bower</b><br/>
                bower install ag-grid
            </td>

            <td style="width: 20px;"/>

            <td style="padding: 10px;"><img src="../images/npm.png"/></td>
            <td>
                <b>NPM</b><br/>
                npm install ag-grid
            </td>

            <td style="width: 20px;"/>

            <td style="padding: 10px;"><img src="../images/github.png"/></td>
            <td>
                <b>Github</b><br/>
                Download from <a href="https://github.com/ag-grid/ag-grid">Github</a>
            </td>
        </tr>
    </table>

    <h3>Referencing ag-Grid</h3>

    <p>
        ag-Grid is distributed as both a self contained bundle (that places ag-Grid on the global scope)
        and also via a CommonJS package.
    </p>

    <p>Using the bundled version is the quickest way to get going - reference this version in your HTML file is all you need
        to do.</p>
    <snippet>
&lt;script src="path-to-ag-grid-/ag-grid.js"&gt;&lt;/script&gt;</snippet>

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
                Download from <a href="https://github.com/ag-grid/ag-grid-enterprise">Github</a>
            </td>
        </tr>
    </table>

    <h3>Referencing ag-Grid-Enterprise</h3>

    <p>
        ag-Grid-Enterprise is also distributed as both a self contained bundle and also via a CommonJS package.
    </p>

    <p>As with the ag-Grid example, all we need to do is reference the ag-grid-enterprise dependency and we're good
        to go:</p>

    <snippet>
&lt;script src="path-to-ag-grid-/ag-grid.js"&gt;&lt;/script&gt;</snippet>

    <h3>Using the ag-Grid Web Component</h3>

    <p>To use the ag-Grid Web Component you need to use <code>ag-grid</code> in your template:</p>

    <snippet>
&lt;body&gt;
&lt;ag-grid id="myGrid"
         style="height: 140px; width: 350px;"
         class="ag-theme-balham"&gt;&lt;/ag-grid&gt;
&lt;/body&gt;
   </snippet>

    <p>You can also provide simple properties at the same time, for example:</p>

    <snippet>
&lt;body&gt;
    &lt;ag-grid id="myGrid"
             style="height: 140px; width: 350px;"
             class="ag-theme-balham"&gt
             enable-col-resize
             enable-sorting
             enable-filter&lt;/ag-grid&gt;
&lt;/body&gt;</snippet>

    <p>Note here that the properties need to be lower case and hyphenated, as per the Web Components standard.</p>

    <p>A complete html file might look something like this:</p>
    
    <snippet>
&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;ag-Grid Web Component - Simple Example&lt;/title&gt;

    &lt;!-- webcomponents polyfill - must be before any wc related javascript is executed --&gt;
    &lt;span style="font-weight: bold"&gt;&lt;script src=../../node_modules/@webcomponents/custom-elements/custom-elements.min.js&gt;&lt;/script&gt;&lt;/span&gt;

    &lt;!-- before the ag-grid web component --&gt;
    &lt;!-- either ag-grid or ag-grid-enterprise, depending on which you're using --&gt;
    &lt;span style="font-weight: bold"&gt;&lt;script src="../../node_modules/ag-grid/dist/ag-grid.min.js"&gt;&lt;/script&gt;&lt;/span&gt;

    &lt;!-- the ag-grid-webcomponent--&gt;
    &lt;span style="font-weight: bold"&gt;&lt;link rel="import" href="../../node_modules/ag-grid-webcomponent/ag-grid.html"&gt;&lt;/span&gt;

    &lt;!-- the application code --&gt;
    &lt;span style="font-weight: bold"&gt;&lt;script src="simple-grid-example.js"&gt;&lt;/script&gt;&lt;/span&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;span style="font-weight: bold"&gt;&lt;ag-grid id="myGrid"
         style="height: 140px; width: 350px;"
         class="ag-theme-balham"&gt;&lt;/ag-grid&gt;&lt;/span&gt;
&lt;/body&gt;
&lt;/html&gt;</snippet>

    <p>Note here we're including a polyfill to support older browsers without full support for Web Components (likely to
    be the case for a while yet), then the ag-Grid dependency, the ag-Grid-WebComponent dependency and finally our application
        code.</p>

    <h4>ag-Grid Enterprise Bundle Types</h4>
    <p>
        Again similar to ag-Grid, ag-Grid-Enterprise has 4 bundles:
</p>
    <ul class="content">
        <li>dist/ag-grid-enterprise.js -> standard bundle containing JavaScript and CSS</li>
        <li>dist/ag-grid-enterprise.min.js -> minified bundle containing JavaScript and CSS</li>
        <li>dist/ag-grid-enterprise.noStyle.js -> standard bundle containing JavaScript without CSS</li>
        <li>dist/ag-grid-enterprise.min.noStyle.js -> minified bundle containing JavaScript without CSS</li>
    </ul>

    <p>Even if you are using React, AngularJS 1.x, Angular, VueJS or Web Components, the above is all you need
        to
        do.
        Any grid you create will be an enterprise grid once you load the library.</p>

    <h2 id="basic-web-components-example">Basic Web Components Example</h2>

    <p>
        The example below shows a simple grid using Web Components.
    </p>

    <?= example('Simple Web Components with ag-Grid', 'simple-grid', 'as-is', array("noPlunker" => 1, "exampleHeight" => 150)) ?>

    <h2 id="complex-web-components-example">Complex Web Components Example</h2>

    <p>
        The complex example for Web Components is similar to that for Angular. This is on purpose as
        Angular components are based on Web Components. The example demonstrates the following:
    </p>

    <ul class="content">
        <li><b>Events:</b> All data out of the grid comes through events. These events
            are native browser events and can be listened to one of: <br/>
            a) Calling <code>addEventListener(eventName, handler)</code> on the element<br/>
            b) Add an <code>onXXX</code> handler directly to the element or<br/>
            c) Add an <code>onXXX</code> handler directly to the grid options. <br/>
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
            it to the <code>rowData</code> property.
        </li>
    </ul>

    <?= example('Rich Web Components with ag-Grid', 'rich-grid', 'as-is', array("noPlunker" => 1, "exampleHeight" => 500)) ?>

    <h2 id="destroy">Destroy</h2>

    <p>
        To get the grid to release resources, call api.destroy(). If you do not do this, old grids will hang around
        and add to a memory leak problem in your application.
    </p>

<h2 id="next-steps">Next Steps...</h2>

<p>
    Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
    to learn about accessing all the features of the grid.
</p>


</div>

<?php include '../getting-started/footer.php'; ?>
