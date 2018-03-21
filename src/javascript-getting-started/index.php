<?php
$pageTitle = "ag-Grid Reference: Getting Started with the JavaScript Datagrid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This Getting Start guide covers installing our seed repo and getting up and running with a simple JavaScript Datagrid. We also cover basisc configuration.";
$pageKeyboards = "Javascript Grid";
$pageGroup = "basics";
include '../getting-started/header.php';
?>
<div>
<h1>Get Started with ag-Grid in Your Project</h1>

<p class="lead">The "ag" part of ag-Grid stands for "agnostic". The internal ag-Grid engine is implemented in plain JavaScript<sup id="a1"><a href="#f1">[1]</a></sup> and has zero dependencies. 
If your project does not use one of the JavaScript frameworks that ag-Grid supports, or you are curious to understand how the grid works in its pure form, this guide is for you!
</p> 

<p>In this article, we will walk you through the necessary steps to add ag-Grid to an existing React project, and configure some of the essential features of it. We will show you some of the fundamentals of the grid (passing properties, using the API, etc).</p>

<h2>The Project Setup</h2>

<p>During the last couple of years, we are witnessing a Cambrian Explosion of JavaScript project stacks. It seems like everyday there is a new, better way for JavaScript developers to build and distribute their apps. 
However,  for the purposes of this setup, we are going to stick to tried-and-true no-build, single HTML file setup which loads the ag-Grid scripts from CDN (our favorite one is <a href="https://unpkg.com/#/">unpkg</a>). Let's start from this clean html file:</p>

<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello from ag-grid!&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;
</snippet>

<div class="note">
You can either use your favorite programming text editor, or you can execute the steps in the tutorial using <a href="http://plnkr.co/edit/ZicWEPr1TP04bttMLkCr">this Plunker as a starting point</a>.
</div>

<h2>Add ag-Grid to Your Project</h2>

<p>We are going to load the necessary scripts and styles from the unpkg CDN. Add the following to the <code>head</code> element:</p>

<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;script src=&quot;https://unpkg.com/ag-grid/dist/ag-grid.min.noStyle.js&quot;&gt;&lt;/script&gt;
    &lt;link rel=&quot;stylesheet&quot; href=&quot;https://unpkg.com/ag-grid/dist/styles/ag-grid.css&quot;&gt;
    &lt;link rel=&quot;stylesheet&quot; href=&quot;https://unpkg.com/ag-grid/dist/styles/ag-theme-balham.css&quot;&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello from ag-grid!&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;
</snippet>

<p>The lines above import the <code>AgGrid</code> component, the grid "structure" stylesheet (<code>ag-grid.css</code>), and one of the available grid themes: (<code>ag-theme-balham.css</code>). 
The grid ships several different themes; pick one that matches your project design. </p>

<p>Now, let's instantiate a grid!</p>

<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;script src=&quot;https://unpkg.com/ag-grid/dist/ag-grid.min.noStyle.js&quot;&gt;&lt;/script&gt;
  &lt;link rel=&quot;stylesheet&quot; href=&quot;https://unpkg.com/ag-grid/dist/styles/ag-grid.css&quot;&gt;
  &lt;link rel=&quot;stylesheet&quot; href=&quot;https://unpkg.com/ag-grid/dist/styles/ag-theme-balham.css&quot;&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Hello from ag-grid!&lt;/h1&gt;
  
  &lt;div id=&quot;myGrid&quot; style=&quot;height: 600px;width:500px;&quot; class=&quot;ag-theme-balham&quot;&gt;&lt;/div&gt;

  &lt;script type=&quot;text/javascript&quot; charset=&quot;utf-8&quot;&gt;
    // specify the columns
    var columnDefs = [
      {headerName: &quot;Make&quot;, field: &quot;make&quot;},
      {headerName: &quot;Model&quot;, field: &quot;model&quot;},
      {headerName: &quot;Price&quot;, field: &quot;price&quot;}
    ];
    
    // specify the data
    var rowData = [
      {make: &quot;Toyota&quot;, model: &quot;Celica&quot;, price: 35000},
      {make: &quot;Ford&quot;, model: &quot;Mondeo&quot;, price: 32000},
      {make: &quot;Porsche&quot;, model: &quot;Boxter&quot;, price: 72000}
    ];
    
    // let the grid know which columns and what data to use
    var gridOptions = {
      columnDefs: columnDefs,
      rowData: rowData
    };

  // lookup the container we want the Grid to use
  var eGridDiv = document.querySelector('#myGrid');

  // create the grid passing in the div to use together with the columns &amp; data we want to use
  new agGrid.Grid(eGridDiv, gridOptions);

  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
