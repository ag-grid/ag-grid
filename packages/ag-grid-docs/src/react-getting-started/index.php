<?php
$pageTitle = "ag-Grid Reference: Getting Started with the React Datagrid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This Getting Start guide covers installing our seed repo and getting up and running with a simple React Datagrid. We also cover basisc configuration.";
$pageKeyboards = "React Datagrid";
$pageGroup = "basics";
include '../getting-started/header.php';
?>


<div>

<h1>Get Started with ag-Grid in Your React Project</h1>

<p class="lead">The "ag" part of ag-Grid stands for "agnostic". The internal ag-Grid engine is implemented in plain JavaScript<sup id="a1"><a href="#f1">[1]</a></sup> and has zero dependencies. 
ag-Grid supports React through a <strong>wrapper component</strong>. The React wrapper lets you use ag-Grid in your application like any other React component &ndash; you pass configuration through properties and handle events through callbacks. 
You can even use React components to customize the grid UI and cell contents / behavior.</p> 

<p>In this article, we will walk you through the necessary steps to add ag-Grid to an existing React project, and configure some of the essential features of it. We will show you some of the fundamentals of the grid (passing properties, using the API, etc). As a bonus, we will also tweak the grid's visual appearance using Sass variables.</p>

<h2>Add ag-Grid to Your Project</h2>

<p>For the purposes of this tutorial, we are going to scaffold a react app with <a href="https://github.com/facebook/create-react-app">create-react-app</a>. 
Don't worry if your project has a different configuration. Ag-Grid and the React wrapper are distributed as NPM packages, which should work with any common React project module bundler setup. 
Let's follow the <a href="https://github.com/facebook/create-react-app#quick-overview">create-react-app instructions</a> - run the following commands in your terminal:</p>

<snippet language="sh">
npx create-react-app my-app
cd my-app
npm start
</snippet>
<div class="note"><a href="https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b" rel="nofollow">npx</a> comes with npm 5.2+ and higher, see <a href="https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f">instructions for older npm versions</a></div>

<p>If everything goes well, <code>npm start</code> has started the web server and conveniently opened a browser pointing to <a href="http://localhost:3000">localhost:3000</a>.</p> 

<p>As a next step, let's add the ag-Grid NPM packages. run the following command in <code>my-app</code> (you may need a new instance of the terminal):</p>

<snippet language="sh">
npm install --save ag-grid ag-grid-react react-dom-factories
</snippet>

<p>After a few seconds of waiting, you should be good to go. Let's get to the actual coding! Open <code>src/App.js</code> in your favorite text editor and change its contents to the following:</p>

<pre class="language-jsx" ng-non-bindable><code>import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {headerName: "Make", field: "make"},
                {headerName: "Model", field: "model"},
                {headerName: "Price", field: "price"}

            ],
            rowData: [
                {make: "Toyota", model: "Celica", price: 35000},
                {make: "Ford", model: "Mondeo", price: 32000},
                {make: "Porsche", model: "Boxter", price: 72000}
            ]
        }
    }

    render() {
        return (
                &lt;div 
                  className="ag-theme-balham"
                  style={{ 
	                height: '500px', 
	                width: '600px' }} 
		            &gt;
                    &lt;AgGridReact
                        columnDefs={this.state.columnDefs}
                        rowData={this.state.rowData}&gt;
                    &lt;/AgGridReact&gt;
                &lt;/div&gt;
            );
    }
}

export default App;
</code></pre>

<p>Done? If everything is correct, we should see a simple grid that looks like this:</p>

<img class="img-fluid" src="../getting-started/step1.png" alt="ag-Grid in its simplest form" />

<p>Let's go over the <code>App.jsx</code> changes we made:</p>

<pre class="language-jsx" ng-non-bindable><code>import {AgGridReact} from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-balham.css';
</code></pre>

<p>The three lines above import the <code>AgGridReact</code> component, the grid "structure" stylesheet (<code>ag-grid.css</code>), and one of the available grid themes: (<code>ag-theme-balham.css</code>). 
The grid ships several different themes; pick one that matches your project design. You can customize it further with Sass variables, a technique which we will cover further down the road.</p>

<snippet language="jsx">
constructor(props) {
    super(props);

    this.state = {
        columnDefs: [
            {headerName: "Make", field: "make"},
            {headerName: "Model", field: "model"},
            {headerName: "Price", field: "price"}

        ],
        rowData: [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ]
    }
}
</snippet>

