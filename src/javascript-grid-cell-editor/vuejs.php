    <!-- start of vue -->
    <h2 id="vueCellEditing">
        <img src="../images/vue_large.png" style="width: 60px;"/>
        VueJS Cell Editing
    </h2>

    <p>
        It is possible to provide VueJS cell editors's for ag-Grid to use if you are are using the
        VueJS version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
        registering framework components</a> for how to register framework components.
    </p>

    <h3 id="vue-js-parameters"><img src="../images/vue_large.png" style="width: 20px;"/> VueJS Parameters</h3>

    <p>The Grid cell's value will be made available implicitly in a data value names <code>params</code>. This value will be available to
        you from the <code>created</code> VueJS lifecycle hook. You can think of this as you having defined the following:</p>
<snippet>
export default {
    data () {
        return {
            params: null
        }
    },
    ...</snippet>

    <p>but you do not need to do this - this is made available to you behind the scenes, and contains the cells value.</p>

    <h3 id="vuejs-methods-lifecycle"><img src="../images/vue_large.png" style="width: 20px;"/> VueJS Methods / Lifecycle</h3>

    <p>
        All of the methods in the <code>ICellEditor</code> interface described above are applicable
        to the VueJS Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. The cells value is made available implicitly via a data field called <code>params</code>.</li>
        <li><i>getGui()</i> is not used. Instead do normal VueJS magic in your Component via the VueJS template.</li>
        <li><i>afterGuiAttached()</i> is not used. Instead implement the <code>mounted</code> VueJS lifecycle hook for any post Gui setup (ie to focus on an element).</li>
    </ul>

    <p>
        All of the other methods (<i>isPopup(), getValue(), isCancelBeforeStart(), isCancelAfterEnd()</i> etc)
        should be put onto your VueJS component and will work as normal.
    </p>

    <h1 id="example-cell-editing-using-vuejs-components">Example: Cell Editing using VueJS Components</h1>
    <p>
        Using VueJS Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.
    </p>

    <p>A VueJS component can be defined in a few different ways (please see <a href="/best-vuejs-data-grid#define_component">
            Defining VueJS Components</a> for all the options), but in this example we're going to define our editor as a Single File Component:</p>

    <show-example url="../framework-examples/vue-examples/#/editor"
                  jsfile="../framework-examples/vue-examples/src/editor-component-example/EditorComponentExample.vue"
                  exampleHeight="525px"></show-example>