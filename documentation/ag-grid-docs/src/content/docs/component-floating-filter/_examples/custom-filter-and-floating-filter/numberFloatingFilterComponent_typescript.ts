import { FloatingFilterDisplayComp, FloatingFilterDisplayParams } from 'ag-grid-community';

export interface CustomParams {
    color: string;
}

export class NumberFloatingFilterComponent implements FloatingFilterDisplayComp<any, any, number> {
    eGui!: HTMLDivElement;
    eFilterInput!: HTMLInputElement;
    params!: FloatingFilterDisplayParams<any, any, number> & CustomParams;

    init(params: FloatingFilterDisplayParams<any, any, number> & CustomParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '&gt; <input style="width: 30px" type="number" min="0" />';
        this.eFilterInput = this.eGui.querySelector('input')!;
        this.eFilterInput.style.borderColor = params.color;
        this.refresh(params);

        this.eFilterInput.addEventListener('input', () => this.onInputChanged());
    }

    refresh(params: FloatingFilterDisplayParams<any, any, number> & CustomParams) {
        this.params = params;
        // if the update is from the floating filter, we don't need to update the UI
        if (params.source !== 'ui') {
            this.eFilterInput.value = String(params.model ?? '');
        }
    }

    getGui() {
        return this.eGui;
    }

    private onInputChanged() {
        const newValue = this.eFilterInput.value;
        this.params.onModelChange(newValue === '' ? null : Number(newValue));
    }
}
