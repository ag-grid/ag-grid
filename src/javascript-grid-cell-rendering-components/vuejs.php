<h2>VueJS Cell Rendering</h2>

<p>
    It is possible to provide VueJS cell renderers for ag-Grid to use if you are are using the
    VueJS version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<h3 id="example-rendering-using-vuejs-components">Example: Rendering using VueJS Components</h3>

<p> Using VueJS Components in the Cell Renderers </p>

<?= example('Dynamic Components with VueJS', 'vue-dynamic', 'as-is', array("exampleHeight" => 350, "noPlunker"=> 1, "skipDirs" => array("dist"))) ?>

<h3 id="vuejs-methods-lifecycle">VueJS Methods / Lifecycle</h3>

<p>
    All of the methods in the <code>ICellRenderer</code> interface described above are applicable
    to the VueJS Component with the following exceptions:
</p>

<ul class="content">
    <li><code>init()</code> is not used. The cells value is made available implicitly via a data field called <code>params</code>.</li>
    <li><code>getGui()</code> is not used. Instead do normal VueJS magic in your Component via the VueJS template.</li>
</ul>

<p>
    To handle refresh, implement logic inside the <code>refresh()</code> method inside your component and return true.
    If you do not want to handle refresh, just return false from the refresh method (which will tell the grid you do
    not handle refresh and your component will be destroyed and recreated if the underlying data changes).
</p>


<note>The full <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> repo shows many more examples for rendering, including grouped rows, full width renderers
    and so on, as well as examples on using VueJS Components with both Cell Editors and Filters</note>