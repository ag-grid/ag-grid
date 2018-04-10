<?php
$pageTitle = "ag-Grid Reference: Getting Started with Vue";
$pageDescription = "ag-Grid is a feature-rich Vue datagrid available in Free or Enterprise versions. This page details how to get started using ag-Grid inside an Vue application.";
$pageKeyboards = "Vue Grid";
$pageGroup = "basics";
include '../getting-started/header.php';
?>

<h1>Get Started with ag-Grid in Your Vue Project</h1>

<p class="lead">The "ag" part of ag-Grid stands for "agnostic". The internal ag-Grid engine is implemented in TypeScript with zero dependencies. 
ag-Grid supports Vue through a <strong>wrapper component</strong>. The wrapper lets you use ag-Grid in your application like any other Vue component &ndash; you pass configuration through property bindings and handle events through event bindings. 
You can even use Vue components to customize the grid UI and cell contents / behavior.</p> 

<p>In this article, we will walk you through the necessary steps to add ag-Grid to an existing Vue project, and configure some of the essential features of it. 
We will show you some of the fundamentals of the grid (passing properties, using the API, etc). As a bonus, we will also tweak the grid's visual appearance using Sass variables.</p>

<h2>Add ag-Grid to Your Project</h2>

<p>For the purposes of this tutorial, we are going to scaffold an Vue app with <a href="https://cli.angular.io/">angular CLI</a>. 
Don't worry if your project has a different configuration. Ag-Grid and its Vue wrapper are distributed as NPM packages, which should work with any common Vue project module bundler setup. 
Let's follow the <a href="https://github.com/angular/angular-cli#installation">Vue CLI instructions</a> - run the following in your terminal:</p>

<snippet language="sh">
npm install -g vue-cli
vue init webpack my-project    # see note below
cd my-project
npm run dev
</snippet>

<div class="note">You can accept the defaults for all prompts, with the exception of <code>vue-router</code>, <code>ESLint</code>, <code>unit tests</code> and <code>Nightwatch</code>. We won't be using these
in our example, so you can select "No" when prompted for any of the above.</div>

<p>If everything goes well, <code>npm run dev</code> has started the web server. You can open the default app at <a href="http://localhost:8080" target="_blank">localhost:8080</a>.</p>

<p>As a next step, let's add the ag-Grid NPM packages. run the following command in <code>my-project</code> (you may need a new instance of the terminal):</p>

<snippet language="sh">
npm install --save ag-grid ag-grid-vue
</snippet>

<p>After a few seconds of waiting, you should be good to go. Let's get to the actual coding! As a first step, let's add the ag-Grid the ag-Grid styles - import them in <code>src/main.js</code>:</p>

<snippet>
import "../node_modules/ag-grid/dist/styles/ag-grid.css";
import "../node_modules/ag-grid/dist/styles/ag-theme-balham.css";
</snippet>

<p>The code above imports the grid "structure" stylesheet (<code>ag-grid.css</code>), and one of the available grid themes: (<code>ag-theme-balham.css</code>). 
The grid ships several different themes; pick one that matches your project design.</p>

<div class="note">In a later section we documentation on how you can <a href="#vue_theme_look">Customise the Theme Look</a> using SCSS, which is our recommended approach.</div>

<p>As this will be a simple example we can delete the <code>src/components</code> directory. Our example application will live in <code>src/App.vue</code>.</p>

<p>Let's add the component definition to our template. Edit <code>app/App.vue</code> and replace the scaffold code:</p>

<snippet language="html">
&lt;template&gt;
    &lt;ag-grid-vue style="width: 500px; height: 500px;"
                 class="ag-theme-balham"
                 :gridOptions="gridOptions"
                 :columnDefs="columnDefs"
                 :rowData="rowData"&gt;
    &lt;/ag-grid-vue&gt;
&lt;/template&gt;
</snippet>

<p>Next, let's declare the basic grid configuration. Edit <code>src/App.vue</code>:</p>

<snippet>
&lt;script&gt;
    import {AgGridVue} from "ag-grid-vue";

    export default {
        name: 'App',
        data() {
            return {
                gridOptions: {},
                columnDefs: null,
                rowData: null
            }
        },
        components: {
            'ag-grid-vue': AgGridVue
        },
        beforeMount() {
            this.columnDefs = [
                {headerName: 'Make', field: 'make'},
                {headerName: 'Model', field: 'model'},
                {headerName: 'Price', field: 'price'}
            ];

            this.rowData = [
                {make: 'Toyota', model: 'Celica', price: 35000},
                {make: 'Ford', model: 'Mondeo', price: 32000},
                {make: 'Porsche', model: 'Boxter', price: 72000}
            ];
        }
    }
