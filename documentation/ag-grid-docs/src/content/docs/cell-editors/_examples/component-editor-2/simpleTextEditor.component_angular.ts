import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { ICellEditorParams } from '@ag-grid-community/core';
import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
    standalone: true,
    template: `<input class="my-simple-editor" [value]="value" #input /> `,
})
export class SimpleTextEditor implements ICellEditorAngularComp, AfterViewInit {
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

        const eventKey = params.eventKey;
        const isBackspace = eventKey === 'Backspace';

        if (isBackspace) {
            startValue = '';
        } else if (eventKey && eventKey.length === 1) {
            startValue = eventKey;
        }

        if (startValue !== null && startValue !== undefined) {
            return startValue;
        }

        return '';
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.input.element.nativeElement.focus();
        });
    }
}
