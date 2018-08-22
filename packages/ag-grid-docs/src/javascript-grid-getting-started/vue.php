<div>

    <h2 id="implementing-the-vuejs-datagrid">
        <img src="../images/svg/docs/getting_started.svg" width="50"/>
        <img style="vertical-align: middle" src="/images/vue_small.png" height="25px"/>
        Getting Started
    </h2>

    <?php
    $frameworkChild = 'vue';
    include 'ag-grid-dependency-framework.php'
    ?>

    <p style="margin-top: 5px">
        If you are building an VueJS application then you have the choice between A) using the plain JavaScript version
        of ag-Grid or B) using the ag-Grid VueJS Component from the <a href="https://github.com/ag-grid/ag-grid-vue">
            ag-grid-vue</a> project. If you use the ag-Grid VueJS Component, then the grid's properties, events and API
        will all tie in with the VueJS ecosystem. This will make your VueJS coding easier.
    </p>

    <h3>Referenceing Styles</h3>
    <p>You'll need to import the ag-Grid CSS in your application, as well as a theme you wish to use:</p>
    <snippet>
        import "../node_modules/ag-grid/dist/styles/ag-grid.css";
        import "../node_modules/ag-grid/dist/styles/ag-theme-balham.css";
    </snippet>
    <p>In this case we're using the Fresh Theme - please refer to the <a href="../javascript-grid-themes">Themes</a>
        documentation for more information.</p>

    <note>Please use the github project <a href="https://github.com/ag-grid/ag-grid-vuejs">ag-grid-vue</a>
        for feedback or issue reporting around ag-Grid's support for VueJS.
    </note>

    <h2 id="ag-grid-vuejs-features">ag-Grid VueJS Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid VueJS Component. The VueJS Component wraps
        the functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        VueJS ag-Grid when it comes to features.
    </p>

    <h3 id="vuejs-full-example">VueJS Full Example</h3>

    <p>
        This page goes through the
        <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a>
        on Github.
    </p>

    <p>The example project includes a number of separate grids on a page, with each section demonstrating a different
        feature set:
    <ul>
        <li>A feature rich grid example, demonstrating many of ag-Grid's features using VueJS as a wrapper
            <a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/rich-grid-example/RichGridExample.vue"
               target="_blank" class="fa fa-external-link"> Vue</a>
        </li>
        <li>A Simple Example, using CellRenderers created from VueJS Components
            <a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/dynamic-component-example/DynamicComponentExample.vue"
               target="_blank" class="fa fa-external-link"> Vue</a>
        </li>
        <li>A Richer Example, using CellRenderers created from VueJS Components, with child components, and two-way
            binding (parent to child components events)
            <a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/rich-dynamic-component-example/RichDynamicComponentExample.vue"
               target="_blank" class="fa fa-external-link"> Vue</a>
        </li>
        <li>A Cell Editor example - one with a popup editor, and another with a numeric editor. Each demonstrates
            different editor related features
            <a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/editor-component-example/EditorComponentExample.vue"
               target="_blank" class="fa fa-external-link"> Vue</a>
        </li>
        <li>A Pinned Row Renderer Example
            <a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/floating-row-example/FloatingRowExample.vue"
               target="_blank" class="fa fa-external-link"> Vue</a>
        </li>
        <li>A Full Width Renderer Example
            <a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/full-width-example/FullWidthExample.vue"
               target="_blank" class="fa fa-external-link"> Vue</a>
        </li>
        <li>A Group Row Inner Renderer Example
            <a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/grouped-row-example/GroupedRowExample.vue"
               target="_blank" class="fa fa-external-link"> Vue</a>
        </li>
        <li>A Filter Example, with the filter written as a VueJS Component
            <a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/filter-example/FilterExample.vue"
               target="_blank" class="fa fa-external-link"> Vue</a>
        </li>
        <li>A Master/Detail Example, with both the Master and the Detail elements being VueJS Components
            <ul>
                <li>Master: <a
                            href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/master-detail-example/MasterDetailExample.vue"
                            target="_blank" class="fa fa-external-link"> Vue</a></li>
                <li>Detail: <a
                            href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/master-detail-example/DetailPanelComponent.vue"
                            target="_blank" class="fa fa-external-link"> Vue</a></li>
            </ul>
        </li>
    </ul>
    </p>

    <p>Once you have the ag-Grid dependencies installed, you will then be able to access ag-Grid inside your
        application:</p>

    <snippet>
        import {AgGridVue} from 'ag-grid-vue';
    </snippet>

    <p>
        Which you can then use as a component within your application:
    </p>

    <snippet>
        export default {
        data () {
        return {
        gridOptions: null,
        ..other data
        }
        },
        components: {
        'ag-grid-vue': AgGridVue,
        ..other components
        },
        ... the rest of your application component
        }
    </snippet>

    <p>
        You will need to include the CSS for ag-Grid, either directly inside
        your html page, or as part of creating your bundle if bundling. The following
        shows referencing the css from your web page:
    </p>
    <snippet>
        &lt;link href="node_modules/ag-grid/dist/styles/ag-grid.css" rel="stylesheet" /&gt;
        &lt;link href="node_modules/ag-grid/dist/styles/ag-theme-balham.css" rel="stylesheet" /&gt;
    </snippet>

    <p>If you're using the <code>style-loader</code> you can also import the CSS dependencies into your final bundle:
    </p>
    <snippet>
        import "../node_modules/ag-grid/dist/styles/ag-grid.css"
        import "../node_modules/ag-grid/dist/styles/ag-theme-balham.css"

        // only needed if you're using enterprise features
        import "ag-grid-enterprise";
    </snippet>

    <p>Importing of the CSS should be done before you use the ag-Grid Vue Component.</p>

    <h2 id="configuring-ag-grid-in-vuejs">Configuring ag-Grid in VueJS</h2>

    <p>You can configure the grid in the following ways through VueJS:</p>
    <ul>
        <li><b>Events:</b> All data out of the grid comes through events. These use
            VueJS event bindings eg <i>:modelUpdated="onModelUpdated"</i>.
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
            eg <code>rowHeight="22"</code>. If the attribute is a boolean and a value is not provided, it is taken as false.
        </li>
        <li><b>Changing Properties:</b> When a property changes value, VueJS
            automatically passes the new value onto the grid. This is used in
            the following locations in the "feature rich grid example' above:<br/>
            a) The 'quickFilter' on the top right updates the quick filter of
            the grid.
            b) The 'Show Tool Panel' checkbox has its value bound to the 'showToolPanel'
            property of the grid.
            c) The 'Refresh Data' generates new data for the grid and updates the
            <i>rowData</i> property.
        </li>
    </ul>

    <p>
        Notice that the grid has its properties marked as <b>immutable</b>. Hence for
        object properties, the object reference must change for the grid to take impact.
        For example, <i>rowData</i> must be a new list of data for the grid to be
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
        }
    </snippet>

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
        });
    </snippet>

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
        import SquareComponent from './SquareComponent'
    </snippet>

    <h4 id="more-complex-external-single-file-components">More Complex, External Single File Components (.vue)</h4>
    <snippet>
        &lt;template&gt;
        &lt;span class="currency"&gt;{{ params.value | currency('EUR') }}&lt;/span&gt;
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
        &lt;/style&gt;
    </snippet>


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
        },
    </snippet>

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
        }
    </snippet>

    <p>Please see the relevant sections on <a href="../javascript-grid-cell-rendering-components/#vueCellRendering">cell
            renderers</a>,
        <a href="../javascript-grid-cell-editing/#vueCellEditing">cell editors</a> and
        <a href="../javascript-grid-filtering/#vueFiltering">filters</a> for configuring and using VueJS Components in
        ag-Grid.</p>

    <p>
        The rich-grid example has ag-Grid configured through the template in the following ways:
    </p>

    <snippet>
        &lt;ag-grid-vue style="width: 100%; height: 350px;" class="ag-theme-balham"
        // these are attributes, not bound, give explicit values here
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
        &lt;/ag-grid-vue&gt;
    </snippet>

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

</div>

