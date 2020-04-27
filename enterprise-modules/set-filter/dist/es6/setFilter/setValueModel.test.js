import { SetValueModel } from './setValueModel';
import { Constants } from '@ag-grid-community/core';
function createSetValueModel(values) {
    if (values === void 0) { values = ['A', 'B', 'C']; }
    var colDef = {};
    var rowModel = {
        getType: function () { return Constants.ROW_MODEL_TYPE_CLIENT_SIDE; },
        forEachLeafNode: function (callback) {
            var nodes = values.map(function (v) { return ({ data: v }); });
            nodes.forEach(callback);
        }
    };
    return new SetValueModel(colDef, rowModel, function (node) { return node.data; }, function (_) { return true; }, false, function (_) { }, null, null);
}
describe('isFilterActive', function () {
    it('returns false by default', function () {
        var model = createSetValueModel();
        expect(model.isFilterActive()).toBe(false);
    });
    it('returns true if any value is deselected', function () {
        var model = createSetValueModel();
        model.deselectValue('B');
        expect(model.isFilterActive()).toBe(true);
    });
    it('returns true if all values are deselected', function () {
        var model = createSetValueModel();
        model.selectNothing();
        expect(model.isFilterActive()).toBe(true);
    });
    it('returns false if value is deselected then selected again', function () {
        var model = createSetValueModel();
        var value = 'B';
        model.deselectValue(value);
        model.selectValue(value);
        expect(model.isFilterActive()).toBe(false);
    });
});
describe('value selection', function () {
    it('has all values selected by default', function () {
        var model = createSetValueModel();
        expect(model.isEverythingSelected()).toBe(true);
    });
    it('can change value selection', function () {
        var model = createSetValueModel();
        var value = 'A';
        expect(model.isValueSelected(value)).toBe(true);
        model.deselectValue(value);
        expect(model.isValueSelected(value)).toBe(false);
        model.selectValue(value);
        expect(model.isValueSelected(value)).toBe(true);
    });
});
