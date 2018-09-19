<?php
$pageTitle = "ag-Grid Reference: Polymer Datagrid - More Details";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page covers setting up the ag-Grid Polymer Component, ag-Grid Polymer dependency and getting through some of the fundamental setup.";
$pageKeyboards = "Polymer Grid";
$pageGroup = "basics";
include '../getting-started/header.php';
?>

    <h1 class="heading-enterprise heading-polymer">Polymer 3 Grid</h1>

    <h2>More Details</h2>

<note>A full working example of using ag-Grid with Polymer 3 can be found in our <a
            href="https://github.com/ag-grid/ag-grid-polymer-example">ag-Grid Polymer 3 Example Repo</a>.
</note>

    <h3 class="heading-enterprise">Downloading the ag-Grid Enterprise Dependency</h3>

    <p>If you're using the ag-Grid Enterprise features, then in addition to the ag-Grid Polymer dependency above, you also require
    the ag-Grid Polymer Enterprise dependency:</p>

    <snippet language="sh">
npm install ag-grid-enterprise --save</snippet>

    <p>Note that this is in addition to the <code>ag-grid-community</code> dependency. The <code>ag-grid-community</code>
    dependency will be required for the CSS styles.</p>

    <p>Using our application from the <a href="../polymer-getting-started">Polymer Getting Started</a> section as a
    starting point, we'll replace the <code>ag-grid-community</code> reference with the <code>ag-grid-enterprise</code> dependency:</p>

<snippet language="diff">
- &lt;script src="/node_modules/ag-grid-community/dist/ag-grid-community.min.noStyle.js"&gt;&lt;/script&gt;
+ &lt;script src="/node_modules/ag-grid-enterprise/dist/ag-grid-enterprise.min.noStyle.js"&gt;&lt;/script&gt;
</snippet>

    <p>Although we've removed the reference to <code>ag-grid-community</code> here, we'll still reference the styles within
    it when defining the ag-Grid element later.</p>

    <h2 id="ag-Grid-polymer-features">ag-Grid Polymer Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid Polymer Component. The Polymer Component wraps the
        functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        Polymer ag-Grid when it comes to features.
    </p>

    <h2 id="configuring-ag-grid-in-polymer">Configuring ag-Grid in Polymer</h2>

    <h3>Properties</h3>

    <p>Properties on <code>ag-grid-polymer</code> can be provided in the following three ways:</p>

    <ul class="content">
        <li>LowerCase: ie: <code>enablesorting</code></li>
        <li>CamelCase: ie: <code>enableSorting</code></li>
        <li>Hyphenated Lowercase: ie: <code>enable-sorting</code></li>
    </ul>

    <p>You can specify the properties in the following ways:</p>

    <ul class="content">
        <li>On the <code>ag-grid-polymer</code>component at declaration time</li>
        <li>On the <code>gridOptions</code> property</li>
    </ul>

    <h4>Properties on <code>ag-grid-polymer</code></h4>

    <snippet language="html">
&lt;!-- Grid Definition -->
&lt;ag-grid-polymer rowData="{{rowData}}"
                 enableSorting
                 enable-filtering
                 &gt;&lt;/ag-grid-polymer&gt;</snippet>

    <p>Here we've specified 3 properties: <code>rowData</code> is provided with two-way binding. <code>enableSorting</code>
    and <code>enable-filtering</code> illustrate how you can specify properties in different cases.</p>

    <h3>Events</h3>

    <p>All data out of the grid comes through events. You can specify the events you want to listen to in the following ways:</p>

    <ul class="content">
        <li>On the <code>ag-grid-polymer</code>component at declaration time</li>
        <li>On the <code>gridOptions</code> property</li>
        <li>On the <code>ag-grid-polymer</code>component post creation time, via event listeners</li>
        <li>On the <code>ag-grid-polymer</code>component post creation time, via direct property access</li>
    </ul>

    <h4>Events on <code>ag-grid-polymer</code></h4>

    <snippet language="html">
&lt;!-- Grid Definition -->
&lt;ag-grid-polymer onGridReady="{{onGridReady}}"
                 ...other properties&gt;&lt;/ag-grid-polymer&gt;</snippet>

    <p>Here we're listening to the <code>gridReady</code> event - as with most events we need to add the "on" prefix.</p>

    <note>When defining event listeners in this way it's important to note that the <code>this</code> context will be <code>ag-grid-polymer</code>,
    <span>not</span> the containing application element. You will have access to the grids properties directly, but not the application element itself.
    The <code>api</code> and <code>columnApi</code> are available directly via <code>this.api</code> and <code>this.columnApi</code>.</note>


    <h4>Events via the <code>gridOptions</code> property</h4>

<snippet language="html">
&lt;!-- Grid Definition -->
&lt;ag-grid-polymer gridOptions="{{gridOptions}}"
                 ...other properties&gt;&lt;/ag-grid-polymer&gt;
</snippet>

<snippet>
this.gridOptions.onColumnResized = (event) =&gt; {
    console.log('event via option 3: ' + event);
};</snippet>

    <h4>Events via Event Listeners on an instance of <code>ag-grid-polymer</code></h4>

<snippet language="html">
&lt;ag-grid-polymer id="myGrid"
                 ...other properties&gt;&lt;/ag-grid-polymer&gt;

</snippet>

<snippet>
this.$.myGrid.addEventListener('columnresized', (event) =&gt; {
    console.log('event via option 1: ' + event.agGridDetails);
})</snippet>

    <p>In this case we need to specify an id on the <code>ag-grid-polymer</code> component in order to access it.</p>
    <p>The grid's payload will be available on the events <code>agGridDetails</code> property.</p>

    <h4>Events via direct property access on an instance of <code>ag-grid-polymer</code></h4>

<snippet language="html">
&lt;ag-grid-polymer id="myGrid"
                 ...other properties&gt;&lt;/ag-grid-polymer&gt;

</snippet>
<snippet>
this.$.myGrid.oncolumnresized = (event) =&gt; {
    console.log('event via option 2: ' + event.agGridDetails);
}</snippet>

    <p>In this case we need to specify an id on the <code>ag-grid-polymer</code> component in order to access it.</p>
    <p>The grid's payload will be available on the events <code>agGridDetails</code> property.</p>


    <h3>Grid Api</h3>

    <p>The Grid API (both <code>api</code> and <code>columnApi</code>) will only be available after the <code>gridReady</code>
    event has been fired.</p>

    <p>You can access the APIs in the following ways:</p>

    <ul class="content">
        <li>Store them in the <code>gridReady</code> event - they'll be available via the params argument passed into the event</li>
        <li>Provide a <code>gridOptions</code> object to the grid pre-creation time. Post creation the APIs will be available on the
            <code>gridOptions</code> object.</li>
    </ul>

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

<?php include '../documentation-main/documentation_footer.php'; ?>
