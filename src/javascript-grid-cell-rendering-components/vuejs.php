<!-- vuejs from here -->
<h2 id="vueCellRendering">
    <img src="../images/vue_large.png" style="width: 60px;"/>
    VueJS Cell Rendering
</h2>

<div class="note" style="margin-bottom: 20px">
    <img align="left" src="../images/note.png" style="margin-right: 10px;" />
    <p>This section explains how to utilise ag-Grid cellRenders using VueJS. You should read about how
    <a href="/">Cell Rendering works in ag-Grid</a> first before trying to
    understand this section.</p>
</div>

<p>
    It is possible to provide a VueJS cell renderer's for ag-Grid to use. All of the information above is
    relevant to VueJS cell renderer's. This section explains how to apply this logic to your VueJS component.
</p>

<p>
    For examples on VueJS cellRendering, see the
    <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> on Github.
    VueJS Renderers are used on all but the first Grid on this example page (the first grid uses plain JavaScript Renderers)</p>
</p>

<h3 id="specifying-a-vuejs-cell-renderer"><img src="../images/vue_large.png" style="width: 20px;"/> Specifying a VueJS Cell Renderer</h3>

<p>
    If you are using the ag-grid-vue component to create the ag-Grid instance,
    then you will have the option of additionally specifying the cell renderer's
    as VueJS components.</p>

    <p>A VueJS component can be defined in a few different ways (please see <a href="/best-vuejs-data-grid#define_component">
        Defining VueJS Components</a> for all the options), but in this example we're going to define our renderer as a Single File Component:</p>

<snippet>
// create your cell renderer as a VueJS component
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

// then reference the Component in your colDef like this
{
    // instead of cellRenderer we use cellRendererFramework
    cellRendererFramework: CurrencyComponent,

    // specify all the other fields as normal
    headerName: "Currency (Filter)",
    field: "currency",
    colId: "params",
    width: 150
}</snippet>

<p>The Grid cell's value will be made available implicitly in a data value names <code>params</code>. This value will be available to
    you from the <code>created</code> VueJS lifecycle hook.</p>

<p>You can think of this as you having defined the following:</p>
<snippet>
export default {
    data () {
        return {
            params: null
        }
    },
    ...</snippet>

<p>but you do not need to do this - this is made available to you behind the scenes, and contains the cells value.</p>

<p>
    By using <code>colDef.cellRendererFramework</code> (instead of <code>colDef.cellRenderer</code>) the grid
    will know it's a VueJS component, based on the fact that you are using the VueJS version of
    ag-Grid.
</p>

<p>
    This same mechanism can be to use a VueJS Component in the following locations:
<ul>
    <li>colDef.cellRenderer<b>Framework</b></li>
    <li>colDef.floatingCellRenderer<b>Framework</b></li>
    <li>gridOptions.fullWidthCellRenderer<b>Framework</b></li>
    <li>gridOptions.groupRowRenderer<b>Framework</b></li>
    <li>gridOptions.groupRowInnerRenderer<b>Framework</b></li>
</ul>
In other words, wherever you specify a normal cell renderer, you can now specify a VueJS cell renderer
in the property of the same name excepting ending 'Framework'. As long as you are using the VueJS ag-Grid component,
the grid will know the framework to use is VueJS.
</p>

<h3 id="example-rendering-using-vuejs-components">Example: Rendering using VueJS Components</h3>
<p>
    Using VueJS Components in the Cell Renderer's
</p>
<show-example url="../framework-examples/vue-examples/#/dynamic"
              jsfile="../framework-examples/vue-examples/src/dynamic-component-example/DynamicComponentExample.vue"
              exampleHeight="525px"></show-example>

<h3 id="vuejs-methods-lifecycle"><img src="../images/vue_large.png" style="width: 20px;"/> VueJS Methods / Lifecycle</h3>

<p>
    All of the methods in the <code>ICellRenderer</code> interface described above are applicable
    to the VueJS Component with the following exceptions:
<ul>
    <li><i>init()</i> is not used. The cells value is made available implicitly via a data field called <code>params</code>.</li>
    <li><i>getGui()</i> is not used. Instead do normal VueJS magic in your Component via the VueJS template.</li>
</ul>

<h3 id="handling-refresh"><img src="../images/vue_large.png" style="width: 20px;"/> Handling Refresh</h3>

<p>To receive update (for example, after an edit) you should implement the optional <code>refresh</code> method on the <code>AgRendererComponent</code> interface.</p>

<h3 id="example-rendering-using-more-complex-vuejs-components">Example: Rendering using more complex VueJS Components</h3>
<p>
    Using more complex VueJS Components in the Cell Renderer's
</p>
<show-example url="../framework-examples/vue-examples/#/rich-dynamic"
              jsfile="../framework-examples/vue-examples/src/rich-dynamic-component-example/RichDynamicComponentExample.vue"
              exampleHeight="525px"></show-example>

<note>The full <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> repo shows many more examples for rendering, including grouped rows, full width renderers
    and so on, as well as examples on using VueJS Components with both Cell Editors and Filters</note>