class NumberFloatingFilterComponent {
    eGui;
    eFilterInput;
    params;

    init(params) {
        this.params = params;
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '&gt; <input style="width: 30px" type="number" min="0" />';
        this.eFilterInput = this.eGui.querySelector('input');
        this.eFilterInput.style.borderColor = params.color;

        this.eFilterInput.addEventListener('input', () => this.onInputChanged());
    }

    refresh(params) {
        this.params = params;
        // if the update is from the floating filter, we don't need to update the UI
        if (params.source !== 'ui') {
            const model = params.model;
            if (model == null) {
                this.eFilterInput.value = '';
            } else {
                const value = agGrid.isCombinedFilterModel(model) ? model.conditions[0]?.filter : model.filter;
                this.eFilterInput.value = String(value);
            }
        }
    }

    getGui() {
        return this.eGui;
    }

    onInputChanged() {
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
