<?php
$pageTitle = "ag-Grid: The Best VueJS Datagrid in the World";
$pageDescription = "A feature rich data grid designed for Enterprise applications. Easily integrate with Vue to deliver filtering, grouping, aggregation, pivoting and much more. Try our Community version now or take a free 2 month trial of Enterprise Version.";
$pageKeyboards = "VueJS Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1 id="implementing-the-vuejs-datagrid">
        ag-Grid VueJS Overview
    </h1>

    <p class="lead">
        This page details how to set up ag-Grid inside a VueJS application.
    </p>

    <h2 id="ag-grid-vuejs-features">ag-Grid VueJS Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid VueJS Component. The VueJS Component wraps
        the functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        VueJS ag-Grid when it comes to features.
    </p>

    <h2 id="configuring-ag-grid-in-vuejs">Configuring ag-Grid in VueJS</h2>

    <p>You can configure the grid in the following ways through VueJS:</p>
    <ul class="content">
        <li><b>Events:</b> All data out of the grid comes through events. These use
            VueJS event bindings eg <code>:modelUpdated="onModelUpdated"</code>.
            As you interact with the grid, the different events are fixed and
            output text to the console (open the dev tools to see the console).
        </li>
        <li><b>Properties:</b> All the data is provided to the grid as VueJS
            bindings. These are bound onto the ag-Grid properties bypassing the
            elements attributes. The values for the bindings come from the parent
            controller.
        </li>
        <li><b>Attributes:</b> When the property is just a simple string value, then
            no binding is necessary, just the value is placed as an attribute
            eg <code>rowHeight="22"</code>.If the attribute is a boolean and a value is not provided, it is taken as
            false.
        </li>
        <li><b>Changing Properties:</b> When a property changes value, VueJS
            automatically passes the new value onto the grid. This is used in
            the following locations in the "feature rich grid example' above:<br/>
            a) The 'quickFilter' on the top right updates the quick filter of
            the grid.
            b) The 'Show Tool Panel' checkbox has its value bound to the 'showToolPanel'
            property of the grid.
            c) The 'Refresh Data' generates new data for the grid and updates the
            <code>rowData</code> property.
        </li>
    </ul>

    <p>
        Notice that the grid has its properties marked as <b>immutable</b>. Hence for
        object properties, the object reference must change for the grid to take impact.
        For example, <code>rowData</code> must be a new list of data for the grid to be
        informed to redraw.
    </p>

    <h3 id="define_component">Defining VueJS Components for use in ag-Grid</h3>
    <p>VueJS components can be provided to ag-Grid in the following ways (the section after documents how to then
        reference
        these components in your column definitions):</p>

    <h4 id="simple-inline-components">Simple, Inline Components</h4>
    <snippet>
components: {
    'CubeComponent': {
        template: '&lt;span&gt;{{ valueCubed() }}&lt;/span&gt;',
        methods: {
            valueCubed() {
                return this.params.value * this.params.value * this.params.value;
            }
        }
    },
    ParamsComponent: {
        template: '&lt;span&gt;Field: {{params.colDef.field}}, Value: {{params.value}}&lt;/span&gt;',
        methods: {
            valueCubed() {
                return this.params.value * this.params.value * this.params.value;
            }
        }
    }
}</snippet>

    <p>Note here that we can define the property name either quoted or not - but note that in order to reference these
        components in your column definitions you'll need to provide them as case-sensitive strings (see referencing
        components below).</p>

    <h4 id="simple-locally-declared-components">Simple, Locally Declared Components</h4>
    <snippet>
let SquareComponent = Vue.extend({
    template: '&lt;span&gt;{{ valueSquared() }}&lt;/span&gt;',
    methods: {
        valueSquared() {
            return this.params.value * this.params.value;
        }
    }
});</snippet>

    <h4 id="external-js-components">External .js Components</h4>
    <snippet>
// SquareComponent.js
export default Vue.extend({
    template: '&lt;span&gt;{{ valueSquared() }}&lt;/span&gt;',
    methods: {
        valueSquared() {
            return this.params.value * this.params.value;
        }
    }
});

// MyGridApp.vue (your Component holding the ag-Grid component)
import SquareComponent from './SquareComponent'</snippet>

    <h4 id="more-complex-external-single-file-components">More Complex, External Single File Components (.vue)</h4>
    <snippet>
&lt;template&gt;
    &lt;span class="currency"&gt;<span ng-non-bindable>{{</span> params.value | currency('EUR') }}&lt;/span&gt;
&lt;/template&gt;

&lt;script&gt;
    import Vue from "vue";

    export default Vue.extend({
        filters: {
            currency(value, symbol) {
                let result = value;
                if (!isNaN(value)) {
                    result = value.toFixed(2);
                }
                return symbol ? symbol + result : result;
            }
        }
    });
&lt;/script&gt;

&lt;style scoped&gt;
    .currency {
        color: blue;
    }
&lt;/style&gt;</snippet>


    <p>You can then use these components as editors, renderers or filters. Which method you choose depends on preference
        as well as the complexity of your component - for simple components inline is easiest, for more complex ones
        external .vue components will be more manageable.</p>

    <p>Additionally, if you define your components as Single File Components (.vue) then you'll be able to leverage
        scoped CSS,
        which won't otherwise be possible.</p>

    <h3>Providing VueJS Components to ag-Grid</h3>

    <p>Having defined your component, you can then reference them in your column definitions.</p>

    <p>For inline components (ie defined in the <code>components</code> property) you can
        reference components by either case-sensitive property name, for example:</p>

    <snippet>
