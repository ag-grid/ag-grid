    <!-- start of vue -->
    <h2 id="vueCellEditing">
        <img src="../images/vue_large.png" style="width: 60px;"/>
        VueJS Cell Editing
    </h2>

    <div class="note" style="margin-bottom: 20px">
        <img align="left" src="../images/note.png" style="margin-right: 10px;" />
        <p>This section explains how to utilise ag-Grid cell editors using VueJS. You should read about how
            <a href="../javascript-grid-cell-editor/">Cell Editing</a> works in ag-Grid first before trying to
            understand this section.</p>
    </div>

    <p>
        It is possible to provide a VueJS cell editor for ag-Grid to use. All of the information above is
        relevant to VueJS cell editors. This section explains how to apply this logic to your VueJS component.
    </p>

    <p>
        For an example of VueJS cellEditing, see the
        <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> on Github.
    </p>

    <h3><img src="../images/vue_large.png" style="width: 20px;"/> Specifying a VueJS cell editor</h3>

    <p>
        If you are using the ag-grid-vue component to create the ag-Grid instance,
        then you will have the option of additionally specifying the cell editors
        as VueJS components.
    </p>

    <p>A VueJS component can be defined in a few different ways (please see <a href="/best-vuejs-data-grid#define_component">
            Defining VueJS Components</a> for all the options), but in this example we're going to define our editor as a Single File Component:</p>

<pre ng-non-bindable><span class="codeComment">// create your cell editor as a VueJS component</span>
&lt;template&gt;
    &lt;div :ref="'container'" class="mood" tabindex="0" @keydown="onKeyDown"&gt;
        &lt;img src="images/smiley.png" @click="onClick(true)" :class="{selected : happy, default : !happy}"&gt;
        &lt;img src="images/smiley-sad.png" @click="onClick(false)" :class="{selected : !happy, default : happy}"&gt;
    &lt;/div&gt;
&lt;/template&gt;

&lt;script&gt;
    import Vue from "vue";

    export default Vue.extend({
        data() {
            return {
                happy: false,
                imgForMood: null
            }
        },
        methods: {
            getValue() {
                return this.happy ? "Happy" : "Sad";
            },

            isPopup() {
                return true;
            },

            setHappy(happy) {
                this.happy = happy;
            },

            toggleMood() {
                this.setHappy(!this.happy);
            },

            onClick(happy) {
                this.setHappy(happy);
                this.params.api.stopEditing();
            },

            onKeyDown(event) {
                let key = event.which || event.keyCode;
                if (key == 37 ||  // left
                    key == 39) {  // right
                    this.toggleMood();
                    event.stopPropagation();
                }
            }
        },
        created() {
            this.setHappy(this.params.value === "Happy");
        },
        mounted() {
            Vue.nextTick(() =&gt; {
                this.$refs.container.focus();
            });
        }
    })
&lt;/script&gt;

&lt;style scoped&gt;
    .mood {
        border-radius: 15px;
        border: 1px solid grey;
        background: #e6e6e6;
        padding: 15px;
        text-align: center;
        display: inline-block;
        outline: none
    }

    .default {
        border: 1px solid transparent !important;
        padding: 4px;
    }

    .selected {
        border: 1px solid lightgreen !important;
        padding: 4px;
    }
&lt;/style&gt;

<span class="codeComment">// then reference the Component in your colDef like this</span>
this.colDefs = [
    {
        <span class="codeComment">// specify all the other fields as normal</span>
        headerName: "Mood",
        field: "mood",
        editable: true,
        width: 250,
        <span class="codeComment">// instead of cellEditor we use cellEditorFramework</span>
        cellEditorFramework: MoodEditorComponent
    }
</pre>

    <p>
        By using <code>colDef.cellEditorFramework</code> (instead of <code>colDef.cellEditor</code>) the grid
        will know it's a VueJS component, based on the fact that you are using the VueJS version of
        ag-Grid.
    </p>

    <h3 id="vue-js-parameters"><img src="../images/vue_large.png" style="width: 20px;"/> VueJS Parameters</h3>

    <p>The Grid cell's value will be made available implicitly in a data value names <code>params</code>. This value will be available to
        you from the <code>created</code> VueJS lifecycle hook.</p>

    <p>You can think of this as you having defined the following:</p>
<pre>
export default {
    data () {
        return {
            params: null
        }
    },
    ...
</pre>

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

    <h3 id="example-cell-editing-using-vuejs-components">Example: Cell Editing using VueJS Components</h3>
    <p>
        Using VueJS Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.
    </p>
    <show-example url="../framework-examples/vue-examples/#/editor"
                  jsfile="../framework-examples/vue-examples/src/editor-component-example/EditorComponentExample.vue"
                  exampleHeight="525px"></show-example>