</snippet>

<p>The variables above present two essential configuration properties of the grid - <strong>the column definitions</strong> (<code>columnDefs</code>) and the data (<code>rowData</code>). In our case, the column definitions contain three columns; 
each column entry specifies the header label and the data field to be displayed in the body of the table.</p> 

<p>The actual data is defined in the <code>rowData</code> as an array of objects. Notice that the fields of the objects match the <code>field</code> values in the <code>columnDefs</code> configuration object.</p> 

<p>Finally, the <code>DIV</code> element is the DOM entry point of the grid. It sets the grid dimensions and specifies the grid's theme by setting the <code>class</code> to <code>ag-theme-balham</code>. As you may have already noticed, the CSS class matches the name of CSS file we imported earlier.</p> 

<img class="img-fluid" src="../getting-started/step1.png" alt="ag-Grid in its simplest form" />

<h2>Enable Sorting And Filtering</h2>

<p>So far, so good. But wouldn't it be nice to be able to sort the data to help us see which car is the least/most expensive? 
Well, enabling sorting in ag-Grid is actually quite simple - all you need to do is add <code>enableSorting</code> to the <code>gridOptions</code>.</p> 

<snippet language="js">
    var gridOptions = {
      columnDefs: columnDefs,
      rowData: rowData,
      enableSorting: true
    };
</snippet>

<p>After adding the property, you should be able to sort the grid by clicking on the column headers. Clicking on a header toggles through ascending, descending and no-sort.</p>

<p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a real-world application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like this filtering is your friend.</p>

<p>As with sorting, enabling filtering is as easy as adding the <code>enableFilter</code> property:</p>

<snippet language="js">
    var gridOptions = {
      columnDefs: columnDefs,
      rowData: rowData,
      enableSorting: true,
      enableFilter: true
    };
</snippet>

<p>With this property set, the grid will display a small column menu icon when you hover the header. Pressing it will display a popup with filtering UI which lets you choose the kind of filter and the text that you want to filter by.</p>

<img class="img-fluid" src="../getting-started/step2.png" alt="ag-Grid sorting and filtering" />

<h2>Fetch Remote Data</h2>

<p>Displaying hard-coded data in JavaScript is not going to get us very far. In the real world, most of the time, we are dealing with data that resides on a remote server. Nowadays, implementing this is actually quite simple. 
Notice that the actual data fetching is performed outside of the grid component - We are using the HTML5 <code>fetch</code> API.</p>

<div class="note">If you have to support older browsers but you want to use fetch, you can add <a href="https://github.com/github/fetch">the respective polyfill</a>.</div>


<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;script src=&quot;https://unpkg.com/ag-grid/dist/ag-grid.min.noStyle.js&quot;&gt;&lt;/script&gt;
  &lt;link rel=&quot;stylesheet&quot; href=&quot;https://unpkg.com/ag-grid/dist/styles/ag-grid.css&quot;&gt;
  &lt;link rel=&quot;stylesheet&quot; href=&quot;https://unpkg.com/ag-grid/dist/styles/ag-theme-balham.css&quot;&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Hello from ag-grid!&lt;/h1&gt;
  
  &lt;div id=&quot;myGrid&quot; style=&quot;height: 600px;width:500px;&quot; class=&quot;ag-theme-balham&quot;&gt;&lt;/div&gt;

  &lt;script type=&quot;text/javascript&quot; charset=&quot;utf-8&quot;&gt;
    // specify the columns
    var columnDefs = [
      {headerName: &quot;Make&quot;, field: &quot;make&quot;},
      {headerName: &quot;Model&quot;, field: &quot;model&quot;},
      {headerName: &quot;Price&quot;, field: &quot;price&quot;}
    ];

    // let the grid know which columns and what data to use
    var gridOptions = {
      columnDefs: columnDefs,
      enableSorting: true,
      enableFilter: true
    };


  // lookup the container we want the Grid to use
  var eGridDiv = document.querySelector('#myGrid');

  // create the grid passing in the div to use together with the columns &amp; data we want to use
  new agGrid.Grid(eGridDiv, gridOptions);
  
  fetch('https://api.myjson.com/bins/15psn9').then(function(response) {
    return response.json();
  }).then(function(data) {
    gridOptions.api.setRowData(data);
  })

  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
</snippet>

<p>Here, we replaced the <code>rowData</code> assignment  with a data fetch from a remote service. The remote data is the same as the one we initially had, so you should not notice any actual changes to the grid.</p>

