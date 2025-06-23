import type { AfterViewInit } from '@angular/core';
import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `<input #input [(ngModel)]="value" class="my-simple-editor" />`,
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