<p>The code above presents two essential configuration properties of the grid - <strong>the column definitions</strong> (<code>columnDefs</code>) and the data (<code>rowData</code>). In our case, the column definitions contain three columns; 
each column entry specifies the header label and the data field to be displayed in the body of the table.</p> 

<p>The actual data is defined in the <code>rowData</code> as an array of objects. Notice that the fields of the objects match the <code>field</code> values in the <code>columnDefs</code> configuration object.</p> 

<pre class="language-jsx" ng-non-bindable><code>
    &lt;div style={{ height: '150px', width: '600px' }} className="ag-theme-balham"&gt;
        &lt;AgGridReact
            columnDefs={this.state.columnDefs}
            rowData={this.state.rowData}&gt;
        &lt;/AgGridReact&gt;
    &lt;/div&gt;
</code></pre>

<p>Finally, the JSX code above describes a wrapper <code>DIV</code> element which sets the grid dimensions and specifies the grid's theme by setting the <code>className</code> to <code>ag-theme-balham</code>. As you may have already noticed, the CSS class matches the name of CSS file we imported earlier.</p> 

<p>Inside the container, we place an <code>AgGridReact</code> component with the configuration objects (<code>columnDefs</code> and <code>rowData</code>) from the component's constructor passed as properties.</p> 

<h2>Enable Sorting And Filtering</h2>

<p>So far, so good. But wouldn't it be nice to be able to sort the data to help us see which car is the least/most expensive? Well, enabling sorting in ag-Grid is actually quite simple - all you need to do is set the <code>enableSorting</code> property to the <code>AgGridReact</code> component.</p> 

<snippet language="jsx">
&lt;AgGridReact
    enableSorting={true}
    columnDefs={this.state.columnDefs}
    rowData={this.state.rowData}&gt;
&lt;/AgGridReact&gt;
</snippet>

<p>After adding the property, you should be able to sort the grid by clicking on the column headers. Clicking on a header toggles through ascending, descending and no-sort.</p>

<p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a real-world application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like this filtering is your friend.</p>

<p>As with sorting, enabling filtering is as easy as setting the <code>enableFilter</code> property:</p>

<snippet language="jsx">
&lt;AgGridReact
    enableSorting={true}
    enableFilter={true}
    columnDefs={this.state.columnDefs}
    rowData={this.state.rowData}&gt;
&lt;/AgGridReact&gt;
</snippet>

<p>With this property set, the grid will display a small column menu icon when you hover the header. Pressing it will display a popup with filtering UI which lets you choose the kind of filter and the text that you want to filter by.</p>

<img class="img-fluid" src="../getting-started/step2.png" alt="ag-Grid sorting and filtering" />

<h2>Fetch Remote Data</h2>

<p>Displaying hard-coded data in JavaScript is not going to get us very far. In the real world, most of the time, we are dealing with data that resides on a remote server. Thanks to React, implementing this is actually quite simple. 
Notice that the actual data fetching is performed outside of the grid component - We are using the HTML5 <code>fetch</code> API.</p>

<snippet language="diff">
                 {headerName: "Price", field: "price"}

-            ],
-            rowData: [
-                {make: "Toyota", model: "Celica", price: 35000},
-                {make: "Ford", model: "Mondeo", price: 32000},
-                {make: "Porsche", model: "Boxter", price: 72000}
             ]
         }
     }
     
