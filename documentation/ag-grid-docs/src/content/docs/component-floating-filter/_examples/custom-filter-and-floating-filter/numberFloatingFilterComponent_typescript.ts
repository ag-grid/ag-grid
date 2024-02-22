import { IFloatingFilterComp, IFloatingFilterParams } from "@ag-grid-community/core";
import { NumberFilterComponent } from "./numberFilterComponent_typescript";

export class NumberFloatingFilterComponent implements IFloatingFilterComp {
    eGui!: HTMLDivElement;
    currentValue: any;
    eFilterInput!: HTMLInputElement;

    // Generic param should be NumberFilterComponent but type needs to be passed through IFloatingFilterComp first
    init(params: IFloatingFilterParams<NumberFilterComponent>) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '&gt; <input style="width: 30px" type="number" min="0" />';
        this.currentValue = null;
        this.eFilterInput = this.eGui.querySelector('input')!;

        const onInputBoxChanged = () => {
            if (this.eFilterInput.value === '') {
                // Remove the filter
                params.parentFilterInstance((instance) => {
                    instance.myMethodForTakingValueFromFloatingFilter(null);
                });
                return;
            }

            this.currentValue = Number(this.eFilterInput.value);
            params.parentFilterInstance(instance => {
                instance.myMethodForTakingValueFromFloatingFilter(this.currentValue);
            });
        }

        this.eFilterInput.addEventListener('input', onInputBoxChanged);
    }

    onParentModelChanged(parentModel: any) {
        // When the filter is empty we will receive a null message her
        if (parentModel == null) {
            this.eFilterInput.value = '';
            this.currentValue = null;
        } else {
            this.eFilterInput.value = parentModel;
            this.currentValue = parentModel;
        }
    }

    getGui() {
        return this.eGui;
    }
}

