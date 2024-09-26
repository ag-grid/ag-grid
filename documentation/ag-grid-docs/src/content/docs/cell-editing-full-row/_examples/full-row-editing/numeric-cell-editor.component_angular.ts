import type { AfterViewInit } from '@angular/core';
import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `<input #input (keydown)="onKeyDown($event)" [(ngModel)]="value" class="ag-input-field-input" />`,
})
export class NumericCellEditor implements ICellEditorAngularComp, AfterViewInit {
    public value!: string;
    private focusAfterAttached!: boolean;

    @ViewChild('input', { read: ViewContainerRef }) public input!: ViewContainerRef;

    agInit(params: ICellEditorParams): void {
        // we only want to highlight this cell if it started the edit; it's possible
        // another cell in this row started the edit
        this.focusAfterAttached = params.cellStartedEdit;

        this.value = this.isCharNumeric(params.eventKey) ? params.eventKey : params.value;
    }

    getValue(): number | null {
        const value = this.value;
        return value === '' || value == null ? null : parseInt(value);
    }

    onKeyDown(event: any): void {
        if (!event.key || event.key.length !== 1 || this.isNumericKey(event)) {
            return;
        }
        this.input.element.nativeElement.focus();

        if (event.preventDefault) event.preventDefault();
    }

    ngAfterViewInit() {
        window.setTimeout(() => {
            if (this.focusAfterAttached) {
                this.input.element.nativeElement.focus();
                this.input.element.nativeElement.select();
            }
        });
    }

    // when we tab into this editor, we want to focus the contents
    focusIn() {
        this.input.element.nativeElement.focus();
        this.input.element.nativeElement.select();
        console.log('NumericCellEditor.focusIn()');
    }

    // when we tab out of the editor, this gets called
    focusOut() {
        console.log('NumericCellEditor.focusOut()');
    }

    private isCharNumeric(charStr: string | null): boolean {
        return charStr != null && !!/^\d+$/.test(charStr);
    }

    private isNumericKey(event: any): boolean {
        const charStr = event.key;
        return this.isCharNumeric(charStr);
    }
}
