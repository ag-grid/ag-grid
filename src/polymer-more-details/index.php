<?php
$key = "More Detail Polymer";
$pageTitle = "polymer Grid";
$pageDescription = "ag-Grid can be used as a data grid inside your polymer application. This page details how to get started using ag-Grid inside an polymer application.";
$pageKeyboards = "polymer Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>
        <img src="../images/svg/docs/getting_started.svg" width="50"/>
        <img style="vertical-align: middle" src="/images/polymer-large.png" height="45px"/>
        Polymer Grid
    </h1>
    <h2>More Details</h2>

    <note>Full working examples of ag-Grid and Polymer can be found in <a href="https://github.com/ag-grid/ag-grid-polymer-example">Github</a>, illustrating
        (amongst others) Rich Grids, Filtering with Polymer Components, Master/Detail Grid and so on.</note>

    <h3>Downloading the ag-Grid Polymer Component</h3>

    <p>As will any Polymer project, you will need to include the Web Component polyfills as well as the Polymer library itself into your html file.</p>

    <p>Furthermore, using Polymer with ag-Grid introduces an additional dependency, so you need to include ag-grid-polymer, which includes the a-Grid Polymer support.</p>

    <p>The following dependencies are therefore required at a minimum, all to be installed with <a
                href="https://bower.io">Bower</a>:</p>

    <snippet>
bower install -save polymer

// or ag-grid-enterprise - see further below for more details on using the Enterprise Features
bower install -save ag-grid

bower install -save ag-grid-polymer</snippet>
    <p style="padding-top: 10px">You can then reference the dependency as follows in the top of your application html file:</p>

<snippet>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;!-- polymer polyfill - must be before any wc related javascript is executed --&gt;
    &lt;script src="bower_components/webcomponentsjs/webcomponents-loader.js"&gt;&lt;/script&gt;
    &lt;link rel="import" href="bower_components/polymer/polymer.html"&gt;&lt;/span&gt;
    
    &lt;!-- before the ag-grid web component --&gt;
    &lt;!-- either ag-grid or ag-grid-enterprise, depending on which you're using --&gt;
    &lt;!-- note: using noStyle version here as the you can't directly style anything in a shadow tree using a CSS rule
         outside of the shadow tree --&gt;
    &lt;script src="bower_components/ag-grid/dist/ag-grid.noStyle.js"&gt;&lt;/script&gt;
    
    &lt;!-- ag-grid-polymer element --&gt;
    &lt;link rel="import" href="bower_components/ag-grid-polymer/ag-grid-polymer.html"&gt;
    
    &lt;!-- your application code can now be imported --&gt;
    &lt;link rel="import" href="application.html"&gt;
&lt;/head&gt;</snippet>

    <p>
        You can now include <code>ag-grid-polymer</code> inside your template as follows:
    </p>

    <snippet>
&lt;ag-grid-polymer style="width: 500px; height: 120px;"
         class="ag-theme-fresh"
         rowData="{{rowData}}"
columnDefs="{{columnDefs}}"&gt;&lt;/ag-grid-polymer&gt;</snippet>

    <h3><img src="../images/enterprise_50.png" style="height: 22px;margin-right: 5px"/>Downloading the ag-Grid Polymer Enterprise Dependency</h3>

    <p>If you're using the ag-Grid Enterprise features, then in addition to the ag-Grid Polymer dependency above, you also require
    the ag-Grid Polymer Enterprise dependency:</p>

    <h3>Download ag-Grid-Enterprise</h3>

    <snippet>
bower install ag-grid-enterprise</snippet>

    <p>Note that this is instead of the <code>ag-grid</code> dependency - you need <span style="font-style: italic">either</span>
        <code>ag-grid</code>or <code>ag-grid-enterprise</code>, not both.</p>


    <p>As with the first section above, you need to reference the ag-grid Enterprise dependency:</p>

    <snippet>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;!-- polymer polyfill - must be before any wc related javascript is executed --&gt;
    &lt;script src="bower_components/webcomponentsjs/webcomponents-loader.js"&gt;&lt;/script&gt;
    &lt;link rel="import" href="bower_components/polymer/polymer.html"&gt;&lt;/span&gt;

        &lt;!-- before the ag-grid web component --&gt;
    &lt;!-- either ag-grid or ag-grid-enterprise, depending on which you're using --&gt;
    &lt;!-- note: using noStyle version here as the you can't directly style anything in a shadow tree using a CSS rule
         outside of the shadow tree --&gt;
    &lt;script src="bower_components/ag-grid-enterprise/dist/ag-grid-enterprise.noStyle.js"&gt;&lt;/script&gt;

    &lt;!-- ag-grid-polymer element --&gt;
    &lt;link rel="import" href="bower_components/ag-grid-polymer/ag-grid-polymer.html"&gt;

    &lt;!-- your application code can now be imported --&gt;
    &lt;link rel="import" href="application.html"&gt;