+    componentDidMount() {
+        fetch('https://api.myjson.com/bins/15psn9')
+            .then(result =&gt; result.json())
+            .then(rowData =&gt; this.setState({rowData}))
+    }
+
     render() {
</snippet>

<p>Here, we replaced the <code>rowData</code> assignment in the constructor with a data fetch from a remote service. The remote data is the same as the one we initially had, so you should not notice any actual changes to the grid.</p>

<h2>Enable Selection</h2> 

<p>Being a programmer is a hectic job. Just when we thought that we are done with our assignment, the manager shows up with a fresh set of requirements! 
It turned out that we need to allow the user to select certain rows from the grid and to mark them as flagged in the system. 
We will leave the flag toggle state and persistence to the backend team. On our side, we should enable the selection and, afterwards, to obtain the selected records and pass them with an API call to a remote service endpoint.</p> 

<p>Fortunately, the above task is quite simple with ag-Grid. As you may have already guessed, it is just a matter of adding and changing couple of properties:</p>

<snippet language="diff">
         this.state = {
             columnDefs: [
-                {headerName: "Make", field: "make"},
+                {headerName: "Make", 
+                 field: "make", 
+                 checkboxSelection: true},
                 {headerName: "Model", field: "model"},
</snippet>

<snippet language="diff">
             &lt;AgGridReact
                 enableSorting={true}
+                rowSelection="multiple"
</snippet>

<p>Great! Now the first column contains a checkbox that, when clicked, selects the row. The only thing we have to add is a button that gets the selected data and sends it to the server. To do this, we need the following change:</p> 

<pre class="language-diff" ng-non-bindable><code>
&lt;div style={{ height: '150px', width: '600px' }} className="ag-theme-balham"&gt;
+    &lt;button onClick={this.onButtonClick}&gt;Get selected rows&lt;/button&gt;
+
		 &lt;AgGridReact
+      onGridReady={ params =&gt; this.gridApi = params.api }
</code></pre>

<p>Afterwards, add the following event handler at the end of the component class:</p>

<snippet language="jsx">
onButtonClick = e =&gt; {
    const selectedNodes = this.gridApi.getSelectedNodes()  
    const selectedData = selectedNodes.map( node =&gt; node.data )
    const selectedDataStringPresentation = selectedData.map( node =&gt; node.make + ' ' + node.model).join(', ')
    alert(`Selected nodes: ${selectedDataStringPresentation}`) 
}
</snippet>

<p>Well, we cheated a bit. Calling <code>alert</code> is not exactly a call to our backend. 
Hopefully you will forgive us this shortcut for the sake of keeping the article short and simple. Of course, you can substitute that bit with a real-world application logic after you are done with the tutorial.</p> 

<p>What happened above? Several things:</p>

<ul>
<li><code>onGridReady={ params =&gt; this.gridApi = params.api }</code> obtained a reference to the ag-grid API instance;</li>
<li>We added a button with an event handler;</li>
    <li>Inside the event handler, we accessed the grid api object reference to access the currently selected grid row nodes;</li>
<li>Afterwards, we extracted the row nodes' underlying data items and converted them to a string suitable to be presented to the user in an alert box.</li> 
</ul>
  
<h2>Grouping (enterprise)</h2>

<div class="note">Grouping is a feature exclusive to the enterprise version of ag-Grid.</div>

<p>In addition to filtering and sorting, grouping is another  effective way for the user to make sense out of large amounts of data. In our case, the data is not that much. Let's switch to a slightly larger data set:</p>

<snippet language="diff">
     componentDidMount() {
-        fetch('https://api.myjson.com/bins/15psn9')
+        fetch('https://api.myjson.com/bins/ly7d1')
             .then(result =&gt; result.json())
             .then(rowData =&gt; this.setState({rowData}))
     }
</snippet>

<p>Afterwards, let's enable the enterprise features of ag-grid. Install the additional package:</p>

<snippet language="sh">
npm install --save ag-grid-enterprise
</snippet>

Then, add the import to your file:

<snippet language="diff">
  import { AgGridReact } from 'ag-grid-react';
  import 'ag-grid/dist/styles/ag-grid.css';
  import 'ag-grid/dist/styles/ag-theme-balham.css';
+ import 'ag-grid-enterprise';
</snippet>

<p>If everything is ok, you should see a message in the console that warns you about missing enterprise license. In addition to that, the grid got a few UI improvements - a custom context menu and fancier column menu popup - feel free to look around:</p>

<img class="img-fluid" src="../getting-started/step3.png" alt="ag-Grid final" />

<p>Now, let's enable grouping! Change the <code>state</code> assignment to this:</p>

<snippet language="jsx">
this.state = {
    columnDefs: [
        {headerName: "Make", field: "make", rowGroupIndex: 0 },
        {headerName: "Price", field: "price"}
    ],
    autoGroupColumnDef: {
        headerName: "Model", 
        field: "model", 
        cellRenderer:'agGroupCellRenderer',
        cellRendererParams: {
            checkbox: true
        }
    }
}
</snippet>

<p>Then, change the component definition to receive the <code>autoGroupColumnDef</code> property and the <code>groupSelectsChildren</code>:</p>

<snippet language="diff">
   columnDefs={this.state.columnDefs}
+  groupSelectsChildren={true}
+  autoGroupColumnDef={this.state.autoGroupColumnDef}
   rowData={this.state.rowData}
   &gt;
</snippet>

<p>There we go! The grid now groups the data by <code>make</code>, while listing the <code>model</code> field value when expanded. Notice that grouping works with checkboxes as well - the <code>groupSelectsChildren</code> property adds a group-level checkbox that selects/deselects all items in the group.</p>

<div class="note"> Don't worry if this step feels a bit overwhelming - the  grouping feature is very powerful and supports complex interaction scenarios which you might not need initially. The grouping documentation section contains plenty of real-world runnable examples that can get you started for your particular  case.</div>

<h2>Customize the Theme Look</h2>

<p>The last thing which we are going to do is to change the grid look and feel by modifying some of the theme's Sass variables.</p> 

<p>By default, ag-Grid ships a set of pre-built theme stylesheets. If we want to tweak the colors and the fonts of theme, we should add a Sass preprocessor to our project, override the theme variable values, and refer the ag-grid Sass files instead of the pre-built stylesheets so that the variable overrides are applied.</p>

<p>Adding Sass Preprocessor to create-react-app is well documented - follow the steps <a href="https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-a-css-preprocessor-sass-less-etc">outlined in the respective help section</a>.</p> 

<p>After you are done with the setup, assuming that you have renamed <code>src/App.css</code> to <code>src/App.scss</code>, you can replace its contents with this:</p>

<snippet language="scss">
$ag-icons-path: "../node_modules/ag-grid/src/styles/icons/";
@import "../node_modules/ag-grid/src/styles/ag-grid.scss";
@import "../node_modules/ag-grid/src/styles/ag-theme-balham.scss";
</snippet>

<p>To avoid importing the stylesheets twice, remove the imports from <code>src/App.js</code>:</p>

<snippet language="diff">
 import { AgGridReact } from 'ag-grid-react';
-import 'ag-grid/dist/styles/ag-grid.css';
-import 'ag-grid/dist/styles/ag-theme-balham.css';
</snippet>

<p>Notice that we had to aid the Sass preprocessor a bit by setting the <code>$ag-icons-path</code> variable. This is a common gotcha with Sass, as external image paths are considered relative to the main file. 
In fact, by specifying the icons path, we also made our first theme override! We might change the entire theme icon set by changing the path in the variable to a directory containing our icon set.</p> 

<p>Let's do something simpler, though. We can override the alternating row background color to grayish blue. Add the following line:</p>

<snippet language="diff">
 $ag-icons-path: "../node_modules/ag-grid/src/styles/icons/";
+$odd-row-background-color: #CFD8DC;
</snippet>

<p>If everything is configured correctly, the second row of the grid will get slightly darker. Congratulations! 
You now know now bend the grid look to your will - there are a few dozens more Sass variables that let you control the font family and size, border color, 
header background color and even the amount of spacing in the cells and columns. The full Sass variable list is available in the themes documentation section.</p> 

<h2>Summary</h2> 

<p>With this tutorial, we managed to accomplish a lot. Starting from the humble beginnings of a three row / column setup, we now have a grid that supports sorting, filtering, binding to remote data, selection and even grouping! 
While doing so, we learned how to configure the grid, how to access its API object, and how to change the styling of the component.</p> 

<p>That's just scratching the surface, though. The grid has a lot more features to offer; the abilities to customize cells and headers with custom components allow for almost infinite possible configurations. </p>

<h2>Next Steps</h2> 

<p>You are hungry for more? Head over to the <a href="../react-more-details/">React guides section</a> for more in-depth information about the angular flavor of ag-Grid. To learn more about the features used in this tutorial, you can go through the following help articles:</p>

<p>You can go through the following help articles to learn more about the features we enabled:</p>

<ul>
    <li><a href="../javascript-grid-sorting/">Sorting</a></li>
    <li><a href="../javascript-grid-filtering/">Filtering</a></li>
    <li><a href="../javascript-grid-grouping/">Grouping</a></li>
    <li><a href="../javascript-grid-selection/">Selection</a></li>
    <li><a href="../javascript-grid-styling/#customizing-sass-variables">Customizing themes with Sass</a></li>
</ul>

<p>In addition to that, if you are using Redux, make sure to check out the <a href="../react-redux-integration-pt1/">Integrating ag-Grid with Redux guide</a>.</p>

<p><b id="f1">1</b> This is not exactly true. ag-Grid's core, as well as the framework wrappers are written in TypeScript. This provides nice strong typing and compile-time checks for our TypeScript users, while not giving the Babel/Vanilla users any disadvantage.  <a href="#a1">↩</a></p>

</div>


<?php include '../getting-started/footer.php'; ?>
