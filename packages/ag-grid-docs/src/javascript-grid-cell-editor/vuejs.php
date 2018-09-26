<!-- start of vue -->
<h2 id="vueCellEditing"> VueJS Cell Editing </h2>

<p>
    It is possible to provide VueJS cell editors's for ag-Grid to use if you are are using the
    VueJS version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
        registering framework components</a> for how to register framework components.
</p>

<h3 id="vue-js-parameters"> VueJS Parameters</h3>

<p>The Grid cell's value will be made available implicitly in a data value names <code>params</code>. This value will be
    available to
    you from the <code>created</code> VueJS lifecycle hook. You can think of this as you having defined the following:
</p>

<snippet>
export default {
    data () {
        return {
            params: null
        }
    },
    ...</snippet>

<p>but you do not need to do this - this is made available to you behind the scenes, and contains the cells value.</p>

<h3 id="vuejs-methods-lifecycle">VueJS Methods / Lifecycle</h3>

<p>
    All of the methods in the <code>ICellEditor</code> interface described above are applicable
    to the VueJS Component with the following exceptions:
</p>
<ul class="content">
    <li><code>init()</code> is not used. The cells value is made available implicitly via a data field called <code>params</code>.
    </li>
    <li><code>getGui()</code> is not used. Instead do normal VueJS magic in your Component via the VueJS template.</li>
    <li><code>afterGuiAttached()</code> is not used. Instead implement the <code>mounted</code> VueJS lifecycle hook for
        any post Gui setup (ie to focus on an element).
    </li>
</ul>

<p>
    All of the other methods (<code>isPopup(), getValue(), isCancelBeforeStart(), isCancelAfterEnd()</code> etc)
    should be put onto your VueJS component and will work as normal.
</p>

<h3>Example: Cell Editing using VueJS Components</h3>

<p>
    Using VueJS Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle
    events.
</p>

<p>A VueJS component can be defined in a few different ways (please see <a
            href="/best-vuejs-data-grid#define_component">
        Defining VueJS Components</a> for all the options), but in this example we're going to define our editor as a
    Single File Component:</p>

<?//= ex ample('Editor Components with VueJS', 'vue-editor', 'as-is', array("noPlunker" => 1, "exampleHeight" => 380)) ?>
<?= example('Vue Editor Components', 'component-editor', 'generated', array('enterprise' => 1, "exampleHeight" => 370, "processVue" => true, 'onlyShow' => 'vue', 'extras' => array("bootstrap"))) ?>