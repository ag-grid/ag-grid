<div>
    <!-- start of vue -->
    <h2 id="vueFiltering">
        <img src="../images/vue_large.png" style="width: 60px"/>
        VueJS Filtering
    </h2>

    <p>
        It is possible to provide VueJS filters for ag-Grid to use if you are are using the
        VueJS version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
        registering framework components</a> for how to register framework components.
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