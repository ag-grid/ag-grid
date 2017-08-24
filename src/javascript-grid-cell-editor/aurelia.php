    <!-- start of aurelia -->
    <h2 id="aureliaCellEditing">
        <img src="../images/aurelia_large.png" style="width: 60px;"/>
        Aurelia Cell Editing
    </h2>

    <div class="note" style="margin-bottom: 20px">
        <img align="left" src="../images/note.png" style="margin-right: 10px;" />
        <p>This section explains how to utilise ag-Grid cellEditors using Aurelia. You should read about how
            <a href="../javascript-grid-cell-editor/">Cell Editing</a> works in ag-Grid first before trying to
            understand this section.</p>
    </div>

    <p>
        It is possible to provide a Aurelia cellEditor for ag-Grid to use. All of the information above is
        relevant to Aurelia cellEditors. This section explains how to apply this logic to your Aurelia component.
    </p>

    <p>
        For an example of Aurelia cellEditing, see the
        <a href="https://github.com/ag-grid/ag-grid-aurelia-example">ag-grid-aurelia-example</a> on Github.
    </p>

    <h3 id="specifying-a-aurelia-cell-editor"><img src="../images/aurelia_large.png" style="width: 20px;"/> Specifying a Aurelia cellEditor</h3>


    <pre><span class="codeComment">// Create your cellEditor as a Aurelia component</span>

<span class="codeComment">// Component View</span>
&lt;template>
  &lt;require from="./mood-editor.css"></require>

  &lt;div class.bind="'mood'" tabindex="0" focus.bind="hasFocus" keydown.trigger="onKeyDown($event)">
    &lt;img src="images/smiley.png" click.delegate="setHappy(true)" class.bind="happy ? 'selected' : 'default'">
    &lt;img src="images/smiley-sad.png" click.delegate="setHappy(false)" class.bind="!happy ? 'selected' : 'default'">
  &lt;/div>
&lt;/template>

<span class="codeComment">// Component Logic</span>
@customElement('ag-mood-editor')
@inject(Element)
export class NumericEditor extends BaseAureliaEditor {
  params: any;

  @bindable() happy: boolean = false;
  @bindable() hasFocus: boolean = false;

  element: any;

  constructor(element) {
    super();

    this.element = element;
  }

  attached(): void {
    this.setHappy(this.params.value === "Happy");
    this.hasFocus = true;
  }

  getValue(): any {
    return this.happy ? "Happy" : "Sad";
  }

  isPopup(): boolean {
    return true;
  }

  setHappy(happy: boolean): void {
    this.happy = happy;
  }

  toggleMood(): void {
    this.setHappy(!this.happy);
  }

  onKeyDown(event): void {
    let key = event.which || event.keyCode;
    if (key == 37 ||  // left
      key == 39) {  // right
      this.toggleMood();
      event.stopPropagation();
    }
  }
}

<span class="codeComment">// then reference the Component in your column definitions like this</span>
&lt;ag-grid-aurelia #agGrid style="width: 100%; height: 100%;" class="ag-fresh"
                 grid-options.bind="gridOptions">
  &lt;ag-grid-column header-name="Mood" field="mood" width.bind="150" editable.bind="true">
    &lt;ag-editor-template>
      &lt;ag-mood-editor>&lt;/ag-mood-editor>
    &lt;/ag-editor-template>
  &lt;/ag-grid-column>
&lt;/ag-grid-aurelia>
</pre>

    <p>Your Aurelia components should implement <code>BaseAureliaEditor</code>.</p>


    <h3 id="aurelia-parameters"><img src="../images/aurelia_large.png" style="width: 20px;"/> Aurelia Parameters</h3>

    <p>
        All of the other methods (<i>isPopup(), getValue(), isCancelBeforeStart(), isCancelAfterEnd()</i> etc)
        should be put onto your Aurelia component and will work as normal.
    </p>

<!--    <h3 id="example-cell-editing-using-aurelia-components">Example: Cell Editing using Aurelia Components</h3>-->
<!--    <p>-->
<!--        Using Aurelia Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.-->
<!--    </p>-->

<!--    <show-example example="../framework-examples/aurelia-example/#/editor/true"-->
<!--                  jsfile="../framework-examples/aurelia-example/components/editor-example/editor-example.ts"-->
<!--                  html="../framework-examples/aurelia-example/components/editor-example/editor-example.html"></show-example>-->