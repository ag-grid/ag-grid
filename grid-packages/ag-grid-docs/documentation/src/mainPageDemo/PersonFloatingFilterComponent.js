export class PersonFloatingFilterComponent {
    init(params) {
        this.params = params;
        const eGui = this.eGui = document.createElement('div');
        eGui.className = 'ag-input-wrapper';
        const input = this.input = document.createElement('input');
        input.className = 'ag-floating-filter-input';
        input.setAttribute('aria-label', 'Name Filter Input');
        eGui.appendChild(input);
        this.changeEventListener = () => {
            params.parentFilterInstance(instance => {
                instance.setFromFloatingFilter(input.value);
            });
        };
        input.addEventListener('input', this.changeEventListener);
    }

    getGui() {
        return this.eGui;
    }

    onParentModelChanged(model) {
        // add in child, one for each flat
        this.input.value = model != null ? model : '';
    }

    destroy() {
        this.input.removeEventListener('input', this.changeEventListener);
    }
}

