function YearFilter() {
}

YearFilter.prototype.init = function(params) {
    this.filterChangedCallback = params.filterChangedCallback.bind(this);
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div style="display: flex; justify-content: center;">' +
        '<label style="padding: 0.5rem;">' +
        '  <input type="radio" name="yearFilter" checked="checked" id="rbYearAll" /> All' +
        '</label>' +
        '<label style="padding: 0.5rem;">' +
        '  <input type="radio" name="yearFilter" id="rbYearAfter2004" /> After 2004' +
        '</label>' +
        '</div>';

    this.rbAllYears = this.eGui.querySelector('#rbYearAll');
    this.rbAllYears.addEventListener('change', this.filterChangedCallback);
    this.rbAfter2004 = this.eGui.querySelector('#rbYearAfter2004');
    this.rbAfter2004.addEventListener('change', this.filterChangedCallback);
    this.filterActive = false;
};

YearFilter.prototype.getGui = function() {
    return this.eGui;
};

YearFilter.prototype.doesFilterPass = function(params) {
    return params.data.year > 2004;
};

YearFilter.prototype.isFilterActive = function() {
    return this.rbAfter2004.checked;
};

YearFilter.prototype.getModel = function() {
    return this.isFilterActive() || null;
};

YearFilter.prototype.onFloatingFilterChanged = function(value) {
    this.setModel(value);
    this.filterChangedCallback();
};

YearFilter.prototype.setModel = function(model) {
    if (model) {
        this.rbAllYears.checked = false;
        this.rbAfter2004.checked = true;
    } else {
        this.rbAllYears.checked = true;
        this.rbAfter2004.checked = false;
    }
};
