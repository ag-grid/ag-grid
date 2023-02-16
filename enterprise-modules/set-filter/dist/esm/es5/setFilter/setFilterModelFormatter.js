var SetFilterModelFormatter = /** @class */ (function () {
    function SetFilterModelFormatter() {
    }
    SetFilterModelFormatter.prototype.getModelAsString = function (model, setFilter) {
        var values = (model || setFilter.getModel() || {}).values;
        var valueModel = setFilter.getValueModel();
        if (values == null || valueModel == null) {
            return '';
        }
        var availableKeys = values.filter(function (v) { return valueModel.isKeyAvailable(v); });
        var numValues = availableKeys.length;
        var formattedValues = availableKeys.slice(0, 10).map(function (key) { return setFilter.getFormattedValue(key); });
        return "(" + numValues + ") " + formattedValues.join(',') + (numValues > 10 ? ',...' : '');
    };
    return SetFilterModelFormatter;
}());
export { SetFilterModelFormatter };