&lt;/script&gt;
</snippet>

<p>The code above presents two essential configuration properties of the grid - <strong>the column definitions</strong> (<code>columnDefs</code>) and the data (<code>rowData</code>). In our case, the column definitions contain three columns; 
each column entry specifies the header label and the data field to be displayed in the body of the table.</p> 

<p>This is the ag-grid component definition, with two property bindings - <code>rowData</code> and <code>columnDefs</code>. The component also accepts the standard DOM <code>style</code> and <code>class</code>. 
We have set the class to <code>ag-theme-balham</code>, which defines the grid theme. 
As you may have already noticed, the CSS class matches the name of CSS file we imported earlier.
</p>

<p>Finally, note that we've imported the <code>ag-grid-vue</code> component - this is actual component that will provide the ag-Grid functionality.</p>

<p>If everything works as expected, you should see a simple grid like the one on the screenshot:</p> 

<img class="img-fluid" src="../getting-started/step1.png" alt="ag-Grid hello world" />

<h2>Enable Sorting And Filtering</h2>

<p>So far, so good. But wouldn't it be nice to be able to sort the data to help us see which car is the least/most expensive? Well, enabling sorting in ag-Grid is actually quite simple - all you need to do is set the <code>enableSorting</code> property to the component.</p> 

<snippet language="html">
&lt;ag-grid-vue style="width: 500px; height: 500px;"
             class="ag-theme-balham"
             :gridOptions="gridOptions"
             :columnDefs="columnDefs"
             :rowData="rowData"

             :enableSorting="true"&gt;
&lt;/ag-grid-vue&gt;
</snippet>

<p>After adding the property, you should be able to sort the grid by clicking on the column headers. Clicking on a header toggles through ascending, descending and no-sort.</p>

<p>Our application doesn't have too many rows, so it's fairly easy to find data. But it's easy to imagine how a real-world application may have hundreds (or even hundreds of thousands!) or rows, with many columns. In a data set like this filtering is your friend.</p>

<p>As with sorting, enabling filtering is as easy as setting the <code>enableFilter</code> property:</p>

<snippet language="html">
&lt;ag-grid-vue style="width: 500px; height: 500px;"
             class="ag-theme-balham"
             :gridOptions="gridOptions"
             :columnDefs="columnDefs"
             :rowData="rowData"

             :enableSorting="true"
             :enableFilter="true"&gt;
&lt;/ag-grid-vue&gt;
</snippet>

<p>With this property set, the grid will display a small column menu icon when you hover the header. Pressing it will display a popup with filtering UI which lets you choose the kind of filter and the text that you want to filter by.</p>

<img class="img-fluid" src="../getting-started/step2.png" alt="ag-Grid sorting and filtering" />

<h2>Fetch Remote Data</h2>

<h2>Fetch Remote Data</h2>

<p>Displaying hard-coded data in JavaScript is not going to get us very far. In the real world, most of the time, we are dealing with data that resides on a remote server. Thanks to React, implementing this is actually quite simple.
    Notice that the actual data fetching is performed outside of the grid component - We are using the HTML5 <code>fetch</code> API.</p>

<p>Now, let's remove the hard-coded data and fetch one from a remote server. Edit the <code>src/App.vue</code> and add the following fetch statement: </p>

<snippet>
beforeMount() {
    this.columnDefs = [
        {headerName: 'Make', field: 'make'},
        {headerName: 'Model', field: 'model'},
        {headerName: 'Price', field: 'price'}
    ];

    fetch('https://api.myjson.com/bins/15psn9')
        .then(result =&gt; result.json())
        .then(rowData =&gt; this.rowData = rowData);
}
</snippet>

<p>The remote data is the same as the one we initially had, so you should not notice any actual changes to the grid. However, you will see an additional HTTP request performed if you open your developer tools.</p>


<h2>Enable Selection</h2> 

