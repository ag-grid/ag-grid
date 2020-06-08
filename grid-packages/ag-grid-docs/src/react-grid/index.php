<?php
$pageTitle = "React Grid";
$pageDescription = "ag-Grid is a feature-rich React grid available in Free or Enterprise versions. This Getting Start guide covers installing our seed repo and getting up and running with a simple React Datagrid. We also cover basisc configuration.";
$pageKeywords = "React Datagrid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>
  <h1>React Grid | Get Started with ag-Grid and React</h1>


<p class="lead" id="react-grid-description">
ag-Grid is the industry standard for React Enterprise Applications. Developers using ag-Grid
are building applications that would not be possible if ag-Grid did not exist.
</p>

<note>Please refer to our <a href="#compatibility">Compatibility Chart</a> for Supported Versions of React & ag-Grid.</note>

<?php
include './intro.php';
?>

<h2>Getting Started</h2>

<?= videoSection("https://www.youtube.com/embed/6PA45adHun8", "react-demo", "Getting Started Video Tutorial") ?>

<p>In this article, we will walk you through the necessary steps to add ag-Grid
  (both <a href="../javascript-grid-set-license/">Community and Enterprise</a> are covered)
  to an existing React project,
  and configure some of the essential features of it. We will show you some of the fundamentals of the grid (passing properties, using the API, etc). As a bonus, we will also tweak the grid's visual appearance using Sass variables.
</p>

<br />

<note>
    <div style="display: flex;">
    <span style="display: inline-block; background: radial-gradient(#41a3ff, #0273D4); border-radius: 5px; padding: 3px;">
        <a href="https://thinkster.io/topics/ag-grid">
            <img style="width: 150px;" src="../images/thinkster.png"/>
        </a>
    </span>
        <span style="flex-grow: 1; display: inline-block; padding-left: 10px;">
        Thinkster has provided a free course
        <a href="https://thinkster.io/topics/ag-grid">
            Learning ag-Grid with React
        </a>
    </span>
    </div>
</note>

<h2 id="add-ag-grid-to-your-project">Add ag-Grid to Your Project</h2>
<p>For the purposes of this tutorial, we are going to scaffold a react app with <a href="https://github.com/facebook/create-react-app">create-react-app</a>.
Don't worry if your project has a different configuration. ag-Grid and the React wrapper are distributed as NPM packages, which should work with any common React project module bundler setup.
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
npm install --save ag-grid-community ag-grid-react
</snippet>

<p>After a few seconds of waiting, you should be good to go. Let's get to the actual coding! Open <code>src/App.js</code> in your favorite text editor and change its contents to the following:</p>

