import {
    FloatingFilterDisplayComp,
    FloatingFilterDisplayParams,
    ICombinedSimpleModel,
    NumberFilterModel,
    isCombinedFilterModel,
} from 'ag-grid-community';

export interface CustomParams {
    color: string;
}

export class NumberFloatingFilterComponent
    implements FloatingFilterDisplayComp<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>>
{
    eGui!: HTMLDivElement;
    eFilterInput!: HTMLInputElement;
    params!: FloatingFilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>> &
        CustomParams;

    init(
        params: FloatingFilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>> &
            CustomParams
    ) {
        this.params = params;
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '&gt; <input style="width: 30px" type="number" min="0" />';
        this.eFilterInput = this.eGui.querySelector('input')!;
        this.eFilterInput.style.borderColor = params.color;

        this.eFilterInput.addEventListener('input', () => this.onInputChanged());
    }

    refresh(
        params: FloatingFilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>> &
            CustomParams
    ) {
        this.params = params;
        // if the update is from the floating filter, we don't need to update the UI
        if (params.source !== 'ui') {
            const model = params.model;
            if (model == null) {
                this.eFilterInput.value = '';
            } else {
                const value = isCombinedFilterModel(model) ? model.conditions[0]?.filter : model.filter;
                this.eFilterInput.value = String(value);
            }
        }
    }

    getGui() {
        return this.eGui;
    }

    private onInputChanged() {
        if (this.eFilterInput.value === '') {
            // Remove the filter
            this.params.onModelChange(null);
            return;
        }

        const currentValue = Number(this.eFilterInput.value);
        this.params.onModelChange({
            filterType: 'number',
            type: 'greaterThan',
            filter: currentValue,
        });
    }
}