<p>Being a programmer is a hectic job. Just when we thought that we are done with our assignment, the manager shows up with a fresh set of requirements! 
It turned out that we need to allow the user to select certain rows from the grid and to mark them as flagged in the system. 
We will leave the flag toggle state and persistence to the backend team. On our side, we should enable the selection and, afterwards, to obtain the selected records and pass them with an API call to a remote service endpoint.</p> 

<p>Fortunately, the above task is quite simple with ag-Grid. As you may have already guessed, it is just a matter of adding and changing couple of properties.</p>

<snippet language="html">
&lt;template&gt;
    &lt;ag-grid-vue style="width: 500px; height: 500px;"
                 class="ag-theme-balham"
                 :gridOptions="gridOptions"
                 :columnDefs="columnDefs"
                 :rowData="rowData"
                 :enableSorting="true"
                 :enableFilter="true"
                 rowSelection="multiple"&gt;
    &lt;/ag-grid-vue&gt;
&lt;/template&gt;

&lt;script&gt;
    import {AgGridVue} from "ag-grid-vue";

    export default {
        name: 'App',
        data() {
            return {
                gridOptions: {},
                columnDefs: null,
                rowData: null
            }
        },
        components: {
            'ag-grid-vue': AgGridVue
        },
        beforeMount() {
            this.columnDefs = [
                {headerName: 'Make', field: 'make', checkboxSelection: true},
                {headerName: 'Model', field: 'model'},
                {headerName: 'Price', field: 'price'}
            ];

            fetch('https://api.myjson.com/bins/15psn9')
                .then(result =&gt; result.json())
                .then(rowData =&gt; this.rowData = rowData);
        }
    }
&lt;/script&gt;

&lt;style&gt;
&lt;/style&gt;
</snippet>

<p>Next, let's enable multiple row selection, so that the user can pick many rows:</p>

<snippet language="html">
&lt;ag-grid-vue style="width: 500px; height: 500px;"
             class="ag-theme-balham"
             :gridOptions="gridOptions"
             :columnDefs="columnDefs"
             :rowData="rowData"

             :enableSorting="true"
             :enableFilter="true"
             rowSelection="multiple"&gt;
&lt;/ag-grid-vue&gt;
</snippet>

<p>We've added a checkbox to the <code>make</code> column with <code>checkboxSelection: true</code> and then enabled multiple row selection with <code>rowSelection="multiple"</code>.</p>

<div class="note">We took a bit of a shortcut here, by not binding the property value. Without <code>[]</code>, the assignment will pass the attribute value as a string, which is fine for our purposes.</div>

<p>Great! Now the first column contains a checkbox that, when clicked, selects the row. The only thing we have to add is a button that gets the selected data and sends it to the server. To do this, we are
    going to use the ag-Grid API - we will store a reference to both the grid and column API's in the <code>gridReady</code> event</p>

<p>To test this we'll add a button that gets the selected data and sends it to the server. Let's go ahead and make these changes:</p>

<snippet language="html">
&lt;template&gt;
    &lt;div&gt;
        &lt;button @click="getSelectedRows()"&lt;Get Selected Rows&lt;/button&gt;

        &lt;ag-grid-vue style="width: 500px; height: 500px;"
                     class="ag-theme-balham"
                     :gridOptions="gridOptions"
                     :columnDefs="columnDefs"
                     :rowData="rowData"
                     :enableSorting="true"
                     :enableFilter="true"
                     rowSelection="multiple"

                     :gridReady="onGridReady"&gt;
        &lt;/ag-grid-vue&gt;
    &lt;/div&gt;
&lt;/template&gt;

&lt;script&gt;
    import {AgGridVue} from "ag-grid-vue";

    export default {
        name: 'App',
        data() {
            return {
                gridOptions: {},
                columnDefs: null,
                rowData: null
            }
        },
        components: {
            'ag-grid-vue': AgGridVue
        },
        methods: {
            onGridReady(params) {
                this.gridApi = params.api;
                this.columnApi = params.columnApi;
            },
            getSelectedRows() {
                const selectedNodes = this.gridApi.getSelectedNodes();
                const selectedData = selectedNodes.map( node =&gt; node.data );
                const selectedDataStringPresentation = selectedData.map( node =&gt; node.make + ' ' + node.model).join(', ');
                alert(`Selected nodes: ${selectedDataStringPresentation}`);
            }
        },
        beforeMount() {
            this.columnDefs = [
                {headerName: 'Make', field: 'make', checkboxSelection: true},
                {headerName: 'Model', field: 'model'},
                {headerName: 'Price', field: 'price'}
            ];

            fetch('https://api.myjson.com/bins/15psn9')
                .then(result =&gt; result.json())
                .then(rowData =&gt; this.rowData = rowData);
        }
    }
