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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0RmlsdGVyTW9kZWxGb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2V0RmlsdGVyL3NldEZpbHRlck1vZGVsRm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBO0lBQUE7SUFnQkEsQ0FBQztJQWZVLGtEQUFnQixHQUF2QixVQUEyQixLQUF3QyxFQUFFLFNBQXVCO1FBQ2hGLElBQUEsTUFBTSxHQUFLLENBQUEsS0FBSyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUEsT0FBeEMsQ0FBeUM7UUFDdkQsSUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRTdDLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO1lBQ3RDLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDO1FBQ3ZFLElBQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7UUFFdkMsSUFBTSxlQUFlLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsU0FBUyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFoQyxDQUFnQyxDQUFDLENBQUM7UUFFaEcsT0FBTyxNQUFJLFNBQVMsVUFBSyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFHLFNBQVMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDeEYsQ0FBQztJQUNMLDhCQUFDO0FBQUQsQ0FBQyxBQWhCRCxJQWdCQyJ9