<snippet language="jsx">
<div ng-non-bindable>
import React, { Component } from 'react';
import './App.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: [{
        headerName: "Make", field: "make"
      }, {
        headerName: "Model", field: "model"
      }, {
        headerName: "Price", field: "price"
      }],
      rowData: [{
        make: "Toyota", model: "Celica", price: 35000
      }, {
        make: "Ford", model: "Mondeo", price: 32000
      }, {
        make: "Porsche", model: "Boxter", price: 72000
      }]
    }
  }

  render() {
    return (
      &lt;div
        className="ag-theme-alpine"
        style={{
        height: '250px',
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
</div>
</snippet>

<p>Done? If everything is correct, we should see a simple grid that looks like this:</p>
<img class="img-fluid" src="../getting-started/step1.png" alt="ag-Grid in its simplest form" />
<p>Let's go over the <code>App.jsx</code> changes we made:</p>

<snippet language="jsx">import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
</snippet>

<p>The three lines above import the <code>AgGridReact</code> component, the grid "structure" stylesheet (<code>ag-grid.css</code>), and one of the available grid themes: (<code>ag-theme-alpine.css</code>).
</p>

The grid ships <a href="https://www.ag-grid.com/javascript-grid-styling/">several different themes</a>; pick one that matches your project design. You can customise it further with Sass variables, a technique which we will cover further down the road.</p>

<snippet language="jsx">
constructor(props) {
super(props);
this.state = {
  columnDefs: [{
    headerName: "Make", field: "make"
  }, {
    headerName: "Model", field: "model"
  },{
    headerName: "Price", field: "price"
  }],
  rowData: [{
    make: "Toyota", model: "Celica", price: 35000
  },{
    make: "Ford", model: "Mondeo", price: 32000
  },{
    make: "Porsche", model: "Boxter", price: 72000
  }]
}
  </snippet>

  <p>The code above presents two essential configuration properties of the grid - <a href="https://www.ag-grid.com/javascript-grid-column-definitions/"><strong>the column definitions</strong></a> (<code>columnDefs</code>) and the data (<code>rowData</code>). In our case, the column definitions contain three columns;
each column entry specifies the header label and the data field to be displayed in the body of the table.</p>
<p>The actual data is defined in the <code>rowData</code> as an array of objects. Notice that the fields of the objects match the <code>field</code> values in the <code>columnDefs</code> configuration object.</p>

<snippet language="jsx">
<div ng-non-bindable>
&lt;div style={{ height: '250px', width: '600px' }} className="ag-theme-alpine"&gt;
    &lt;AgGridReact
        columnDefs={this.state.columnDefs}
        rowData={this.state.rowData}&gt;
    &lt;/AgGridReact&gt;
&lt;/div&gt;
</div>
</snippet>

<p>Finally, the JSX code above describes a wrapper <code>DIV</code> element which sets the grid dimensions and specifies the grid's theme by setting the <code>className</code> to <code>ag-theme-alpine</code>. As you may have already noticed, the CSS class matches the name of CSS file we imported earlier.</p>
<p>Inside the container, we place an <code>AgGridReact</code> component with the configuration objects (<code>columnDefs</code> and <code>rowData</code>) from the component's constructor passed as properties.</p>
<h2 id="enable-sorting-and-filtering">Enable Sorting And Filtering</h2>
<p>So far, so good. But wouldn't it be nice to be able to sort the data to help us see which car is the least/most expensive? Well, enabling sorting in ag-Grid is actually quite simple - all you need to do is set the <code>sort</code> property to the column definitions.</p>

<snippet language="jsx">
columnDefs: [{
  headerName: "Make", field: "make", sortable: true
}, {
  headerName: "Model", field: "model", sortable: true
}, {
  headerName: "Price", field: "price", sortable: true
}]
</snippet>

<p>After adding the property, you should be able to sort the grid by clicking on the column headers. Clicking on a header toggles through ascending, descending and no-sort.</p>
<p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a real-world application may have hundreds (or even hundreds of thousands!) of rows, with many columns. In a data set like this filtering is your friend.</p>
<p>As with sorting, enabling filtering is as easy as setting the <code>filter</code> property:</p>

<snippet language="js">
columnDefs: [{
  headerName: "Make", field: "make", sortable: true, filter: true
}, {
  headerName: "Model", field: "model", sortable: true, filter: true
  },{
  headerName: "Price", field: "price", sortable: true, filter: true
}]
</snippet>

<p>With this property set, the grid will display a small column menu icon when you hover the header. Pressing it will display a popup with a filtering UI which lets you choose the kind of filter and the text that you want to filter by.</p>
<img class="img-fluid" src="../getting-started/step2.png" alt="ag-Grid sorting and filtering" />
<h2 id="fetch-remote-data">Fetch Remote Data</h2>
<p>Displaying hard-coded data in JavaScript is not going to get us very far. In the real world, most of the time, we are dealing with data that resides on a remote server. Thanks to React, implementing this is actually quite simple.
Notice that the actual data fetching is performed outside of the grid component - We are using the HTML5 <code>fetch</code> API.</p>

<snippet language="diff">
    }, {
      headerName: "Price", field: "price"
    }]

-   rowData: [{
-   make: "Toyota", model: "Celica", price: 35000
-   }, {
-   make: "Ford", model: "Mondeo", price: 32000
-   }, {
-   make: "Porsche", model: "Boxter", price: 72000
-   }]
  }
}

+ componentDidMount() {
+   fetch('https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/sample-data/smallRowData.json')
+     .then(result =&gt; result.json())
+     .then(rowData =&gt; this.setState({rowData}))
+ }
+
  render() {
</snippet>

<p>Here, we replaced the <code>rowData</code> assignment in the constructor with a data fetch from a remote service. The remote data is the same as the one we initially had, so you should not notice any actual changes to the grid.</p>
<h2 id="enable-selection">Enable Selection</h2>
<p>Being a programmer is a hectic job. Just when we thought that we are done with our assignment, the manager shows up with a fresh set of requirements!
  It turned out that we need to allow the user to select certain rows from the grid and to mark them as flagged in the system.
We will leave the flag toggle state and persistence to the backend team. On our side, we should enable the selection and, afterwards, to obtain the selected records and pass them with an API call to a remote service endpoint.</p>
<p>Fortunately, the above task is quite simple with ag-Grid. As you may have already guessed, it is just a matter of adding and changing couple of properties:</p>

<snippet language="diff">
this.state = {
  columnDefs: [{
-   headerName: "Make", field: "make"
- }, {
+   headerName: "Make",
+   field: "make",
+   checkboxSelection: true
+ }, {
  headerName: "Model", field: "model"
},
</snippet>

<snippet language="diff">
  &lt;AgGridReact
+   rowSelection="multiple"
</snippet>

<p>Great! Now the first column contains a checkbox that, when clicked, selects the row. The only thing we have to add is a button that gets the selected data and sends it to the server. To do this, we need the following change:</p>

<snippet language="jsx">
&lt;div style=<span>{</span>{ height: '250px', width: '600px' }<span>}</span> className="ag-theme-alpine"&gt;
      &lt;button onClick=<span>{</span>this.onButtonClick}&gt;Get selected rows&lt;/button&gt;
      &lt;AgGridReact
        onGridReady={ params =&gt; this.gridApi = params.api }
        columnDefs={this.state.columnDefs}
        rowData={this.state.rowData}&gt;
    &lt;/AgGridReact&gt;
&lt;/div&gt;
</snippet>

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

<h2 id="grouping(enterprise)">Grouping (enterprise)</h2>

<div class="note">
    Grouping is a feature exclusive to ag-Grid Enterprise. You are free to trial ag-Grid Enterprise to see what you
    think. You only need to get in touch if you want to start using ag-Grid Enterprise in a project intended
    for production.
</div>

<p>In addition to filtering and sorting, <a href="https://www.ag-grid.com/javascript-grid-grouping/">grouping</a> is another effective way for the user to make sense out of large amounts of data.</p>

<p>Our current data set is pretty small so let's switch to a larger one:</p>

<snippet language="diff">
    - fetch('https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/sample-data/smallRowData.json')
    + fetch('https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/sample-data/rowData.json')
</snippet>

<p>Let's enable the enterprise features of ag-grid. Install the additional package:</p>

<snippet language="sh">
npm install --save ag-grid-enterprise
</snippet>

Then, add the import to your file:

<snippet language="diff">
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
+ import 'ag-grid-enterprise';
</snippet>

<p>
    If everything is ok, you should see a message in the console that tells you there is no enterprise license key.
    You can ignore the message as we are trialing.
    In addition to that, the grid got a few UI improvements - a custom context menu and fancier column menu popup -
    feel free to look around:
</p>

<img class="img-fluid" src="../getting-started/step3.png" alt="ag-Grid final" />

<p>Now, let's enable grouping! Change the <code>state</code> assignment to this:</p>

<snippet language="jsx">
this.state = {
  columnDefs: [{
    headerName: "Make", field: "make", rowGroup: true
  },{
    headerName: "Price", field: "price"
  }],
  rowData: null,
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
</snippet>

<p>There we go! The grid now groups the data by <code>make</code>, while listing the <code>model</code> field value when expanded. Notice that grouping works with checkboxes as well - the <code>groupSelectsChildren</code> property adds a group-level checkbox that selects/deselects all items in the group.</p>
<div class="note"> Don't worry if this step feels a bit overwhelming - the  grouping feature is very powerful and supports complex interaction scenarios which you might not need initially. The grouping documentation section contains plenty of real-world runnable examples that can get you started for your particular  case.</div>
<h2 id="customise-the-theme-look">Customise the Theme Look</h2>
<p>The last thing which we are going to do is to change the grid look and feel by customising a theme.</p>
<p>By default, ag-Grid ships a set of <a href="https://www.ag-grid.com/javascript-grid-styling/"> pre-built theme stylesheets</a>. If we want to tweak the colors and the fonts of theme, we should add a Sass preprocessor to our project, override the theme variable values, and refer the ag-grid Sass files instead of the pre-built stylesheets so that the variable overrides are applied.</p>
<p>Adding Sass Preprocessor to create-react-app is well documented - follow the steps <a href="https://github.com/facebook/create-react-app/blob/master/grid-packages/react-scripts/template/README.md#adding-a-css-preprocessor-sass-less-etc">outlined in the respective help section</a>.</p>
<p>After you are done with the setup, assuming that you have renamed <code>src/App.css</code> to <code>src/App.scss</code>, you can replace its contents with this:</p>

<snippet language="scss">
@import "../node_modules/ag-grid-community/src/styles/ag-grid.scss";
@import "../node_modules/ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine-mixin.scss";

.ag-theme-alpine {
  @include ag-theme-alpine((
    odd-row-background-color: #BFC8DC
  ));
}
</snippet>

<p>To avoid importing the stylesheets twice, remove the imports from <code>src/App.js</code>:</p>

<snippet language="diff">
import { AgGridReact } from 'ag-grid-react';
-import 'ag-grid-community/dist/styles/ag-grid.css';
-import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
</snippet>

<p>If everything is configured correctly, the second row of the grid will be blue. Congratulations!
  You now know now bend the grid look to your will - there are a few dozens more theme parameters variables that let you control the font family and size, border color,
  header background color and even the amount of spacing in the cells and columns. The <a href="https://www.ag-grid.com/javascript-grid-themes-provided/#customising-themes">full list of theme parameters</a> is available in the themes documentation section.</p>

<h2 id="compatibility">ag-Grid & React Compatibility Chart</h2>

<div>
    <table class="properties">
        <tr>
            <th>React Version</th>
            <th>ag-Grid Versions</th>
        </tr>
        <tr>
            <td>15.x</td>
            <td>18 - 21.2.0</td>
        </tr>
        <tr>
            <td>16.3+</td>
            <td>22+</td>
        </tr>
    </table>
</div>


  <h2 id="summary">Summary</h2>

  <p>With this tutorial, we managed to accomplish a lot. Starting from the humble beginnings of a three row / column setup, we now have a grid that supports sorting, filtering, binding to remote data, selection and even grouping!
  While doing so, we learned how to configure the grid, how to access its API object, and how to change the styling of the component.</p>

</div>

<style><?php include '../_assets/pages/copy-code.css'; ?></style>
<script src="../_assets/js/copy-code.js"></script>

<?php include '../documentation-main/documentation_footer.php'; ?>
