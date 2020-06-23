function YearFilter() {
}

YearFilter.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<div style="display: flex; justify-content: center;">' +
        '<label style="padding: 0.5rem;">' +
        '  <input type="radio" name="yearFilter" checked="true" id="rbAllYears" /> All' +
        '</label>' +
        '<label style="padding: 0.5rem;">' +
        '  <input type="radio" name="yearFilter" id="rbSince2010" /> Since 2010' +
        '</label>' +
        '</div>';
    this.eGui.querySelector('#rbAllYears').addEventListener('change', params.filterChangedCallback.bind(this));
    this.rbSince2010 = this.eGui.querySelector('#rbSince2010');
    this.rbSince2010.addEventListener('change', params.filterChangedCallback.bind(this));
    this.filterActive = false;
};

YearFilter.prototype.getGui = function() {
    return this.eGui;
};

YearFilter.prototype.doesFilterPass = function(params) {
    return params.data.year >= 2010;
};

YearFilter.prototype.isFilterActive = function() {
    return this.rbSince2010.checked;
};

// this example isn't using getModel() and setModel(),
// so safe to just leave these empty. don't do this in your code!!!
YearFilter.prototype.getModel = function() {
};

YearFilter.prototype.setModel = function() {
};
