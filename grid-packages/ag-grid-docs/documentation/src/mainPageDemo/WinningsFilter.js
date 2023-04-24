export class WinningsFilter {
    init(params) {
        var uniqueId = Math.random();
        this.filterChangedCallback = params.filterChangedCallback;
        this.eGui = document.createElement("div");
        this.eGui.innerHTML =
            '<div style="position: relative; margin: 20px 10px 10px 10px; padding: 20px 10px 10px 10px; position: relative; border: 1px solid lightgray; border-radius: 3px;">' +
            '<div style="position: absolute; font-weight: bold; margin-top: -32px; border: 1px solid lightgray; border-radius: 3px; padding: 2px 5px;">Example Custom Filter</div>' +
            '<div><label><input type="radio" name="filter"' + uniqueId + ' id="cbNoFilter" style="margin-right: 5px;">No filter</input></label></div>' +
            '<div style="margin: 5px 0;"><label><input type="radio" name="filter"' + uniqueId + ' id="cbPositive" style="margin-right: 5px;">Positive</input></label></div>' +
            '<div style="margin: 5px 0;"><label><input type="radio" name="filter"' + uniqueId + ' id="cbNegative" style="margin-right: 5px;">Negative</input></label></div>' +
            '<div style="margin: 5px 0;"><label><input type="radio" name="filter"' + uniqueId + ' id="cbGreater50" style="margin-right: 5px;">&gt; &dollar;50,000</label></div>' +
            '<div style="margin: 5px 0;"><label><input type="radio" name="filter"' + uniqueId + ' id="cbGreater90" style="margin-right: 5px;">&gt; &dollar;90,000</label></div>' +
            '</div>';
        this.cbNoFilter = this.eGui.querySelector('#cbNoFilter');
        this.cbPositive = this.eGui.querySelector('#cbPositive');
        this.cbNegative = this.eGui.querySelector('#cbNegative');
        this.cbGreater50 = this.eGui.querySelector('#cbGreater50');
        this.cbGreater90 = this.eGui.querySelector('#cbGreater90');
        this.cbNoFilter.checked = true; // initialise the first to checked
        this.cbNoFilter.onclick = this.filterChangedCallback;
        this.cbPositive.onclick = this.filterChangedCallback;
        this.cbNegative.onclick = this.filterChangedCallback;
        this.cbGreater50.onclick = this.filterChangedCallback;
        this.cbGreater90.onclick = this.filterChangedCallback;
        this.params = params;
    }

    getGui() {
        var isDark = document.body.classList.contains('dark');
        this.eGui.querySelectorAll('div')[1].style.backgroundColor = isDark ? '#222628' : 'white';
        return this.eGui;
    }

    doesFilterPass(node) {
        var { api, colDef, column, columnApi, context } = this.params;
        // var { node } = this.params;

        var value = this.params.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: node.data,
            getValue: (field) => node.data[field],
            node,
        })

        if (this.cbNoFilter.checked) { return true; }
        if (this.cbPositive.checked) { return value >= 0; }
        if (this.cbNegative.checked) { return value < 0; }
        if (this.cbGreater50.checked) { return value >= 50000; }
        if (this.cbGreater90.checked) { return value >= 90000; }

        console.error('invalid checkbox selection');
    }

    isFilterActive() {
        return !this.cbNoFilter.checked;
    }

    getModelAsString(model) {
        return model ? model : '';
    }

    getModel() {
        if (this.cbNoFilter.checked) { return ''; }
        if (this.cbPositive.checked) { return 'value >= 0'; }
        if (this.cbNegative.checked) { return 'value < 0'; }
        if (this.cbGreater50.checked) { return 'value >= 50000'; }
        if (this.cbGreater90.checked) { return 'value >= 90000'; }

        console.error('invalid checkbox selection');
    }

    // lazy, the example doesn't use setModel()
    setModel() {
    }
}
