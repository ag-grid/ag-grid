<h2>VueJS Cell Rendering</h2>

<p>
    It is possible to provide VueJS cell renderers for ag-Grid to use if you are are using the
    VueJS version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<h3 id="example-rendering-using-vuejs-components">Example: Rendering using VueJS Components</h3>

<p> Using VueJS Components in the Cell Renderers </p>

<?= example('Simple Dynamic Component', 'dynamic-components', 'generated', array('enterprise' => false, "processVue" => true, 'onlyShow' => 'vue', 'extras' => array('fontawesome', "bootstrap"))) ?>


<h3 id="vuejs-methods-lifecycle">VueJS Methods / Lifecycle</h3>

<p>
    All of the methods in the <code>ICellRenderer</code> interface described above are applicable
    to the VueJS Component with the following exceptions:
</p>

<ul class="content">
    <li><code>init()</code> is not used. The cells value is made available implicitly via a data field called <code>params</code>.</li>
    <li><code>getGui()</code> is not used. Instead do normal VueJS magic in your Component via the VueJS template.</li>
</ul>

<h3>Refresh</h3>
<p>
    There are two ways in which cell renderers can be refreshed:
    <ul>
    <li>Implement the <code>refresh</code> method</li>
    <li>Use the <code>autoParamsRefresh</code> mechanism</li>
    <li>Do neither of the above - in which case the grid will destroy and recreate the cell each time the cell value changes</li>
</ul>

<h4>Implement the <code>refresh</code> method</h4>
<p>
    Within the <code>methods</code> section of your component you can implement the <code>refresh()</code> method which returns a <code>boolean</code> value.
    If you want to manage the refresh yourself return <code>true</code> and if you want to let the grid manage the refresh return <code>false</code> (the default behaviour).
    Returning <code>false</code> indicates that you do not wish to manage the refresh - in this case your component will be destroyed and recreated if the underlying data changes).
</p>

<h4>Enable <code>autoParamsRefresh</code> on your renderer</h4>
<p>You can set the <code>autoParamsRefresh</code> property on the <code>ag-grid-vue</code> component. If you do this then the grid will automatically refresh the component, updating the supplied
<code>params</code> of the component.</p>
<p>This has the same effect as if you implemented the <code>refresh</code> method as follows:</p>

<snippet>
methods: {
    refresh(params) {
        this.params = params;
        return true;
    }
</snippet>

<p>Setting this on your renderer to refresh automatically without the cost of the component being destroyed and re-created, but without the
need of implementing <code>refresh</code> yourself.</p>

<p>Note that if you enable <code>autoParamsRefresh</code> then <code>this.params</code> will be updated and your version of <code>refresh</code>
will then be invoked.</p>


<note>The full <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> repo shows a rich example of configuring
ag-Grid with Vue components, but each section for renderers, filters, editors etc will also demonstrate how this functionality can be extended with
Vue.</note>