import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterParams } from '@ag-grid-community/core';
import { IFilterAngularComp } from '@ag-grid-community/angular';

@Component({
    selector: 'filter-cell',
    template: `
        <div class="container">
            Partial Match Filter: <input #input (ngModelChange)="onChange($event)" [ngModel]="text" class="form-control">
        </div>
    `, styles: [
        `
           .container {
                border: 2px solid #22ff22;
                border-radius: 5px;
                background-color: #bbffbb;
                width: 200px;
                height: 50px
            }

            input {
                height: 20px
            }
        `
    ]
})
export class PartialMatchFilter implements IFilterAngularComp {
    private params!: IFilterParams;
    public text = '';

    @ViewChild('input', { read: ViewContainerRef }) public input!: ViewContainerRef;

    agInit(params: IFilterParams): void {
        this.params = params;
    }

    isFilterActive(): boolean {
        return this.text != null && this.text !== '';
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        const { api, colDef, column, columnApi, context, valueGetter } = this.params;
        const { node } = params;
        const value = valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: node.data,
            getValue: (field) => node.data[field],
            node,
        }).toString().toLowerCase();

        return this.text.toLowerCase()
            .split(' ')
            .every(filterWord => value.indexOf(filterWord) >= 0);
    }

    getModel(): any {
        if (!this.isFilterActive()) { return null; }

        return { value: this.text };
    }

    setModel(model: any): void {
        this.text = model ? model.value : '';
    }

    afterGuiAttached(params: IAfterGuiAttachedParams): void {
        window.setTimeout(() => this.input.element.nativeElement.focus());
    }

    componentMethod(message: string): void {
        alert(`Alert from PartialMatchFilterComponent: ${message}`);
    }

    onChange(newValue: any): void {
        if (this.text !== newValue) {
            this.text = newValue;
            this.params.filterChangedCallback();
        }
    }
}
