class NumberFloatingFilterComponent {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '&gt; <input style="width: 30px" type="number" min="0" />';
        this.currentValue = null;
        this.eFilterInput = this.eGui.querySelector('input');

        const onInputBoxChanged = () => {
            if (this.eFilterInput.value === '') {
                // Remove the filter
                params.parentFilterInstance(instance => {
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

    onParentModelChanged(parentModel) {
        // When the filter is empty we will receive a null message her
        if (!parentModel) {
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