&lt;/script&gt;

&lt;style&gt;
&lt;/style&gt;
</snippet>

<p>Well, we cheated a bit. Calling <code>alert</code> is not exactly a call to our backend.
Hopefully you will forgive us this shortcut for the sake of keeping the article short and simple. Of course, you can substitute that bit with a real-world application logic after you are done with the tutorial.</p> 

<h2>Grouping (enterprise)</h2>

<div class="note">Grouping is a feature exclusive to the enterprise version of ag-Grid.</div>

<p>In addition to filtering and sorting, grouping is another  effective way for the user to make sense out of large amounts of data. In our case, the data is not that much. Let's switch to a slightly larger data set:</p>

<snippet language="diff">
beforeMount() {
    this.columnDefs = [
        {headerName: 'Make', field: 'make', checkboxSelection: true},
        {headerName: 'Model', field: 'model'},
        {headerName: 'Price', field: 'price'}
    ];

-    fetch('https://api.myjson.com/bins/15psn9')
-        .then(result => result.json())
-        .then(rowData => this.rowData = rowData);
+    fetch('https://api.myjson.com/bins/ly7d1')
+        .then(result => result.json())
+        .then(rowData => this.rowData = rowData);
}
</snippet>

<p>Afterwards, let's enable the enterprise features of ag-grid. Install the additional package:</p>

<snippet language="sh">
npm install --save ag-grid-enterprise
</snippet>

<p>Then, add the import to <code>src/main.ts</code>:</p>

<snippet language="diff">
import Vue from 'vue'

import "../node_modules/ag-grid/dist/styles/ag-grid.css";
import "../node_modules/ag-grid/dist/styles/ag-theme-balham.css";

+import 'ag-grid-enterprise';

import App from './App'
</snippet>

<p>If everything is ok, you should see a message in the console that warns you about missing enterprise license. In addition to that, the grid got a few UI improvements - a custom context menu and fancier column menu popup - feel free to look around:</p>

<img class="img-fluid" src="../getting-started/step3.png" alt="ag-Grid final" />

<p>Now, let's enable grouping! Add an <code>autoGroupColumnDef</code> property, bind to it, and update the <code>columnDefs</code> with a <code>rowGroupIndex</code>:</p>

<snippet language="html">
&lt;template&gt;
    &lt;div&gt;
        &lt;button @click="getSelectedRows()"&gt;Get Selected Rows&lt;/button&gt;
        &lt;ag-grid-vue style="width: 500px; height: 500px;"
                     class="ag-theme-balham"
                     :gridOptions="gridOptions"
                     :columnDefs="columnDefs"
                     :rowData="rowData"
                     :enableSorting="true"
                     :enableFilter="true"
                     rowSelection="multiple"

                     :gridReady="onGridReady"&gt;
        &lt;/ag-grid-vue&gt;
    &lt;/div&gt;
&lt;/template&gt;

&lt;script&gt;
    import {AgGridVue} from "ag-grid-vue";

    export default {
        name: 'App',
        data() {
            return {
                gridOptions: {},
                columnDefs: null,
                rowData: null,
                gridApi: null,
                columnApi: null,
                autoGroupColumnDef: null
            }
        },
        components: {
            'ag-grid-vue': AgGridVue
        },
        methods: {
            onGridReady(params) {
                this.gridApi = params.api;
                this.columnApi = params.columnApi;
            },
            getSelectedRows() {
                const selectedNodes = this.gridApi.getSelectedNodes();
                const selectedData = selectedNodes.map(node =&gt; node.data);
                const selectedDataStringPresentation = selectedData.map(node =&gt; node.make + ' ' + node.model).join(', ');
                alert(`Selected nodes: ${selectedDataStringPresentation}`);
            }
        },
        beforeMount() {
            this.columnDefs = [
                {headerName: 'Make', field: 'make', rowGroupIndex: 0},
                {headerName: 'Model', field: 'model'},
                {headerName: 'Price', field: 'price'}
            ];

            this.autoGroupColumnDef = {
                headerName: 'Model',
                field: 'model',
                cellRenderer: 'agGroupCellRenderer',
                cellRendererParams: {
                    checkbox: true
                }
            };

            fetch('https://api.myjson.com/bins/15psn9')
                .then(result =&gt; result.json())
                .then(rowData =&gt; this.rowData = rowData);
        }
    }
