<?php
$pageTitle = "VueJS Datagrid | Packed with features and performance";
$pageDescription = "Worlds leading, feature rich Vue Grid. Designed to integrate seamlessly with Vue to deliver filtering, grouping, aggregation, pivoting and much more with the performance that you expect. Version 19 is out now.";
$pageKeyboards = "VueJS Grid, Vue Grid, Vue Table";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1 id="implementing-the-vuejs-datagrid">
    Vue Grid | ag-Grid
    </h1>

    <h2 class="overview">Overview</h2>
    <p class="lead">
        ag-Grid is designed to integrate deeply into React.<br>
        Use our grid as a React component to quickly add a react grid table to your application.<br>
        Discover key benefits and resources available to quickly add a data grid or React datatable to your React application.</p>

    <p class="lead">
        This page details how to set up ag-Grid inside a Vue application.
    </p>

    <h2 id="ag-grid-vuejs-features">ag-Grid VueJS Features</h2>

    <p>
        <a href="https://www.ag-grid.com/features-overview/">Every feature</a> of ag-Grid is available when using the
        ag-Grid Vue table Component. The Vue Table Grid Component wraps the functionality of ag-Grid, it doesn't
        duplicate, so there will be no difference between core ag-Grid and Vue ag-Grid when it comes to features.
    </p>

    <h2 id="configuring-ag-grid-in-vuejs">Configuring ag-Grid in Vue</h2>

    <p>You can configure the grid in the following ways through VueJS:</p>
    <ul class="content">
        <li><b>Events:</b> All data out of the grid comes through events. These use
            VueJS event bindings eg <code>@modelUpdated="onModelUpdated"</code>.
            As you interact with the grid, the different events are fixed and
            output text to the console (open the dev tools to see the console).
        </li>
        <li><b>Properties:</b> All the data is provided to the grid as VueJS
            bindings. These are bound onto the ag-Grid properties bypassing the
            elements attributes. The values for the bindings come from the parent
            controller. eg <code>:rowData="rowData"</code>
            <div class="">

            </div>
        </li>
        <li><b>Attributes:</b> When the property is just a simple string value, then
            no binding is necessary, just the value is placed as an attribute
            eg <code>rowHeight="22"</code>. If the attribute is a boolean and a value is not provided, it is taken as
            true.
        </li>
        <li><b>Changing Properties:</b> When a property changes value, VueJS
            automatically passes the new value onto the grid.<br/>This is used in
            the following locations in the <a href="../best-vuejs-grid#example-rich-grid">Feature Rich Vue Example:</a>
            <ul>
                <li type="a">The 'quickFilter' on the top right updates the quick filter of the grid.</li>
                <li type="a">The 'Show Tool Panel' checkbox has its value bound to the 'showToolPanel' property of the
                    grid.
                </li>
                <li type="a">The 'Refresh Data' generates new data for the grid and updates the <code>rowData</code>
                    property.
                </li>
            </ul>
        </li>
    </ul>

    <p>
        Notice that the Vuejs table grid has its properties marked as <b>immutable</b>. Hence for
        object properties, the object reference must change for the grid to take impact.
        For example, <code>rowData</code> must be a new list of data for the grid to be
        informed to redraw.
    </p>

    <h3 id="define_component">Defining VueJS Components for use in ag-Grid</h3>

    <p>VueJS components can be defined as either simple inline components, or as full/complex externalised ones (i.e in
        a separate file).</p>

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

    <p>Note here that we can define the property name either quoted or not but note that in order to reference these
        components in your column definitions you'll need to provide them as <strong>case-sensitive</strong> strings.
    </p>

    <h4 id="simple-locally-declared-components">Simple, Locally Declared Components</h4>
    <snippet>
let SquareComponent = {
    template: '&lt;span&gt;{{ valueSquared() }}&lt;/span&gt;',
    methods: {
        valueSquared() {
            return this.params.value * this.params.value;
        }
    }
};</snippet>

    <h4 id="external-js-components">External .js Components</h4>
    <snippet>
// SquareComponent.js
export default {
    template: '&lt;span&gt;{{ valueSquared() }}&lt;/span&gt;',
    methods: {
        valueSquared() {
            return this.params.value * this.params.value;
        }
    }
};

// MyGridApp.vue (your Component holding the ag-Grid component)
import SquareComponent from './SquareComponent'</snippet>

    <h4 id="more-complex-external-single-file-components">More Complex, Externalised Single File Components (.vue)</h4>
    <snippet>
&lt;template&gt;
    &lt;span class="currency"&gt;<span ng-non-bindable>{{</span> params.value | currency('EUR') }}&lt;/span&gt;
&lt;/template&gt;

&lt;script&gt;
    export default {
        filters: {
            currency(value, symbol) {
                let result = value;
                if (!isNaN(value)) {
                    result = value.toFixed(2);
                }
                return symbol ? symbol + result : result;
            }
        }
    };
&lt;/script&gt;

&lt;style scoped&gt;
    .currency {
        color: blue;
    }
&lt;/style&gt;</snippet>

    <p>For non-inline components you need to provide them to Vue via the <code>components</code> property:</p>
    <snippet>
components: {
    AgGridVue,
    SquareComponent
}
</snippet>

    <p>Note that in this case the component name will match the actual reference, but you can specify a different one if
        you choose:</p>
    <snippet>
components: {
    AgGridVue,
    'MySquareComponent': SquareComponent
}
</snippet>

    <p>In either case the name you use will be used to reference the component within the grid (see below).</p>

    <h3 id="reference_component">Referencing VueJS Components for use in ag-Grid</h3>

    <p>Having defined your component, you can now reference them in your column definitions.</p>

    <p>To use a component within the grid you will reference components by <strong>case-sensitive </strong> name, for
        example:</p>

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
    animateRows             // same as :animateRows="true"
    :pagination="true"

    // these are bound properties
    :gridOptions="gridOptions"
    :columnDefs="columnDefs"

    // this is a callback
    :isScrollLag="myIsScrollLagFunction"

    // these are registering events
    @modelUpdated="onModelUpdated"
    @cellClicked="onCellClicked"
