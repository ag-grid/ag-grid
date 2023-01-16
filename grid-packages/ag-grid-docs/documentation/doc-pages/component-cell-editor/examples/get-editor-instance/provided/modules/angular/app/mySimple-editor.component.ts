import { AfterViewInit, Component, ViewChild, ViewContainerRef } from "@angular/core";
import { ICellEditorParams } from "@ag-grid-community/core";
import { ICellEditorAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'editor-cell',
    template: `<input class="my-simple-editor" [value]="value" #input /> `
})
export class MySimpleEditor implements ICellEditorAngularComp, AfterViewInit {
    private params!: ICellEditorParams;
    public value: any;

    @ViewChild('input', { read: ViewContainerRef }) public input!: ViewContainerRef;

    agInit(params: ICellEditorParams): void {
        this.params = params;

        this.value = this.getInitialValue(params);
    }

    getValue(): any {
        return this.value;
    }

    getInitialValue(params: ICellEditorParams): any {
        let startValue = params.value;

        if (params.charPress) {
            startValue = params.charPress;
        }

        if (startValue !== null && startValue !== undefined) {
            return startValue;
        }

        return '';
    }

    myCustomFunction() {
        return {
            rowIndex: this.params.rowIndex,
            colId: this.params.column.getId()
        };
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.input.element.nativeElement.focus();
        });
    }
}