&lt;/script&gt;

&lt;style&gt;
&lt;/style&gt;
</snippet>

<p>There we go! The grid now groups the data by <code>make</code>, while listing the <code>model</code> field value when expanded.
Notice that grouping works with checkboxes as well - the <code>groupSelectsChildren</code> property adds a group-level checkbox that selects/deselects all items in the group.</p>

<div class="note"> Don't worry if this step feels a bit overwhelming - the  grouping feature is very powerful and supports complex interaction scenarios which you might not need initially. 
The grouping documentation section contains plenty of real-world runnable examples that can get you started for your particular  case.</div>

<h2 id="vue_theme_look">Customize the Theme Look</h2>

<p>The last thing which we are going to do is to change the grid look and feel by modifying some of the theme's Sass variables.</p> 

<p>By default, ag-Grid ships a set of pre-built theme stylesheets. If we want to tweak the colors and the fonts of theme, we should add a Sass preprocessor to our project, 
override the theme variable values, and refer the ag-grid Sass files instead of the pre-built stylesheets so that the variable overrides are applied.</p>

<p>The <code>vue cli</code> did a lot of for us (<code>vue init webpack my-project</code>), including providing support for Sass. Let's switch to using the provided ag-Grid SCSS files - first, let's create a new
file: <code>src/styles.scss</code>:</p>

<snippet language="scss">
$ag-icons-path: "../node_modules/ag-grid/src/styles/icons/";

@import "~ag-grid/src/styles/ag-grid.scss";
@import "~ag-grid/src/styles/ag-theme-balham.scss";
</snippet>

<p>Notice that we had to aid the Sass preprocessor a bit by setting the <code>$ag-icons-path</code> variable. This is a common gotcha with Sass, as external image paths are considered relative to the main file. 
In fact, by specifying the icons path, we also made our first theme override! We might change the entire theme icon set by changing the path in the variable to a directory containing our icon set.</p> 

<p>Let's do something simpler, though. We can override the alternating row background color to grayish blue. Add the following line:</p>

<snippet language="diff">
 $ag-icons-path: "../node_modules/ag-grid/src/styles/icons/";
+$odd-row-background-color: #CFD8DC;
</snippet>

<p>We now need to reference this new file in <code>src/main.js</code>:</p>

<snippet language="diff">
-import "../node_modules/ag-grid/dist/styles/ag-grid.css";
-import "../node_modules/ag-grid/dist/styles/ag-theme-balham.css";

+import './styles.scss';
</snippet>

<p>If everything is configured correctly, the second row of the grid will get slightly darker. Congratulations! 
You now know now bend the grid look to your will - there are a few dozens more Sass variables that let you control the font family and size, border color, 
header background color and even the amount of spacing in the cells and columns. The full Sass variable list is available in the themes documentation section.</p> 

<h2>Summary</h2> 

<p>With this tutorial, we managed to accomplish a lot. Starting from the humble beginnings of a three row / column setup, we now have a grid that supports sorting, filtering, binding to remote data, selection and even grouping! 
While doing so, we learned how to configure the grid, how to access its API object, and how to change the styling of the component.</p> 

<p>That's just scratching the surface, though. The grid has a lot more features to offer; the abilities to customize cells and headers with custom components allow for almost infinite possible configurations. </p>

<h2>Next Steps</h2> 

<p>You are hungry for more? Head over to the <a href="../best-vuejs-data-grid/">Vue guides section</a> for more in-depth information about the angular flavor of ag-Grid.  To learn more about the features used in this tutorial, you can go through the following help articles:</p>

<ul>
    <li><a href="../javascript-grid-sorting/">Sorting</a></li>
    <li><a href="../javascript-grid-filtering/">Filtering</a></li>
    <li><a href="../javascript-grid-grouping/">Grouping</a></li>
    <li><a href="../javascript-grid-selection/">Selection</a></li>
    <li><a href="../javascript-grid-styling/#customizing-sass-variables">Customizing themes with Sass</a></li>
</ul>



<?php include '../getting-started/footer.php'; ?>
