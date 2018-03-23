
function CustomAgeFilter() {}

var CUSTOM_AGE_FILTER_TEMPLATE =
    '<div>' +
    '  <label>' +
    '    <input type="radio" name="ageFilterValue" ref="btAll" checked/> All' +
    '  </label>' +
    '  <label>' +
    '    <input type="radio" name="ageFilterValue" ref="bt18"/> 18' +
    '  </label>' +
    '  <label>' +
    '    <input type="radio" name="ageFilterValue" ref="bt20"/> 20' +
    '  </label>' +
    '</div>' +
    '' +
    '';

CustomAgeFilter.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = CUSTOM_AGE_FILTER_TEMPLATE;
    this.filterValue = null;
    this.params = params;

    // var that = this;

    this.eGui.querySelector('[ref="btAll"]').addEventListener('change', this.onSelection.bind(this, null));
    this.eGui.querySelector('[ref="bt18"]').addEventListener('change', this.onSelection.bind(this, 18));
    this.eGui.querySelector('[ref="bt20"]').addEventListener('change', this.onSelection.bind(this, 20));
};

CustomAgeFilter.prototype.onSelection = function(value) {
    this.filterValue = value;
    this.params.filterChangedCallback();
};

CustomAgeFilter.prototype.getGui = function() {
    return this.eGui;
};

CustomAgeFilter.prototype.isFilterActive = function() {
    return this.filterValue !== null;
};

CustomAgeFilter.prototype.doesFilterPass = function() {
    // not needed for server side filtering
};

CustomAgeFilter.prototype.getModel = function() {
    if (this.filterValue===null) {
        return null;
    } else {
        // the format of what you return depends on your server side, just
        // return something that your server side can work with.
        return {
            filter: this.filterValue,
            type: "equals"
        };
    }
};

// not needed for this example
CustomAgeFilter.prototype.setModel = function(model) {
    if (model && model.filter===18) {
        this.eGui.querySelector('[ref="bt18"]').checked = true;
        this.filterValue = 18;
    } else if (model && model.filter===20) {
        this.eGui.querySelector('[ref="bt20"]').checked = true;
        this.filterValue = 20;
    } else {
        this.eGui.querySelector('[ref="btAll"]').checked = true;
        this.filterValue = null;
    }
};
