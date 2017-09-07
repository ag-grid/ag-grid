    <h2 id="ng2CellEditing">
        <img src="../images/angular2_large.png" style="width: 60px;"/>
        Angular Cell Editing
    </h2>

    <div class="note" style="margin-bottom: 20px">
        <img align="left" src="../images/note.png" style="margin-right: 10px;" />
        <p>This section explains how to utilise ag-Grid Cell Editors using Angular 2+. You should read about how
        <a href="../javascript-grid-cell-editor/">Cell Editing</a> works in ag-Grid first before trying to
        understand this section.</p>
    </div>

    <p>
        It is possible to provide a Angular Cell Editor for ag-Grid to use. All of the information above is
        relevant to Angular Cell Editors. This section explains how to apply this logic to your Angular component.
    </p>

    <p>
        For an example of Angular cellEditing, see the
        <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> on Github.
    </p>

    <h3><img src="../images/angular2_large.png" style="width: 20px;"/> Specifying a Angular Cell Editor</h3>

    <p>
        If you are using the ag-grid-angular component to create the ag-Grid instance,
        then you will have the option of additionally specifying the cell editors
        as Angular components.
    </p>

    <snippet>
// create your Cell Editor as a Angular component
@Component({
    selector: 'editor-cell',
    template: `
        &lt;div #container class="mood" tabindex="0" (keydown)="onKeyDown($event)"&gt;
            &lt;img src="../images/smiley.png" (click)="setHappy(true)" [ngClass]="{'selected' : happy, 'default' : !happy}"&gt;
            &lt;img src="../images/smiley-sad.png" (click)="setHappy(false)" [ngClass]="{'selected' : !happy, 'default' : happy}"&gt;
        &lt;/div&gt;
    `,
    styles: [`
        .mood {
            border-radius: 15px;
            border: 1px solid grey;
            background: #e6e6e6;
            padding: 15px;
            text-align:center;
            display:inline-block;
            outline:none
        }

        .default {
            padding-left:10px;
            padding-right:10px;
            border: 1px solid transparent;
            padding: 4px;
        }

        .selected {
            padding-left:10px;
            padding-right:10px;
            border: 1px solid lightgreen;
            padding: 4px;
        }
    `]
})
class MoodEditorComponent implements AgEditorComponent, AfterViewInit {
    private params:any;

    @ViewChild('container', {read: ViewContainerRef}) container;
    private happy:boolean = false;

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.container.element.nativeElement.focus();
    }

    agInit(params:any):void {
        this.params = params;
        this.setHappy(params.value === "Happy");
    }

    getValue():any {
        return this.happy ? "Happy" : "Sad";
    }

    isPopup():boolean {
        return true;
    }

    setHappy(happy:boolean):void {
        this.happy = happy;
    }

    toggleMood():void {
        this.setHappy(!this.happy);
    }

    onKeyDown(event):void {
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39) {  // right
            this.toggleMood();
            event.stopPropagation();
        }
    }
}
// then reference the Component in your colDef like this
colDef = {
        headerName: "Mood",
        field: "mood",
        // instead of cellEditor we use cellEditorFramework
        cellEditorFramework: MoodEditorComponent,
        // specify all the other fields as normal
        editable: true,
        width: 150
    }
}</snippet>

    <p>Your Angular components need to implement <code>AgEditorComponent</code>.</p>

    <p>
        By using <code>colDef.cellEditorFramework</code> (instead of <code>colDef.cellEditor</code>) the grid
        will know it's an Angular component, based on the fact that you are using the Angular version of
        ag-Grid.
    </p>


    <h3 id="angular-parameters"><img src="../images/angular2_large.png" style="width: 20px;"/> Angular Parameters</h3>

    <p>Your Angular components need to implement <code>AgEditorComponent</code>.
        The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the cell <code>params</code>.</p>

    <h3 id="angular-methods-lifecycle"><img src="../images/angular2_large.png" style="width: 20px;"/> Angular Methods / Lifecycle</h3>

    <p>
        All of the methods in the <code>ICellEditor</code> interface described above are applicable
        to the Angular Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. Instead implement the <code>agInit</code> method (on the <code>AgRendererComponent</code> interface).</li>
        <li><i>destroy()</i> is not used. Instead implement the Angular<code>OnDestroy</code> interface (<code>ngOnDestroy</code>) for
            any cleanup you need to do.</li>
        <li><i>getGui()</i> is not used. Instead do normal Angular magic in your Component via the Angular template.</li>
        <li><i>afterGuiAttached()</i> is not used. Instead implement <code>AfterViewInit</code> (<code>ngAfterViewInit</code>) for any post Gui setup (ie to focus on an element).</li>
    </ul>

    <p>
        All of the other methods (<i>isPopup(), getValue(), isCancelBeforeStart(), isCancelAfterEnd()</i> etc)
        should be put onto your Angular component and will work as normal.
    </p>

    <h3 id="example-cell-editing-using-angular-components">Example: Cell Editing using Angular Components</h3>
    <p>
        Using Angular Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.
    </p>
    <show-complex-example example="../framework-examples/angular-examples/index.html?fromDocs=true&example=editor-component"
                          sources="{
                            [
                                { root: '/framework-examples/angular-examples/app/editor-component-example/', files: 'editor.component.ts,editor.component.html,mood-editor.component.ts,mood-renderer.component.ts,numeric-editor.component.ts' },
                                { root: '/framework-examples/angular-examples/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/259RDD/">
    </show-complex-example>