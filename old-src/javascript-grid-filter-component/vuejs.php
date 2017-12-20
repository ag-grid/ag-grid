<div>
    <!-- start of vue -->
    <h2 id="vueFiltering">
        <img src="../images/vue_large.png" style="width: 60px"/>
        VueJS Filtering
    </h2>

    <div class="note" style="margin-bottom: 20px">
        <img align="left" src="../images/note.png" style="margin-right: 10px;" />
        <p>This section explains how to create an ag-Grid Filter using VueJS. You should read about how
            <a href="../javascript-grid-filter-component/">Filters Components</a> work in ag-Grid first before trying to
            understand this section.</p>
    </div>

    <p>
        It is possible to provide a VueJS Component filter for ag-Grid to use. All of the information above is
        relevant to VueJS filters. This section explains how to apply this logic to your VueJS component.
    </p>

    <p>
        For an example on VueJS filtering, see the
        <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> on Github.</p>
    </p>

    <h3 id="specifying-a-vuejs-filter"><img src="../images/vue_large.png" style="width: 20px;"/> Specifying a VueJS Filter</h3>

    <p>
        If you are using the ag-grid-vue component to create the ag-Grid instance,
        then you will have the option of additionally specifying the filters
        as VueJS components.
    </p>

<p>A VueJS component can be defined in a few different ways (please see <a href="/best-vuejs-data-grid#define_component">
        Defining VueJS Components</a> for all the options), but in this example we're going to define our renderer as a Single File Component:</p>


<snippet>
// create your filter as Filter Component
import Vue from "vue";

export default Vue.extend({
    template: `&lt;input style="height: 20px" :ref="'input'" v-model="text"&gt;`,
    data() {
        return {
            text: '',
            valueGetter: null
        }
    },
    methods: {
        isFilterActive() {
            console.log("isactive");
            return this.text !== null && this.text !== undefined && this.text !== '';
        },

        doesFilterPass(params){
            console.log("filterpass");
            return !this.text || this.text.toLowerCase()
                    .split(" ")
                    .every((filterWord) =&gt; {
                        return this.valueGetter(params.node).toString().toLowerCase().indexOf(filterWord) &gt;= 0;
                    });
        },

        getModel() {
            return {value: this.text};
        },

        setModel(model) {
            this.text = model.value;
        },

        afterGuiAttached() {
            this.$refs.input.focus();
        },

        componentMethod(message) {
            alert(`Alert from PartialMatchFilterComponent ${message}`);
        },
    },
    watch: {
        'text': function(val, oldVal) {
            if (val !== oldVal) {
                this.params.filterChangedCallback();
            }
        }
    },
    created()
    {
        this.valueGetter = this.params.valueGetter;
    }
})

// then reference the Component in your colDef like this
colDef = {
    // we use cellRendererFramework instead of cellRenderer 
    filterFramework: PartialMatchFilterComponent,

    // specify all the other fields as normal
    headerName: "Filter Component",
    field: "name",
    width: 400
    ...
}</snippet>

    <p>
        By using <i>colDef.filterFramework</i> (instead of <i>colDef.filter</i>) the grid
        will know it's a VueJS component, based on the fact that you are using the VueJS version of
        ag-Grid.
    </p>

    <h3 id="vuejs-params"><img src="../images/vue_large.png" style="width: 20px;"/> VueJS Params</h3>

<p>The 'filter params'  will be made available implicitly in a data value names <code>params</code>. This value will be available to
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

    </p>

    <h3 id="vuejs-methods-lifecycle"><img src="../images/vue_large.png" style="width: 20px;"/> VueJS Methods / Lifecycle</h3>

    <p>
        All of the methods in the IFilter interface described above are applicable
        to the VueJS Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. The cells value is made available implicitly via a data field called <code>params</code>.</li>
        <li><i>getGui()</i> is not used. VueJS will provide the Gui via the supplied template.</li>
    </ul>

    <p>
        After that, all the other methods (<i>onNewRowsLoaded(), getModel(), setModel()</i> etc) behave the
        same so put them directly onto your VueJS Component.
    </p>

    <h3 id="accessing-the-vuejs-component-instance"><img src="../images/vue_large.png" style="width: 20px;"/> Accessing the VueJS Component Instance</h3>

    <p>
        ag-Grid allows you to get a reference to the filter instances via the <i>api.getFilterInstance(colKey)</i>
        method. If your component is a VueJS component, then this will give you a reference to the ag-Grid's
        Component which wraps your VueJS Component. Just like Russian Dolls. To get to the wrapped VueJS instance
        of your component, use the <i>getFrameworkComponentInstance()</i> method as follows:
        <snippet>
// lets assume a VueJS component as follows
export default Vue.extend({
    template: `&lt;input style="height: 20px" :ref="'input'" v-model="text"&gt;`,
    data() {
        ...data
    },
    methods: {
        componentMethod(message) {
            alert(`Alert from PartialMatchFilterComponent ${message}`);
        },
        ...other methods

// then in your app, if you want to execute myMethod()...
laterOnInYourApplicationSomewhere() {

    // get reference to the ag-Grid Filter component
    let agGridFilter = api.getFilterInstance('name'); // assume filter on name column

    // get VueJS instance from the ag-Grid instance
    let vueFilterInstance = agGridFilter.getFrameworkComponentInstance();

    // now we're sucking diesel!!!
    vueFilterInstance.componentMethod();
}</snippet>
    </p>

    <h3 id="example-filtering-using-vuejs-components"><img src="../images/vue_large.png" style="width: 20px;"/> Example: Filtering using VueJS Components</h3>
    <p>
        Using VueJS Components as a partial text Filter in the "Filter Component" column, illustrating filtering and lifecycle events.
    </p>
    <show-example url="../framework-examples/vue-examples/#/filter"
                  jsfile="../framework-examples/vue-examples/src/filter-example/FilterExample.vue"
                  exampleHeight="525px"></show-example>

</div>