// defined as a quoted string above: 'CubeComponent'
{
    headerName: "Cube",
    field: "value",
    cellRendererFramework: 'CubeComponent',
    colId: "cube",
    width: 125
},
// defined as a value above: ParamsComponent
{
    headerName: "Row Params",
    field: "row",
    cellRendererFramework: 'ParamsComponent',
    colId: "params",
    width: 245
},</snippet>

    <p>In both cases we need to define the component to be used in the cell as a case-senstive string.</p>

    <p>For components defined outside of the application component you can pass them by reference. For example:</p>
    <snippet>
// import or create our component outside of our app
import CurrencyComponent from './CurrencyComponent.vue'
let SquareComponent = Vue.extend({...rest of the component

// reference the component by reference
this.columnDefs = [
    {headerName: "Row", field: "row", width: 140},
    {
        headerName: "Square",
        field: "value",
        cellRendererFramework: SquareComponent,
        editable: true,
        colId: "square",
        width: 125
    },
    {
        headerName: "Currency (Filter)",
        field: "currency",
        cellRendererFramework: CurrencyComponent,
        colId: "params",
        width: 150
    }</snippet>

    <p>Please see the relevant sections on <a
                href="../javascript-grid-cell-rendering-components/#vueCellRendering">cell renderers</a>,
        <a href="../javascript-grid-cell-editing/#vueCellEditing">cell editors</a> and
        <a href="../javascript-grid-filtering/#vueFiltering">filters</a> for configuring and using VueJS Components in
        ag-Grid.</p>

    <p>
        The rich-grid example has ag-Grid configured through the template in the following ways:
    </p>

    <snippet>
&lt;ag-grid-vue style="width: 100%; height: 350px;" class="ag-theme-balham"
    // these are attributes, not bound, give explicit values here
    rowHeight="22"
    rowSelection="multiple"

    // these are boolean values
    // (leaving them out will default them to false)
    :enableColResize="true"
    :enableSorting="true"

    // these are bound properties
    :gridOptions="gridOptions"
    :columnDefs="columnDefs"

    // this is a callback
    :isScrollLag="myIsScrollLagFunction"

    // these are registering event callbacks
    :modelUpdated="onModelUpdated"
    :cellClicked="onCellClicked"
&lt;/ag-grid-vue&gt;</snippet>

    <p>
        The above is all you need to get started using ag-Grid in a VueJS application. Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>

    <h2 id="ag-grid-vuejs-examples">ag-Grid VueJS Example</h2>
    <h3 id="example-rich-grid-without-components">Example: Rich Grid</h3>
    <p>
        The example below shows a rich configuration of ag-Grid, with a VueJS Header Group Component and custom
        Date Component Filter (under the DOB column).
    </p>

    <?= example('ag-Grid in VueJS', 'rich-grid', 'as-is', array("noPlunker" => 1, "skipDirs" => array("dist"))) ?>

</div>

<h2 id="parent_child">Child to Parent Communication</h2>

<p>There are a variety of ways to manage component communication in Angular (shared service, local variables etc), but
    you
    often need a simple way to let a "parent" component know that something has happened on a "child" component. In this
    case
    the simplest route is to use the <code>gridOptions.context</code> to hold a reference to the parent, which the child
    can then access.</p>

<snippet>
// in the parent component - the component that hosts ag-grid-angular and specifies which angular components to use in the grid
beforeMount() {
    this.gridOptions = {
        context: {
            componentParent: this
        }
    };
    this.createRowData();
    this.createColumnDefs();
},

// in the child component - the Vue components created dynamically in the grid
// the parent component can then be accessed as follows:
this.params.context.componentParent</snippet>

<p>Note that although we've used <code>componentParent</code> as the property name here it can be anything - the main
    point is that you can use the <code>context</code> mechanism to share information between the components.</p>

<p>The <span style="font-style: italic">"A Simple Example, using CellRenderers created from VueJS Components"</span>
    above illustrates this in the Child/Parent column:</p>
<ul class="content">
    <li>
        <a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/dynamic-component-example/DynamicComponentExample.vue"
           target="_blank" class="fa fa-external-link"> Parent & Child Component</a></li>
</ul>

<h3 id="router-link">Router Links in Grid Components</h3>
<p>You can provide <code>Vue Router</code> links within the Grid, but you need to ensure that you provide a Router to
    the
    Grid Component being created.</p>

<snippet>
// create a new VueRouter, or make the "root" Router available
import VueRouter from "vue-router";
const router = new VueRouter();

// pass a valid Router object to the Vue grid components to be used within the grid
components: {
    'ag-grid-vue': AgGridVue,
    'link-component': {
        router,
        template: '&lt;router-link to="/master-detail"&gt;Jump to Master/Detail&lt;/router-link&gt;'
    }
},

// You can now use Vue Router links within you Vue Components within the Grid
{
    headerName: "Link Example",
    cellRendererFramework: 'link-component',
    width: 200
}</snippet>

<h3 id="building-bundling">Building & Bundling</h3>
<p>There are many ways to build and/or bundle an VueJS Application. We provide fully working examples using a simplified
    Webpack build as part of the <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> on
    GitHub.</p>

<h2 id="cell-rendering-cell-editing-using-vuej">Cell Rendering & Cell Editing using VueJS</h2>

<p>
    It is possible to build
    <a href="../javascript-grid-cell-rendering-components/#vue2CellRendering">cell renderers</a>,
    <a href="../javascript-grid-cell-editing/#vue2CellEditing">cell editors</a> and
    <a href="../javascript-grid-filtering/#vue2Filtering">filters</a> using VueJS. Doing each of these
    is explained in the section on each.
</p>

<h2 id="next-steps">Next Steps...</h2>

<p>
    Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
    to learn about accessing all the features of the grid.
</p>


<?php include '../documentation-main/documentation_footer.php'; ?>
