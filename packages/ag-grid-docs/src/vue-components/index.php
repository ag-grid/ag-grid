<?php
$pageTitle = "Vue Components";
$pageDescription = "Worlds leading, feature rich Vue Grid. Designed to integrate seamlessly with Vue to deliver filtering, grouping, aggregation, pivoting and much more with the performance that you expect. Version 19 is out now.";
$pageKeyboards = "VueJS Grid, Vue Grid, Vue Table";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

    <h1 id="implementing-the-vuejs-datagrid">
    Vue Components
    </h1>

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

<?php include '../documentation-main/documentation_footer.php'; ?>
