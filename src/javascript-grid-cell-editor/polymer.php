    <h2 id="polymerCellEditing">
        <img src="../images/polymer-large.png" style="width: 60px;"/>
        Polymer Cell Editing
    </h2>

    <div class="note" style="margin-bottom: 20px">
        <img align="left" src="../images/note.png" style="margin-right: 10px;" />
        <p>This section explains how to utilise ag-Grid cellEditors using Polymer. You should read about how
        <a href="../javascript-grid-cell-editor/">Cell Editing</a> works in ag-Grid first before trying to
        understand this section.</p>
    </div>

    <p>
        It is possible to provide a Polymer cellEditor for ag-Grid to use. All of the information above is
        relevant to Polymer cellEditors. This section explains how to apply this logic to your Polymer component.
    </p>

    <p>
        For an example of Polymer cellEditing, see the
        <a href="https://github.com/ceolter/ag-grid-polymer-example">ag-grid-polymer-example</a> on Github.
    </p>

    <h3><img src="../images/polymer-large.png" style="width: 20px;"/> Specifying a Polymer cellEditor</h3>

    <p>
        If you are using the ag-grid-polymer component to create the ag-Grid instance,
        then you will have the option of additionally specifying the cellEditors
        as Polymer components.
    </p>

    <pre ng-non-bindable><span class="codeComment">// create your cellEditor as a Polymer component</span>
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
        <span class="codeComment">// then reference the Component in your colDef like this</span>
colDef = {
        headerName: "Mood",
        field: "mood",
        <span class="codeComment">// instead of cellEditor we use cellEditorFramework</span>
        cellEditorFramework: 'mood-editor',
        <span class="codeComment">// specify all the other fields as normal</span>
        editable: true,
        width: 150
    }
}</pre>

    <p>
        By using <i>colDef.cellEditorFramework</i> (instead of <i>colDef.cellEditor</i>) the grid
        will know it's an Polymer component, based on the fact that you are using the Polymer version of
        ag-Grid.
    </p>


    <h3 id="polymer-parameters"><img src="../images/polymer-large.png" style="width: 20px;"/> Polymer Parameters</h3>

    <p>The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the cell <code>params</code>.</p>

    <h3 id="polymer-methods-lifecycle"><img src="../images/polymer-large.png" style="width: 20px;"/> Polymer Methods / Lifecycle</h3>

    <p>
        All of the methods in the ICellEditor interface described above are applicable
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
    <show-complex-example example="../polymer-examples/src/editor-components-grid/index.html"
                          sources="{
                            [
                                { root: '/polymer-examples/src/editor-components-grid/', files: 'index.html,editor-components-example.html,mood-renderer.html,numeric-editor.html,mood-editor.html' }
                            ]
                          }"
                          exampleHeight="525px">
    </show-complex-example>
