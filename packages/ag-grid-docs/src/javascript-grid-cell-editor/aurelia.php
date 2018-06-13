    <!-- start of aurelia -->
    <h2 id="aureliaCellEditing">
        Aurelia Cell Editing
    </h2>

    <p>
        It is possible to provide a Aurelia Cell Editor for ag-Grid to use. All of the information above is
        relevant to Aurelia Cell Editors. This section explains how to apply this logic to your Aurelia component.
    </p>

    <p>
        For an example of Aurelia cell editing, see the
        <a href="https://github.com/ag-grid/ag-grid-aurelia-example">ag-grid-aurelia-example</a> on Github.
    </p>

    <h3 id="specifying-a-aurelia-cell-editor"> Specifying a Aurelia cellEditor</h3>


    <snippet>
// Create your cell editor as a Aurelia component

// Component View
&lt;template&gt;
  &lt;require from="./mood-editor.css"&gt;&lt;/require&gt;

  &lt;div class.bind="'mood'" tabindex="0" focus.bind="hasFocus" keydown.trigger="onKeyDown($event)"&gt;
    &lt;img src="images/smiley.png" click.delegate="setHappy(true)" class.bind="happy ? 'selected' : 'default'"&gt;
    &lt;img src="images/smiley-sad.png" click.delegate="setHappy(false)" class.bind="!happy ? 'selected' : 'default'"&gt;
  &lt;/div&gt;
&lt;/template&gt;

// Component Logic
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

// then reference the Component in your column definitions like this
&lt;ag-grid-aurelia #agGrid style="width: 100%; height: 100%;" class="ag-theme-balham"
                 grid-options.bind="gridOptions"&gt;
  &lt;ag-grid-column header-name="Mood" field="mood" width.bind="150" editable.bind="true"&gt;
    &lt;ag-editor-template&gt;
      &lt;ag-mood-editor&gt;&lt;/ag-mood-editor&gt;
    &lt;/ag-editor-template&gt;
  &lt;/ag-grid-column&gt;
&lt;/ag-grid-aurelia&gt;</snippet>

    <p>Your Aurelia components should implement <code>BaseAureliaEditor</code>.</p>


    <h3 id="aurelia-parameters"> Aurelia Parameters</h3>

    <p>
        All of the other methods (<code>isPopup(), getValue(), isCancelBeforeStart(), isCancelAfterEnd()</code> etc)
        should be put onto your Aurelia component and will work as normal.
    </p>

    <h3 id="aurelia-editor">Editor Component in Aurelia</h3>
    <?= example('Editor Component in Aurelia', 'aurelia-editor', 'as-is', array("exampleHeight" => 370, "noPlunker" => 1, "usePath" => "#/?route=editor")) ?>