<p>Notice that we also did something new - we accessed the grid Api instance through the <code>gridOptions.api</code>. The api object exposes plethora of methods that allow us to implement complex scenarios with the grid.</p>
<h2>Enable Selection</h2> 

<p>Being a programmer is a hectic job. Just when we thought that we are done with our assignment, the manager shows up with a fresh set of requirements! 
It turned out that we need to allow the user to select certain rows from the grid and to mark them as flagged in the system. 
We will leave the flag toggle state and persistence to the backend team. On our side, we should enable the selection and, afterwards, to obtain the selected records and pass them with an API call to a remote service endpoint.</p> 

<p>Fortunately, the above task is quite simple with ag-Grid. As you may have already guessed, it is just a matter of adding and changing couple of properties:</p>

<snippet language="js">
    // specify the columns
    var columnDefs = [
      {headerName: "Make", field: "make", checkboxSelection: true },
      {headerName: "Model", field: "model"},
      {headerName: "Price", field: "price"}
    ];

    // let the grid know which columns and what data to use
    var gridOptions = {
      columnDefs: columnDefs,
      enableSorting: true,
      enableFilter: true,
      rowSelection: 'multiple'
    };
</snippet>

<p>Great! Now the first column contains a checkbox that, when clicked, selects the row. The only thing we have to add is a button that gets the selected data and sends it to the server. To do this, we need the following change:</p> 

<snippet language="html">
  &lt;button onclick=&quot;getSelectedRows()&quot;&gt;Get Selected Rows&lt;/button&gt;
  &lt;div id=&quot;myGrid&quot; style=&quot;height: 600px;width:500px;&quot; class=&quot;ag-theme-balham&quot;&gt;&lt;/div&gt;
</snippet>

<snippet language="js">
function getSelectedRows() {
    var selectedNodes = gridOptions.api.getSelectedNodes()  
    var selectedData = selectedNodes.map( function(node) { return node.data })
    var selectedDataStringPresentation = selectedData.map( function(node) { return node.make + ' ' + node.model }).join(', ')
    alert('Selected nodes: ' + selectedDataStringPresentation);
}
</snippet>

<p>Well, we cheated a bit. Calling <code>alert</code> is not exactly a call to our backend. 
Hopefully you will forgive us this shortcut for the sake of keeping the article short and simple. Of course, you can substitute that bit with a real-world application logic after you are done with the tutorial.</p> 

<p>What happened above? Several things:</p>

<ul>
<li>We added a button with an event handler;</li>
<li>Inside the event handler, we accessed the grid API to get the currently selected grid row nodes;</li>
<li>Afterwards, we extracted the row nodes' underlying data items and converted them to a string suitable to be presented to the user in an alert box.</li> 
</ul>

<h2>Grouping (enterprise)</h2>

<div class="note">Grouping is a feature exclusive to the enterprise version of ag-Grid.</div>

<p>In addition to filtering and sorting, grouping is another  effective way for the user to make sense out of large amounts of data. In our case, the data is not that much. Let's switch to a slightly larger data set:</p>

<snippet language="diff">
-        fetch('https://api.myjson.com/bins/15psn9')
+        fetch('https://api.myjson.com/bins/ly7d1')
</snippet>

<p>Now, let's use ag-grid-enterprise! Replace the ag-grid script reference in the <code>head</code> with this one:</p>

<snippet language="html">
&lt;script src=&quot;https://unpkg.com/ag-grid-enterprise/dist/ag-grid-enterprise.min.noStyle.js&quot;&gt;&lt;/script&gt;
</snippet>

<p>If everything is ok, you should see a message in the console that warns you about missing enterprise license. In addition to that, the grid got a few UI improvements - a custom context menu and fancier column menu popup - feel free to look around:</p>

<img class="img-fluid" src="../getting-started/step3.png" alt="ag-Grid final" />

<p>Now, let's enable grouping! Change the configuration to this:</p>

<snippet language="js">
var columnDefs = [
    {headerName: "Make", field: "make", rowGroupIndex: 0 },
    {headerName: "Price", field: "price"}
];

var autoGroupColumnDef = {
    headerName: "Model", 
    field: "model", 
    cellRenderer:'agGroupCellRenderer',
    cellRendererParams: {
        checkbox: true
    }
}

// let the grid know which columns and what data to use
var gridOptions = {
    columnDefs: columnDefs,
    enableSorting: true,
    enableFilter: true,
    autoGroupColumnDef: autoGroupColumnDef,
    groupSelectsChildren: true,
    rowSelection: 'multiple'
};
</snippet>

