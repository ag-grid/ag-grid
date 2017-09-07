    <h2 id="polymerCellEditing">
        <img src="../images/polymer-large.png" style="width: 60px;"/>
        Polymer Cell Editing
    </h2>

    <div class="note" style="margin-bottom: 20px">
        <img align="left" src="../images/note.png" style="margin-right: 10px;" />
        <p>This section explains how to utilise ag-Grid Cell Editors using Polymer. You should read about how
        <a href="../javascript-grid-cell-editor/">Cell Editing</a> works in ag-Grid first before trying to
        understand this section.</p>
    </div>

    <p>
        It is possible to provide a Polymer cell editor for ag-Grid to use. All of the information above is
        relevant to Polymer cell editors. This section explains how to apply this logic to your Polymer component.
    </p>

    <p>
        For an example of Polymer cell editing, see the
        <a href="https://github.com/ag-grid/ag-grid-polymer-example">ag-grid-polymer-example</a> on Github.
    </p>

    <h3><img src="../images/polymer-large.png" style="width: 20px;"/> Specifying a Polymer cell editor</h3>

    <p>
        If you are using the ag-grid-polymer component to create the ag-Grid instance,
        then you will have the option of additionally specifying the cell editors
        as Polymer components.
    </p>

    <snippet>
// create your cell editor as a Polymer component
&lt;dom-module id="mood-editor"&gt;
    &lt;template&gt;
        &lt;style&gt;
            .mood {
                border-radius: 15px;
                border: 1px solid grey;
                background: #e6e6e6;
                padding: 15px;
                text-align: center;
                display: inline-block;
                outline: none;
                z-index: 1000;
            }

            .default {
                padding-left: 10px;
                padding-right: 10px;
                border: 1px solid transparent;
                padding: 4px;
            }

            .selected {
                padding-left: 10px;
                padding-right: 10px;
                border: 1px solid lightgreen;
                padding: 4px;
            }

            :host {
                display: block;
            }
        &lt;/style&gt;
        &lt;div id="container" class="mood" tabindex="0" on-keydown="onKeyDown"&gt;
            &lt;img src="/images/smiley.png" on-click="onHappy" class$="{{classForHappy}}"&gt;
            &lt;img src="/images/smiley-sad.png" on-click="onSad" class$="{{classForSad}}"&gt;
        &lt;/div&gt;
    &lt;/template&gt;

    &lt;script&gt;
        class MoodEditor extends Polymer.Element {
            static get is() {
                return 'mood-editor'
            }

            agInit(params) {
                this.params = params;
                this.setHappy(params.value === "Happy");
            }

            ready() {
                super.ready();
                this.$.container.focus()
            }

            isPopup() {
                return true;
            }

            getValue() {
                return this.happy ? "Happy" : "Sad";
            }

            onHappy() {
                this.setHappy(true);
                this.params.api.stopEditing();
            }

            onSad() {
                this.setHappy(false);
                this.params.api.stopEditing();
            }

            setHappy(happy) {
                this.happy = happy;
            }

            toggleMood() {
                this.setHappy(!this.happy);
            }

            onKeyDown(event) {
                let key = event.which || event.keyCode;
                if (key === 37 ||  // left
                    key === 39) {  // right
                    this.toggleMood();
                    event.stopPropagation();
                }
            }


            static get properties() {
                return {
                    happy: Boolean,
                    classForHappy: {
                        type: String,
                        computed: 'getClassForHappy(happy)'
                    },
                    classForSad: {
                        type: String,
                        computed: 'getClassForSad(happy)'
                    }
                };
            }

            getClassForHappy(happy) {
                if (happy) {
                    return 'selected'
                }
                return 'default'
            }

            getClassForSad(happy) {
                if (!happy) {
                    return 'selected'
                }
                return 'default'
            }
        }

        customElements.define(MoodEditor.is, MoodEditor);
    &lt;/script&gt;
&lt;/dom-module&gt;
        // then reference the Component in your colDef like this
colDef = {
        headerName: "Mood",
        field: "mood",
        // instead of cellEditor we use cellEditorFramework
        cellEditorFramework: 'mood-editor',
        // specify all the other fields as normal
        editable: true,
        width: 150
    }
}</snippet>

    <p>
        By using <code>colDef.cellEditorFramework</code> (instead of <code>colDef.cellEditor</code>) the grid
        will know it's an Polymer component, based on the fact that you are using the Polymer version of
        ag-Grid.
    </p>


    <h3 id="polymer-parameters"><img src="../images/polymer-large.png" style="width: 20px;"/> Polymer Parameters</h3>

    <p>The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the cell <code>params</code>.</p>

    <h3 id="polymer-methods-lifecycle"><img src="../images/polymer-large.png" style="width: 20px;"/> Polymer Methods / Lifecycle</h3>

    <p>
        All of the methods in the <code>ICellEditor</code> interface described above are applicable
        to the Polymer Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. Instead implement the <code>agInit</code> method.</li>
        <li><i>getGui()</i> is not used. Instead do normal Polymer magic in your Component via the Polymer template.</li>
    </ul>

    <p>
        All of the other methods (<i>isPopup(), getValue(), destroy(), afterGuiAttached(), isCancelBeforeStart(), isCancelAfterEnd()</i> etc)
        should be put onto your Polymer component and will work as normal.
    </p>

    <h3 id="example-cell-editing-using-polymer-components">Example: Cell Editing using Polymer Components</h3>
    <p>
        Using Polymer Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.
    </p>
    <show-complex-example example="../framework-examples/polymer-examples/src/editor-components-grid/index.html"
                          sources="{
                            [
                                { root: '/framework-examples/polymer-examples/src/editor-components-grid/', files: 'index.html,editor-components-example.html,mood-renderer.html,numeric-editor.html,mood-editor.html' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