&lt;/head&gt;</snippet>

    <h2 id="ag-Grid-polymer-features">ag-Grid Polymer Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid Polymer Component. The Polymer Component wraps the
        functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        Polymer ag-Grid when it comes to features.
    </p>

    <h2 id="configuring-ag-grid-in-polymer">Configuring ag-Grid in Polymer</h2>

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
                 ...other properties&gt;&lt;/ag-grid-polymer&gt;</snippet>

    <p>Here we've specified 3 properties: <code>rowData</code> is provided with two-way binding. <code>enableSorting</code>
    and <code>enable-filtering</code> illustrate how you can specify properties in different cases.</p>

    <h3>Events</h3>

    <p>All data out of the grid comes through events. You can specify the events you want to listen to in the following ways:</p>

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
                 ...other properties&gt;&lt;/ag-grid-polymer&gt;</snippet>

    <p>Here we're listening to the <code>gridReady</code> event - as with most events we need to add the "on" prefix.</p>

    <note>When defining event listeners in this way it's important to note that the <code>this</code> context will be <code>ag-grid-polymer</code>,
    <span>not</span> the containing application element. You will have access to the grids properties directly, but not the application element itself.
    The <code>api</code> and <code>columnApi</code> are available directly via <code>this.api</code> and <code>this.columnApi</code>.</note>


    <h4>Events via the <code>gridOptions</code> property</h4>

<snippet>
// Grid Definition
&lt;ag-grid-polymer gridOptions="{{gridOptions}}"
                 ...other properties&gt;&lt;/ag-grid-polymer&gt;

// Application Code 
this.gridOptions.onColumnResized = (event) =&gt; {
    console.log('event via option 3: ' + event);
};</snippet>

    <h4>Events via Event Listeners on an instance of <code>ag-grid-polymer</code></h4>

<snippet>
// Grid Definition
&lt;ag-grid-polymer id="myGrid"
                 ...other properties&gt;&lt;/ag-grid-polymer&gt;

// Application Code 
this.$.myGrid.addEventListener('columnresized', (event) =&gt; {
    console.log('event via option 1: ' + event.agGridDetails);
})</snippet>

    <p>In this case we need to specify an id on the <code>ag-grid-polymer</code> component in order to access it.</p>
    <p>The grid's payload will be available on the events <code>agGridDetails</code> property.</p>

    <h4>Events via direct property access on an instance of <code>ag-grid-polymer</code></h4>

<snippet>
// Grid Definition
&lt;ag-grid-polymer id="myGrid"
                 ...other properties&gt;&lt;/ag-grid-polymer&gt;

// Application Code 
this.$.myGrid.oncolumnresized = (event) =&gt; {
    console.log('event via option 2: ' + event.agGridDetails);
}</snippet>

    <p>In this case we need to specify an id on the <code>ag-grid-polymer</code> component in order to access it.</p>
    <p>The grid's payload will be available on the events <code>agGridDetails</code> property.</p>


    <h3>Grid Api</h3>

    <p>The Grid API (both <code>api</code> and <code>columnApi</code>) will only be available after the <code>gridReady</code>
    event has been fired.</p>

    <p>You can access the APIs in the following ways</p>
    <ul>
        <li>Store them in the <code>gridReady</code> event - they'll be available via the params argument passed into the event</li>
        <li>Provide a <code>gridOptions</code> object to the grid pre-creation time. Post creation the APIs will be available on the
            <code>gridOptions</code> object.</li>
    </ul>

    <h3>Cell Editors, Cell Renderers, Filters etc</h3>

    <p>Please see the relevant sections on <a
                href="../javascript-grid-cell-rendering-components/#polymerCellRendering">cell renderer's</a>,
        <a href="../javascript-grid-cell-editing/#polymerCellEditing">cell editors</a> and
        <a href="../javascript-grid-filtering/#polymerFiltering">filters</a> for configuring and using Polymer
        Components in ag-Grid.</p>

    <h3 id="parent_child">Child to Parent Communication</h3>

    <p>There are a variety of ways to manage component communication in Polymer (shared service, local variables
        etc),
        but you
        often need a simple way to let a "parent" component know that something has happened on a "child"
        component. In
        this case
        the simplest route is to use the <code>gridOptions.context</code> to hold a reference to the parent,
        which the
        child can then access.</p>

    <snippet>
// in the parent component - the component that hosts ag-grid-polymer and specifies which polymer components to use in the grid
constructor() {
    this.gridOptions = &lt;GridOptions&gt;{
        context: {
            componentParent: this
        }
    };
}

// in the child component - the polymer components created dynamically in the grid
// the parent component can then be accessed as follows:
this.params.context.componentParent</snippet>

    <p>Note that although we've used <code>componentParent</code> as the property name here it can be anything -
        the
        main
        point is that you can use the <code>context</code> mechanism to share information between the
        components.</p>

    <p>The <a href="../example-polymer-dynamic#dynamic">Dynamic Components Example</a> illustrates this in the Child/Parent column</p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
