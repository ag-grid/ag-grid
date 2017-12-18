<h2 id="vueCellRendering">
    <img src="../images/vue_large.png" style="width: 60px;"/>
    VueJS Cell Rendering
</h2>

<p>
    It is possible to provide VueJS cell renderer's for ag-Grid to use if you are are using the
    VueJS version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
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

<p>
    To handle refresh, implement logic inside the <code>refresh()</code> method inside your component and return true.
    If you do not want to handle refresh, just return false from the refresh method (which will tell the grid you do
    not handle refresh and your component will be destroyed and recreated if the underlying data changes).
</p>

<h3 id="example-rendering-using-more-complex-vuejs-components">Example: Rendering using more complex VueJS Components</h3>
<p>
    Using more complex VueJS Components in the Cell Renderer's
</p>
<show-example url="../framework-examples/vue-examples/#/rich-dynamic"
              jsfile="../framework-examples/vue-examples/src/rich-dynamic-component-example/RichDynamicComponentExample.vue"
              exampleHeight="525px"></show-example>

<note>The full <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> repo shows many more examples for rendering, including grouped rows, full width renderers
    and so on, as well as examples on using VueJS Components with both Cell Editors and Filters</note>