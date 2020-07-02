function YearFloatingFilter() {
}

YearFloatingFilter.prototype.init = function(params) {
    this.parentFilterInstance = params.parentFilterInstance;
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div style="display: flex; justify-content: center;">' +
        '<label style="padding: 0.5rem;">' +
        '  <input type="radio" name="yearFloatingFilter" checked="checked" id="rbFloatingYearAll" /> All' +
        '</label>' +
        '<label style="padding: 0.5rem;">' +
        '  <input type="radio" name="yearFloatingFilter" id="rbFloatingYearAfter2004" /> After 2004' +
        '</label>' +
        '</div>';

    this.rbAllYears = this.eGui.querySelector('#rbFloatingYearAll');
    this.rbAfter2004 = this.eGui.querySelector('#rbFloatingYearAfter2004');

    this.rbAllYears.addEventListener('change', this.onSelectionChanged.bind(this));
    this.rbAfter2004.addEventListener('change', this.onSelectionChanged.bind(this));
};

YearFloatingFilter.prototype.onSelectionChanged = function() {
    var that = this;

    this.parentFilterInstance(function(instance) {
        instance.onFloatingFilterChanged(that.rbAfter2004.checked);
    });
};

YearFloatingFilter.prototype.onParentModelChanged = function(parentModel) {
    if (parentModel) {
        this.rbAllYears.checked = false;
        this.rbAfter2004.checked = true;
    } else {
        this.rbAllYears.checked = true;
        this.rbAfter2004.checked = false;
    }
};

YearFloatingFilter.prototype.getGui = function() {
    return this.eGui;
};