<p>There we go! The grid now groups the data by <code>make</code>, while listing the <code>model</code> field value when expanded. Notice that grouping works with checkboxes as well - the <code>groupSelectsChildren</code> property adds a group-level checkbox that selects/deselects all items in the group.</p>

<div class="note"> Don't worry if this step feels a bit overwhelming - the  grouping feature is very powerful and supports complex interaction scenarios which you might not need initially. The grouping documentation section contains plenty of real-world runnable examples that can get you started for your particular  case.</div>

<p>This is how the final code should look:</p>

<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;script src=&quot;https://unpkg.com/ag-grid-enterprise/dist/ag-grid-enterprise.min.noStyle.js&quot;&gt;&lt;/script&gt;
  &lt;link rel=&quot;stylesheet&quot; href=&quot;https://unpkg.com/ag-grid/dist/styles/ag-grid.css&quot;&gt;
  &lt;link rel=&quot;stylesheet&quot; href=&quot;https://unpkg.com/ag-grid/dist/styles/ag-theme-balham.css&quot;&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Hello from ag-grid!&lt;/h1&gt;
  &lt;button onclick=&quot;getSelectedRows()&quot;&gt;Get Selected Rows&lt;/button&gt;
  &lt;div id=&quot;myGrid&quot; style=&quot;height: 600px;width:500px;&quot; class=&quot;ag-theme-balham&quot;&gt;&lt;/div&gt;

  &lt;script type=&quot;text/javascript&quot; charset=&quot;utf-8&quot;&gt;
    // specify the columns
    var columnDefs = [
      {headerName: &quot;Make&quot;, field: &quot;make&quot;, rowGroupIndex: 0 },
      {headerName: &quot;Price&quot;, field: &quot;price&quot;}
    ];

    var autoGroupColumnDef = {
        headerName: &quot;Model&quot;, 
        field: &quot;model&quot;, 
        cellRenderer:'agGroupCellRenderer',
        cellRendererParams: {
            checkbox: true
        }
    }

    // let the grid know which columns and what data to use
    var gridOptions = {
      columnDefs: columnDefs,
      enableSorting: true,
      enableFilter: true,
      autoGroupColumnDef: autoGroupColumnDef,
      groupSelectsChildren: true,
      rowSelection: 'multiple'
    };

  // lookup the container we want the Grid to use
  var eGridDiv = document.querySelector('#myGrid');

  // create the grid passing in the div to use together with the columns &amp; data we want to use
  new agGrid.Grid(eGridDiv, gridOptions);
  
  fetch('https://api.myjson.com/bins/ly7d1').then(function(response) {
    return response.json();
  }).then(function(data) {
    gridOptions.api.setRowData(data);
  })
  
  function getSelectedRows() {
    const selectedNodes = gridOptions.api.getSelectedNodes()  
    const selectedData = selectedNodes.map( function(node) { return node.data })
    const selectedDataStringPresentation = selectedData.map( function(node) { return node.make + ' ' + node.model }).join(', ')
    alert('Selected nodes: ' + selectedDataStringPresentation);
  }
  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
</snippet>

<h2>Summary</h2> 

<p>With this tutorial, we managed to accomplish a lot. Starting from the humble beginnings of a three row / column setup, we now have a grid that supports sorting, filtering, binding to remote data, selection and even grouping! 
While doing so, we learned how to configure the grid and how how to use its api object to call methods.</p> 

<p>That's just scratching the surface, though. The grid has a lot more features to offer; the abilities to customize cells and headers with custom components allow for almost infinite possible configurations. </p>

<h2>Next Steps</h2> 

<p>The best thing you can check after the tutorial is the <a href="../javascript-grid-features/">features overview</a>. It provides an extensive review of what you can achieve with ag-Grid. In addition, you can go through the following help articles to learn more about the features we enabled:</p>

<ul>
    <li><a href="../javascript-grid-sorting/">Sorting</a></li>
    <li><a href="../javascript-grid-filtering/">Filtering</a></li>
    <li><a href="../javascript-grid-grouping/">Grouping</a></li>
    <li><a href="../javascript-grid-selection/">Selection</a></li>
</ul>

<p><b id="f1">1</b> This is not exactly true. ag-Grid's core, as well as the framework wrappers are written in TypeScript. This provides nice strong typing and compile-time checks for our TypeScript users, while not giving the Babel/Vanilla users any disadvantage.  <a href="#a1">↩</a></p>
</div>

<?php include '../getting-started/footer.php'; ?>
