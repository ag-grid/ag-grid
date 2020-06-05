"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var setValueModel_1 = require("./setValueModel");
var core_1 = require("@ag-grid-community/core");
var mock_1 = require("../test-utils/mock");
function createSetValueModel(gridValues, filterParams, doesRowPassOtherFilters, suppressSorting) {
    if (gridValues === void 0) { gridValues = ['A', 'B', 'C']; }
    if (doesRowPassOtherFilters === void 0) { doesRowPassOtherFilters = function (_) { return true; }; }
    if (suppressSorting === void 0) { suppressSorting = false; }
    var colDef = { filterParams: filterParams };
    var rowModel = {
        getType: function () { return core_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE; },
        forEachLeafNode: function (callback) {
            var nodes = gridValues.map(function (v) { return ({ data: { value: v } }); });
            nodes.forEach(callback);
        }
    };
    var valueFormatterService = mock_1.mock('formatValue');
    valueFormatterService.formatValue.mockImplementation(function (_1, _2, _3, value) { return value; });
    return new setValueModel_1.SetValueModel(rowModel, colDef, null, function (node) { return node.data.value; }, doesRowPassOtherFilters, suppressSorting, function (_) { }, valueFormatterService, function (key) { return key === 'blanks' ? 'Blanks' : null; });
}
function getDisplayedValues(model) {
    var values = [];
    for (var i = 0; i < model.getDisplayedValueCount(); i++) {
        values.push(model.getDisplayedValue(i));
    }
    return values;
}
function delayAssert(done) {
    var assertions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        assertions[_i - 1] = arguments[_i];
    }
    setTimeout(function () { return asyncAssert.apply(void 0, __spreadArrays([done], assertions)); }, 0);
}
function asyncAssert(done) {
    var assertions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        assertions[_i - 1] = arguments[_i];
    }
    try {
        assertions.forEach(function (a) { return a(); });
        done();
    }
    catch (error) {
        done(error);
    }
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
        model.deselectAllMatchingMiniFilter();
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
        expect(model.isEverythingVisibleSelected()).toBe(true);
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
    it('keeps value selections when values are refreshed', function (done) {
        var model = createSetValueModel();
        var value = 'A';
        model.deselectValue(value);
        expect(model.isValueSelected(value)).toBe(false);
        model.refreshValues().then(function () {
            asyncAssert(done, function () { return expect(model.isValueSelected(value)).toBe(false); });
        });
    });
    it('can reset value selections when values are refreshed', function (done) {
        var model = createSetValueModel();
        var value = 'A';
        model.deselectValue(value);
        expect(model.isValueSelected(value)).toBe(false);
        model.refreshValues(false).then(function () {
            asyncAssert(done, function () { return expect(model.isValueSelected(value)).toBe(true); });
        });
    });
    it.each(['windows', 'mac'])('only uses visible values in set when first value is deselected in %s Excel mode', function (excelMode) {
        var values = ['A', 'B', 'C'];
        var doesRowPassOtherFilters = function (row) { return row.data.value != 'B'; };
        var model = createSetValueModel(values, { excelMode: excelMode }, doesRowPassOtherFilters);
        model.deselectValue('C');
        expect(model.getModel()).toStrictEqual(['A']);
    });
    it('uses all values in set when first value is deselected when not in Excel mode', function () {
        var values = ['A', 'B', 'C'];
        var doesRowPassOtherFilters = function (row) { return row.data.value != 'B'; };
        var model = createSetValueModel(values, undefined, doesRowPassOtherFilters);
        model.deselectValue('C');
        expect(model.getModel()).toStrictEqual(['A', 'B']);
    });
});
describe('overrideValues', function () {
    it('sets new values', function (done) {
        var model = createSetValueModel(['A1', 'B1', 'C1']);
        var values = ['A2', 'B2', 'C2'];
        model.overrideValues(values).then(function () {
            asyncAssert(done, function () { return expect(getDisplayedValues(model)).toStrictEqual(values); });
        });
    });
    it('updates values type to provided list', function (done) {
        var model = createSetValueModel(['A1', 'B1', 'C1']);
        var values = ['A2', 'B2', 'C2'];
        model.overrideValues(values).then(function () {
            asyncAssert(done, function () { return expect(model.getValuesType()).toBe(setValueModel_1.SetFilterModelValuesType.PROVIDED_LIST); });
        });
    });
    it('keeps existing selection', function (done) {
        var value = 'B1';
        var model = createSetValueModel(['A1', value, 'C1']);
        var values = ['A2', value, 'C2'];
        model.deselectValue(value);
        model.overrideValues(values).then(function () {
            asyncAssert(done, function () { return expect(model.isValueSelected(value)).toBe(false); });
        });
    });
    it('can reset existing selection', function (done) {
        var value = 'B1';
        var model = createSetValueModel(['A1', value, 'C1']);
        var values = ['A2', value, 'C2'];
        model.deselectValue(value);
        model.overrideValues(values, false).then(function () {
            asyncAssert(done, function () { return expect(model.isValueSelected(value)).toBe(true); });
        });
    });
});
describe('values from grid', function () {
    it('shows all values by default', function () {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values);
        expect(getDisplayedValues(model)).toStrictEqual(values);
    });
    it('only shows distinct values', function () {
        var values = ['A', 'B', 'A', 'B', 'C', 'A'];
        var model = createSetValueModel(values);
        expect(getDisplayedValues(model)).toStrictEqual(['A', 'B', 'C']);
    });
    it('sorts values alphabetically by default', function () {
        var model = createSetValueModel(['1', '5', '10', '50']);
        expect(getDisplayedValues(model)).toStrictEqual(['1', '10', '5', '50']);
    });
    it('can sort values using provided comparator', function () {
        var comparator = function (a, b) { return parseInt(a) - parseInt(b); };
        var model = createSetValueModel(['1', '10', '5', '50'], { comparator: comparator });
        expect(getDisplayedValues(model)).toStrictEqual(['1', '5', '10', '50']);
    });
    it('will preserve original order if sorting is suppressed', function () {
        var values = ['A', 'C', 'B', 'F', 'D'];
        var model = createSetValueModel(values, undefined, undefined, true);
        expect(getDisplayedValues(model)).toStrictEqual(values);
    });
    it('only shows values that pass other filters', function () {
        var value = 'B';
        var values = ['A', value, 'C'];
        var doesRowPassOtherFilters = function (row) { return row.data.value != value; };
        var model = createSetValueModel(values, undefined, doesRowPassOtherFilters);
        expect(getDisplayedValues(model)).toStrictEqual(['A', 'C']);
    });
    it('updates available values when refreshAfterAnyFilterChanged is called', function () {
        var value = 'B';
        var values = ['A', value, 'C'];
        var filteredValues = new Set(values);
        var doesRowPassOtherFilters = function (row) { return filteredValues.has(row.data.value); };
        var model = createSetValueModel(values, undefined, doesRowPassOtherFilters);
        expect(getDisplayedValues(model)).toStrictEqual(values);
        filteredValues.delete(value);
        model.refreshAfterAnyFilterChanged();
        expect(getDisplayedValues(model)).toStrictEqual(['A', 'C']);
    });
    it('shows all values regardless of whether they pass other filters if suppressRemoveEntries = true', function () {
        var value = 'B';
        var values = ['A', value, 'C'];
        var doesRowPassOtherFilters = function (row) { return row.data.value != value; };
        var model = createSetValueModel(values, { suppressRemoveEntries: true }, doesRowPassOtherFilters);
        expect(getDisplayedValues(model)).toStrictEqual(['A', 'B', 'C']);
    });
    it.each([undefined, null, ''])('turns "%s" into null entry', function (value) {
        var model = createSetValueModel([value]);
        expect(getDisplayedValues(model)).toStrictEqual([null]);
    });
    it('orders null first by default', function () {
        var values = ['A', 'B', null, 'C'];
        var model = createSetValueModel(values);
        expect(getDisplayedValues(model)).toStrictEqual([null, 'A', 'B', 'C']);
    });
    it.each(['windows', 'mac'])('orders null last in %s Excel Model', function (excelMode) {
        var values = ['A', 'B', null, 'C'];
        var model = createSetValueModel(values, { excelMode: excelMode });
        expect(getDisplayedValues(model)).toStrictEqual(['A', 'B', 'C', null]);
    });
    it('extracts multiple values into separate entries', function () {
        var model = createSetValueModel([['A', 'B'], ['A', undefined, 'C'], ['D', 'B', null], ['']]);
        expect(getDisplayedValues(model)).toStrictEqual([null, 'A', 'B', 'C', 'D']);
    });
});
describe('provided values list', function () {
    it('only shows distinct provided values', function () {
        var model = createSetValueModel(undefined, { values: ['A2', 'B2', 'C2', 'B2', 'C2'] });
        expect(getDisplayedValues(model)).toStrictEqual(['A2', 'B2', 'C2']);
    });
    it('sorts provided values alphabetically by default', function () {
        var model = createSetValueModel(undefined, { values: ['1', '5', '10', '50'] });
        expect(getDisplayedValues(model)).toStrictEqual(['1', '10', '5', '50']);
    });
    it('can sort provided values using provided comparator', function () {
        var comparator = function (a, b) { return parseInt(a) - parseInt(b); };
        var model = createSetValueModel(undefined, { values: ['1', '10', '5', '50'], comparator: comparator });
        expect(getDisplayedValues(model)).toStrictEqual(['1', '5', '10', '50']);
    });
    it('will preserve original provided order if sorting is suppressed', function () {
        var values = ['A', 'C', 'B', 'F', 'D'];
        var model = createSetValueModel(undefined, { values: values }, undefined, true);
        expect(getDisplayedValues(model)).toStrictEqual(values);
    });
    it('always shows all provided values regardless of whether they pass other filters', function () {
        var value = 'B';
        var values = ['A', value, 'C'];
        var doesRowPassOtherFilters = function (row) { return row.data.value != value; };
        var model = createSetValueModel(undefined, { values: values }, doesRowPassOtherFilters);
        expect(getDisplayedValues(model)).toStrictEqual(['A', 'B', 'C']);
    });
});
describe('provided callback values', function () {
    it('only shows distinct provided callback values', function (done) {
        var model = createSetValueModel(undefined, { values: function (params) { return params.success(['A2', 'B2', 'C2', 'B2', 'C2']); } });
        delayAssert(done, function () { return expect(getDisplayedValues(model)).toStrictEqual(['A2', 'B2', 'C2']); });
    });
    it('sorts provided callback values alphabetically by default', function (done) {
        var model = createSetValueModel(undefined, { values: function (params) { return params.success(['1', '5', '10', '50']); } });
        delayAssert(done, function () { return expect(getDisplayedValues(model)).toStrictEqual(['1', '10', '5', '50']); });
    });
    it('can sort provided callback values using provided comparator', function (done) {
        var comparator = function (a, b) { return parseInt(a) - parseInt(b); };
        var model = createSetValueModel(undefined, { values: function (params) { return params.success(['1', '10', '5', '50']); }, comparator: comparator });
        delayAssert(done, function () { return expect(getDisplayedValues(model)).toStrictEqual(['1', '5', '10', '50']); });
    });
    it('will preserve original provided order from callback if sorting is suppressed', function (done) {
        var values = ['A', 'C', 'B', 'F', 'D'];
        var model = createSetValueModel(undefined, { values: function (params) { return params.success(values); } }, undefined, true);
        delayAssert(done, function () { return expect(getDisplayedValues(model)).toStrictEqual(values); });
    });
    it('always shows all provided callback values regardless of whether they pass other filters', function (done) {
        var value = 'B';
        var values = ['A', value, 'C'];
        var doesRowPassOtherFilters = function (row) { return row.data.value != value; };
        var model = createSetValueModel(undefined, { values: function (params) { return params.success(values); } }, doesRowPassOtherFilters);
        delayAssert(done, function () { return expect(getDisplayedValues(model)).toStrictEqual(['A', 'B', 'C']); });
    });
});
describe('mini filter', function () {
    it('sets mini filter text', function () {
        var miniFilterText = 'foo';
        var model = createSetValueModel();
        model.setMiniFilter(miniFilterText);
        expect(model.getMiniFilter()).toBe(miniFilterText);
    });
    it('returns true if mini filter text has changed', function () {
        var model = createSetValueModel();
        expect(model.setMiniFilter('foo')).toBe(true);
    });
    it('returns false if mini filter text has not changed', function () {
        var model = createSetValueModel();
        var miniFilterText = 'foo';
        model.setMiniFilter(miniFilterText);
        expect(model.setMiniFilter(miniFilterText)).toBe(false);
    });
    it.each([undefined, null, ''])('turns "%s" to null value', function (value) {
        var model = createSetValueModel();
        model.setMiniFilter(value);
        expect(model.getMiniFilter()).toBeNull();
    });
    it('updates displayed values to only show those that match, ignoring case', function () {
        var expectedValues = ['foo', 'fooA', 'Bfoo', 'DfooD', 'FoOE'];
        var values = __spreadArrays(['A', 'B', 'foCo'], expectedValues, ['F', 'G']);
        var model = createSetValueModel(values, undefined, undefined, true);
        model.setMiniFilter('foo');
        expect(getDisplayedValues(model)).toStrictEqual(expectedValues);
        model.setMiniFilter('FOO');
        expect(getDisplayedValues(model)).toStrictEqual(expectedValues);
    });
    it('resets to show all values if mini filter is removed', function () {
        var value = 'foo';
        var values = ['A', 'B', value, 'C', 'D'];
        var model = createSetValueModel(values, undefined, undefined, true);
        model.setMiniFilter(value);
        model.setMiniFilter(null);
        expect(getDisplayedValues(model)).toStrictEqual(values);
    });
    it('shows nothing if no values match', function () {
        var values = ['A', 'B', 'C', 'D'];
        var model = createSetValueModel(values);
        model.setMiniFilter('foo');
        expect(getDisplayedValues(model)).toStrictEqual([]);
    });
    it('does not show Blanks entry if mini filter matches', function () {
        var values = ['A', null, 'B'];
        var model = createSetValueModel(values);
        model.setMiniFilter('bla');
        expect(getDisplayedValues(model)).toStrictEqual([]);
    });
    it.each(['windows', 'mac'])('shows Blanks entry if mini filter matches in %s Excel mode', function (excelMode) {
        var values = ['A', null, 'B'];
        var model = createSetValueModel(values, { excelMode: excelMode });
        model.setMiniFilter('bla');
        expect(getDisplayedValues(model)).toStrictEqual([null]);
    });
});
describe('selectAllMatchingMiniFilter', function () {
    it('selects all values if no mini filter', function () {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.deselectValue(v); });
        model.selectAllMatchingMiniFilter();
        values.forEach(function (v) { return expect(model.isValueSelected(v)).toBe(true); });
    });
    it('selects all values that match mini filter', function () {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values);
        model.deselectValue('B');
        model.deselectValue('C');
        model.setMiniFilter('B');
        model.selectAllMatchingMiniFilter();
        expect(model.isValueSelected('A')).toBe(true);
        expect(model.isValueSelected('B')).toBe(true);
        expect(model.isValueSelected('C')).toBe(false);
    });
    it.each([undefined, 'windows', 'mac'])('selects all values that match mini filter, replacing existing selection if requested, for excelMode = %s', function (excelMode) {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values, { excelMode: excelMode });
        model.deselectValue('B');
        model.deselectValue('C');
        model.setMiniFilter('B');
        model.selectAllMatchingMiniFilter(true);
        expect(model.isValueSelected('A')).toBe(false);
        expect(model.isValueSelected('B')).toBe(true);
        expect(model.isValueSelected('C')).toBe(false);
    });
});
describe('deselectAllMatchingMiniFilter', function () {
    it('deselects all values if no mini filter', function () {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values);
        model.deselectAllMatchingMiniFilter();
        values.forEach(function (v) { return expect(model.isValueSelected(v)).toBe(false); });
    });
    it.each([undefined, 'windows', 'mac'])('deselects all values that match mini filter, for excelMode = %s', function (excelMode) {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values, { excelMode: excelMode });
        model.deselectValue('C');
        model.setMiniFilter('B');
        model.deselectAllMatchingMiniFilter();
        expect(model.isValueSelected('A')).toBe(true);
        expect(model.isValueSelected('B')).toBe(false);
        expect(model.isValueSelected('C')).toBe(false);
    });
});
describe('isEverythingVisibleSelected', function () {
    it('returns true if all values are selected', function () {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.selectValue(v); });
        expect(model.isEverythingVisibleSelected()).toBe(true);
    });
    it('returns false if any values are not selected', function () {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values);
        model.deselectValue('B');
        expect(model.isEverythingVisibleSelected()).toBe(false);
    });
    it('returns true if everything that matches mini filter is selected', function () {
        var value = 'B';
        var values = ['A', value, 'C'];
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.deselectValue(v); });
        model.selectValue(value);
        model.setMiniFilter(value);
        expect(model.isEverythingVisibleSelected()).toBe(true);
    });
    it('returns true if any values that match mini filter are not selected', function () {
        var values = ['A', 'fooB', 'Cfoo'];
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.deselectValue(v); });
        model.selectValue('fooB');
        model.setMiniFilter('foo');
        expect(model.isEverythingVisibleSelected()).toBe(false);
    });
});
describe('isNothingVisibleSelected', function () {
    it('returns true if no values are selected', function () {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.deselectValue(v); });
        expect(model.isNothingVisibleSelected()).toBe(true);
    });
    it('returns false if any values are selected', function () {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.deselectValue(v); });
        model.selectValue('B');
        expect(model.isNothingVisibleSelected()).toBe(false);
    });
    it('returns true if everything that matches mini filter is not selected', function () {
        var values = ['A', 'B', 'C'];
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.deselectValue(v); });
        model.selectValue('A');
        model.setMiniFilter('B');
        expect(model.isNothingVisibleSelected()).toBe(true);
    });
    it('returns false if any values that match mini filter are selected', function () {
        var values = ['A', 'fooB', 'Cfoo'];
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.deselectValue(v); });
        model.selectValue('fooB');
        model.setMiniFilter('foo');
        expect(model.isNothingVisibleSelected()).toBe(false);
    });
});
describe('getModel', function () {
    it('returns null if filter is not active', function () {
        var model = createSetValueModel();
        expect(model.getModel()).toBe(null);
    });
    it('returns selected values if filter is active', function () {
        var expectedValues = ['B', 'C'];
        var values = __spreadArrays(['A'], expectedValues, ['D', 'E']);
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.deselectValue(v); });
        expectedValues.forEach(function (v) { return model.selectValue(v); });
        expect(model.getModel()).toStrictEqual(expectedValues);
    });
});
describe('setModel', function () {
    it('exclusively selects provided values', function (done) {
        var expectedValues = ['A', 'B'];
        var otherValues = ['C', 'D', 'E'];
        var model = createSetValueModel(__spreadArrays(expectedValues, otherValues));
        model.setModel(expectedValues).then(function () {
            asyncAssert(done, function () { return expectedValues.forEach(function (v) { return expect(model.isValueSelected(v)).toBe(true); }); }, function () { return otherValues.forEach(function (v) { return expect(model.isValueSelected(v)).toBe(false); }); });
        });
    });
    it('selects all values if provided model is null', function (done) {
        var values = ['A', 'B', 'C', 'D', 'E'];
        var model = createSetValueModel(values);
        values.forEach(function (v) { return model.deselectValue(v); });
        model.setModel(null).then(function () {
            asyncAssert(done, function () { return values.forEach(function (v) { return expect(model.isValueSelected(v)).toBe(true); }); });
        });
    });
});
//# sourceMappingURL=setValueModel.test.js.map