&lt;/ag-grid-vue&gt;</snippet>

    <p>
        The above is all you need to get started using ag-Grid in a VueJS application. Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>
</div>

<h2 id="declarative_definition">Using Markup to Define Grid Definitions</h2>
<p>You can also define your grid column definition decoratively if you would prefer.</p>

<p>You declare the grid as normal:</p>

<snippet lang="html">
&lt;ag-grid-vue
        class="ag-theme-balham"
        style="width: 700px; height: 400px;"
        :rowData="rowData"
        ...rest of definition
</snippet>

<p>And within this component you can then define your column definitions:</p>

<snippet lang="html">
&lt;ag-grid-vue
    ...rest of definition
&gt;
    &lt;ag-grid-column headerName="IT Skills"&gt;
        &lt;ag-grid-column field="skills" :width="120" suppressSorting
                        cellRendererFramework="SkillsCellRenderer"
                        :menuTabs="['filterMenuTab']"&gt;
        &lt;/ag-grid-column&gt;
        &lt;ag-grid-column field="proficiency" :width="135"
                        cellRendererFramework="ProficiencyCellRenderer"
                        :menuTabs="['filterMenuTab']""&gt;
        &lt;/ag-grid-column&gt;
    &lt;/ag-grid-column&gt;
&lt;/ag-grid-vue&gt;
</snippet>

<p>In this example we're defining a grouped column with <code>IT Skills</code> having two child columns <code>Skills and
        Proficiency</code></p>

<p>Not that anything other than a string value will need to be bound (i.e. <code>:width="120"</code>) as Vue will
    default to providing values as Strings.</p>

<p>A full working example of defining a grid declaratively can be found in the <a
            href="https://github.com/seanlandsman/ag-grid-vue-playground">Vue Playground Repo.</a></p>

<h2>Binding Row Data with <code>v-model</code></h2>

<p>You can bind row data in the usual way with <code>:rowData="rowData"</code>, but you can also do so by using <code>v-model</code>.</p>

<p>The advantage of doing so is that this will facilitate unidirectional data flow (see next section). The main difference over normal
binding is that any data changes will emit an <code>data-model-changed</code> event which will have the current row data as a parameter.</p>

<p>Please refer to the section below for a practical application of this binding.</p>

<h2>Memory Footprint, Vuex and Unidirectional Data Flow</h2>

<p>Please refer to <a href="../vuex-data-flow">Memory Footprint, Vuex & Unidirectional Data Flow</a></p>

<p></p>
<h2 id="parent_child">Child to Parent Communication</h2>

<p>There are a variety of ways to manage component communication in Vue (shared service, local variables etc), but
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

<h3 id="building-bundling">Building & Bundling</h3>
<p>There are many ways to build and/or bundle an VueJS Application. We provide fully working examples using the <a
            href="https://cli.vuejs.org/">Vue CLI</a>
    as part of the <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> on
    GitHub.</p>

<p>For UMD bundling please refer to the <a href="https://github.com/seanlandsman/ag-grid-vue-umd">UMD</a> repo for a working
example of how this can be done.</p>

<h2 id="cell-rendering-cell-editing-using-vuej">Cell Rendering & Cell Editing using VueJS</h2>

<p>
    It is possible to build
    <a href="../javascript-grid-cell-rendering-components/#vue2CellRendering">cell renderers</a>,
    <a href="../javascript-grid-cell-editing/#vue2CellEditing">cell editors</a> and
    <a href="../javascript-grid-filtering/#vue2Filtering">filters</a> using VueJS. Doing each of these
    is explained in the section on each.
</p>

<h2>“$attrs is readonly”,“$listeners is readonly”,“Avoid mutating a prop directly”</h2>

<p>Despite the wording of this warning, the issue is almost always due to multiple versions of <code>Vue</code> being
    instantiated at runtime.</p>
<p>This can occur in any number of ways, but the solution is simple - update (or create) <code>webpack.config.js</code>:
</p>

<snippet lang="js">
resolve: {
        alias: {
                'vue$': path.resolve(__dirname, 'node_modules/vue/dist/vue.js')
        }
}
</snippet>

<p>Here we're telling Webpack to use the full build. You may need to change the value according to the build you
    need.</p>

<p>Please refer to the <a href="https://vuejs.org/v2/guide/installation.html#Explanation-of-Different-Builds">Vue
        Documentation</a>
    for more information on the different builds available.</p>

<p>The longer term fix is something the Vue team are contemplating - please refer to this
    <a href="https://github.com/vuejs/vue/issues/8278">GitHub Issue</a> for more information.</p>

<h2>Example Repos</h2>

<p>The following Vue repos are available, with each demonstrating a different feature:
<ul>
    <li><a href="https://github.com/ag-grid/ag-grid-vue-example">Main Example</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-vuex">Vuex</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-i18n">i18n</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-routing">Routing</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-typescript">Typescript</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-umd">UMD</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-playground">Playground</a>: Declarative, Auto Refresh and Model Driven Examples</li>
</ul></p>

<h2 id="next-steps">Next Steps</h2>

<p>
    Learn how to get started with ag-Grid in your Vue project <a href="https://www.ag-grid.com/vue-getting-started/">here</a>.
    <br><br>
    Ready to try ag-Grid in your project? Download ag-Grid Community edition or trial ag-Grid Enterprise for free.
</p>



<?php include '../documentation-main/documentation_footer.php'; ?>
