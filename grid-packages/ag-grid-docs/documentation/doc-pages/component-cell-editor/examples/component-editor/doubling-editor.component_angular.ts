import { AfterViewInit, Component, ViewChild, ViewContainerRef } from "@angular/core";
import { ICellEditorAngularComp } from "@ag-grid-community/angular";
import { ICellEditorParams } from "@ag-grid-community/core";

@Component({
    selector: 'editor-cell',
    template: `<input type="number" [(ngModel)]="value" #input class="doubling-input" />`
})
export class DoublingEditor implements ICellEditorAngularComp, AfterViewInit {
    private params!: ICellEditorParams;
    public value!: number;

    @ViewChild('input', { read: ViewContainerRef }) public input!: ViewContainerRef;

    ngAfterViewInit() {
        // focus on the input
        setTimeout(() => this.input.element.nativeElement.focus());
    }

    agInit(params: ICellEditorParams): void {
        this.params = params;

        this.value = parseInt(this.params.value);
    }

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    getValue() {
        // this simple editor doubles any value entered into the input
        return this.value * 2;
    }

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    isCancelBeforeStart() {
        return false;
    }

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    isCancelAfterEnd() {
        // our editor will reject any value greater than 1000
        return this.value > 1000;
    }
}
