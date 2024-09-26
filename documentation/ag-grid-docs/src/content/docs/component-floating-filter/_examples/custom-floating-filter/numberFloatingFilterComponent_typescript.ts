import type { IFloatingFilterComp, IFloatingFilterParams } from 'ag-grid-community';

export interface CustomParams {
    color: string;
}

export class NumberFloatingFilterComponent implements IFloatingFilterComp {
    eGui!: HTMLDivElement;
    currentValue: any;
    eFilterInput!: HTMLInputElement;

    init(params: IFloatingFilterParams & CustomParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '&gt; <input style="width: 30px" type="number" min="0" />';
        this.currentValue = null;
        this.eFilterInput = this.eGui.querySelector('input')!;
        this.eFilterInput.style.borderColor = params.color;

        const onInputBoxChanged = () => {
            if (this.eFilterInput.value === '') {
                // Remove the filter
                params.parentFilterInstance((instance) => {
                    instance.onFloatingFilterChanged(null, null);
                });
                return;
            }

            this.currentValue = Number(this.eFilterInput.value);
            params.parentFilterInstance((instance) => {
                instance.onFloatingFilterChanged('greaterThan', this.currentValue);
            });
        };

        this.eFilterInput.addEventListener('input', onInputBoxChanged);
    }

    onParentModelChanged(parentModel: any) {
        // When the filter is empty we will receive a null message her
        if (!parentModel) {
            this.eFilterInput.value = '';
            this.currentValue = null;
        } else {
            this.eFilterInput.value = parentModel.filter + '';
            this.currentValue = parentModel.filter;
        }
    }

    getGui() {
        return this.eGui;
    }
}
