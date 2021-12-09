import { SetValueModel, SetFilterModelValuesType } from './setValueModel';
import { Constants, RowNode, IClientSideRowModel, ValueFormatterService, ISetFilterParams, ValueFormatterFunc } from '@ag-grid-community/core';
import { mock } from '../test-utils/mock';

type ValueType = string | number | boolean | Date;

const DEFAULT_OPTS = {
    values: ['A', 'B', 'C'] as ValueType[] | ValueType[][],
    filterParams: {} as any,
    doesRowPassOtherFilters: _ => true,
    suppressSorting: false,
    simulateCaseSensitivity: false,
};

type ValueTestCase<T> = {
    values: T[],
    distinctValues: string[],
    distinctCaseInsensitiveValues?: T[],
    valueFormatter?: ValueFormatterFunc,
};
const EXAMPLE_DATE_1 = new Date(2021, 0, 1);
const EXAMPLE_DATE_2 = new Date(2021, 1, 1);
const VALUE_TEST_CASES: {[key: string]: ValueTestCase<ValueType>} = {
    number: {
        values: [1, 2, 3, 4, 3, 3, 2, 1, null, undefined],
        distinctValues: [null, '1', '2', '3', '4'],
    } as ValueTestCase<number>,
    boolean: {
        values: [true, false, true, true, false, null, undefined],
        distinctValues: [null, 'false', 'true'],
    } as ValueTestCase<boolean>,
    string: {
        values: ['A', 'B', 'a', 'b', 'C', 'A', null, undefined, ''],
        distinctValues: [null, 'A', 'B', 'C', 'a', 'b'],
        distinctCaseInsensitiveValues: [null, 'A', 'B', 'C'],
    } as ValueTestCase<string>,
    date: {
        values: [EXAMPLE_DATE_1, EXAMPLE_DATE_1, EXAMPLE_DATE_2, null, undefined],
        // _.toStringOrNull() is used in the implementation, so the expected strings are environment local/TZ specific :P
        distinctValues: [null, EXAMPLE_DATE_1.toString(), EXAMPLE_DATE_2.toString()],
    } as ValueTestCase<Date>,
};
const VALUE_TEST_CASE_KEYS = Object.keys(VALUE_TEST_CASES);

function createSetValueModel(opts: Partial<typeof DEFAULT_OPTS> = DEFAULT_OPTS) {
    const { values, filterParams, doesRowPassOtherFilters, suppressSorting, simulateCaseSensitivity} = { ...DEFAULT_OPTS, ...opts };

    const rowModel = {
        getType: () => Constants.ROW_MODEL_TYPE_CLIENT_SIDE,
        forEachLeafNode: (callback: (node: RowNode) => void) => {
            for (const value of values) {
                callback(({ data: { value } } as any));
            }
        }
    } as IClientSideRowModel;

    const valueFormatterService = mock<ValueFormatterService>('formatValue');
    valueFormatterService.formatValue.mockImplementation((_1, _2, _3, value) => value);

    const svmParams: ISetFilterParams = {
        rowModel,
        valueGetter: ({node}) => node.data.value,
        colDef: {},
        doesRowPassOtherFilter: doesRowPassOtherFilters,
        suppressSorting,
        ...filterParams,
    };

    const caseFormatFn = simulateCaseSensitivity ?
        v => v : (v) => typeof v === 'string' ? v.toUpperCase() : v;

    return new SetValueModel(
        svmParams,
        _ => { },
        valueFormatterService,
        key => key === 'blanks' ? '(Blanks)' : '',
        caseFormatFn,
    );
}

function getDisplayedValues(model: SetValueModel) {
    const values: (string | null)[] = [];

    for (let i = 0; i < model.getDisplayedValueCount(); i++) {
        values.push(model.getDisplayedValue(i));
    }

    return values;
}

function delayAssert(done: (error?: Error) => void, ...assertions: (() => void)[]) {
    setTimeout(() => asyncAssert(done, ...assertions), 0);
}

function asyncAssert(done: (error?: Error) => void, ...assertions: (() => void)[]) {
    try {
        assertions.forEach(a => a());
        done();
    } catch (error) {
        done(error);
    }
}

describe('SetValueModel', () => {
    let model: SetValueModel;

    describe('hasSelections', () => {
        describe('everything selected is the default', () => {
            beforeEach(() => {
                model = createSetValueModel();
            });

            it('returns false by default', () => {
                expect(model.hasSelections()).toBe(false);
            });

            it('returns true if any value is deselected', () => {
                model.deselectValue('B');

                expect(model.hasSelections()).toBe(true);
            });

            it('returns true if all values are deselected', () => {
                model.deselectAllMatchingMiniFilter();

                expect(model.hasSelections()).toBe(true);
            });

            it('returns false if value is deselected then selected again', () => {
                const value = 'B';

                model.deselectValue(value);
                model.selectValue(value);

                expect(model.hasSelections()).toBe(false);
            });
        });

        describe('nothing selected is the default', () => {
            beforeEach(() => {
                model = model = createSetValueModel({filterParams: { defaultToNothingSelected: true }});
            })

            it('returns false by default', () => {
                expect(model.hasSelections()).toBe(false);
            });

            it('returns true if any value is selected', () => {
                model.selectValue('B');

                expect(model.hasSelections()).toBe(true);
            });

            it('returns true if all values are selected', () => {
                model.selectAllMatchingMiniFilter();

                expect(model.hasSelections()).toBe(true);
            });

            it('returns false if value is selected then deselected again', () => {
                const value = 'B';

                model.selectValue(value);
                model.deselectValue(value);

                expect(model.hasSelections()).toBe(false);
            });
        });
    });

    describe('value selection', () => {
        beforeEach(() => {
            model = createSetValueModel();
        });

        it('has all values selected by default', () => {
            expect(model.isEverythingVisibleSelected()).toBe(true);
        });

        it('can change value selection', () => {
            const value = 'A';

            expect(model.isValueSelected(value)).toBe(true);

            model.deselectValue(value);

            expect(model.isValueSelected(value)).toBe(false);

            model.selectValue(value);

            expect(model.isValueSelected(value)).toBe(true);
        });

        it('keeps value selections when values are refreshed', done => {
            const value = 'A';

            model.deselectValue(value);

            expect(model.isValueSelected(value)).toBe(false);

            model.refreshValues().then(() => {
                asyncAssert(done, () => expect(model.isValueSelected(value)).toBe(false));
            });
        });

        it.each(['windows', 'mac'])('only uses visible values in set when first value is deselected in %s Excel mode', excelMode => {
            const values = ['A', 'B', 'C'];
            const doesRowPassOtherFilters = (row: RowNode) => row.data.value != 'B';
            model = createSetValueModel({ values, filterParams: { excelMode }, doesRowPassOtherFilters });

            model.deselectValue('C');

            expect(model.getModel()).toStrictEqual(['A']);
        });

        it('uses all values in set when first value is deselected when not in Excel mode', () => {
            const values = ['A', 'B', 'C'];
            const doesRowPassOtherFilters = (row: RowNode) => row.data.value != 'B';
            model = createSetValueModel({ values, doesRowPassOtherFilters });

            model.deselectValue('C');

            expect(model.getModel()).toStrictEqual(['A', 'B']);
        });
    });

    describe('overrideValues', () => {
        const value = 'B1';

        beforeEach(() => {
            model = createSetValueModel({ values: ['A1', value, 'C1'] });
        });

        it('sets new values', done => {
            const values = ['A2', 'B2', 'C2'];

            model.overrideValues(values).then(() => {
                asyncAssert(done, () => expect(getDisplayedValues(model)).toStrictEqual(values));
            });
        });

        it('updates values type to provided list', done => {
            const values = ['A2', 'B2', 'C2'];

            model.overrideValues(values).then(() => {
                asyncAssert(done, () => expect(model.getValuesType()).toBe(SetFilterModelValuesType.PROVIDED_LIST));
            });
        });

        it('keeps existing deselection', done => {
            const values = ['A2', value, 'C2'];

            model.deselectValue(value);
            model.overrideValues(values).then(() => {
                asyncAssert(done, () => expect(model.isValueSelected(value)).toBe(false));
            });
        });

        it('keeps existing selection (case-insensitive)', done => {
            const lowerCaseValue = 'b1';
            const values = ['A2', lowerCaseValue, 'C2'];

            model.overrideValues(values).then(() => {
                asyncAssert(done, () => {
                    expect(model.isValueSelected(lowerCaseValue)).toBe(true)
                    expect(model.isValueSelected(value)).toBe(false)
                });
            });
        });

        it('keeps existing deselection (case-insensitive)', done => {
            const lowerCaseValue = 'b1';
            const values = ['A2', lowerCaseValue, 'C2'];

            model.deselectValue(value);
            model.overrideValues(values).then(() => {
                asyncAssert(done, () => {
                    expect(model.isValueSelected(lowerCaseValue)).toBe(false)
                    expect(model.isValueSelected(value)).toBe(false)
                });
            });
        });
    });

    describe('values from grid', () => {
        it('shows all values by default', () => {
            const values = ['A', 'B', 'C'];
            model = createSetValueModel({values});

            expect(getDisplayedValues(model)).toStrictEqual(values);
        });

        it('only shows distinct values', () => {
            const values = ['A', 'B', 'A', 'B', 'C', 'A'];
            model = createSetValueModel({values});

            expect(getDisplayedValues(model)).toStrictEqual(['A', 'B', 'C']);
        });

        it.each(VALUE_TEST_CASE_KEYS)('only shows distinct %s values (case-insensitive)', (key) => {
            const { values } = VALUE_TEST_CASES[key];
            model = createSetValueModel({values, simulateCaseSensitivity: false});

            const expectedValues = VALUE_TEST_CASES[key].distinctCaseInsensitiveValues || VALUE_TEST_CASES[key].distinctValues;
            expect(getDisplayedValues(model)).toStrictEqual(expectedValues);
        });

        it.each(VALUE_TEST_CASE_KEYS)('only shows distinct %s values (case-sensitive)', (key) => {
            const { values } = VALUE_TEST_CASES[key];
            model = createSetValueModel({values, simulateCaseSensitivity: true});

            const expectedValues = VALUE_TEST_CASES[key].distinctValues;
            expect(getDisplayedValues(model)).toStrictEqual(expectedValues);
        });

        it('sorts values alphabetically by default', () => {
            model = createSetValueModel({ values: ['1', '5', '10', '50']});

            expect(getDisplayedValues(model)).toStrictEqual(['1', '10', '5', '50']);
        });

        it('can sort values using provided comparator', () => {
            const comparator = (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10);
            model = createSetValueModel({ values: ['1', '10', '5', '50'], filterParams: { comparator }});

            expect(getDisplayedValues(model)).toStrictEqual(['1', '5', '10', '50']);
        });

        it('will preserve original order if sorting is suppressed', () => {
            const values = ['A', 'C', 'B', 'F', 'D'];
            model = createSetValueModel({values, suppressSorting: true});

            expect(getDisplayedValues(model)).toStrictEqual(values);
        });

        it('only shows values that pass other filters', () => {
            const value = 'B';
            const values = ['A', value, 'C'];
            const doesRowPassOtherFilters = (row: RowNode) => row.data.value != value;
            model = createSetValueModel({values, doesRowPassOtherFilters});

            expect(getDisplayedValues(model)).toStrictEqual(['A', 'C']);
        });

        it('updates available values when refreshAfterAnyFilterChanged is called', () => {
            const value = 'B';
            const values = ['A', value, 'C'];
            const filteredValues = new Set<string>(values);
            const doesRowPassOtherFilters = (row: RowNode) => filteredValues.has(row.data.value);
            model = createSetValueModel({values, doesRowPassOtherFilters});

            expect(getDisplayedValues(model)).toStrictEqual(values);

            filteredValues.delete(value);

            model.refreshAfterAnyFilterChanged();

            expect(getDisplayedValues(model)).toStrictEqual(['A', 'C']);
        });

        it.each([undefined, null, ''])('turns "%s" into null entry', value => {
            model = createSetValueModel({values: [value]});

            expect(getDisplayedValues(model)).toStrictEqual([null]);
        });

        it('orders null first by default', () => {
            const values = ['A', 'B', null, 'C'];
            model = createSetValueModel({values});

            expect(getDisplayedValues(model)).toStrictEqual([null, 'A', 'B', 'C']);
        });

        it.each(['windows', 'mac'])('orders null last in %s Excel Model', excelMode => {
            const values = ['A', 'B', null, 'C'];
            model = createSetValueModel({values, filterParams: { excelMode }});

            expect(getDisplayedValues(model)).toStrictEqual(['A', 'B', 'C', null]);
        });

        it('extracts multiple values into separate entries', () => {
            model = createSetValueModel({ values: [['A', 'B'], ['A', undefined, 'C'], ['D', 'B', null], ['']]});

            expect(getDisplayedValues(model)).toStrictEqual([null, 'A', 'B', 'C', 'D']);
        });

        it('extracts multiple values into separate entries (case-insensitive)', () => {
            model = createSetValueModel({
                values: [['A', 'B'], ['a', undefined, 'c'], ['D', 'b', null], ['']],
                simulateCaseSensitivity: false,
            });

            expect(getDisplayedValues(model)).toStrictEqual([null, 'A', 'B', 'D', 'c']);
        });

        it('extracts multiple values into separate entries (case-sensitive)', () => {
            model = createSetValueModel({
                values: [['A', 'B'], ['a', undefined, 'c'], ['D', 'b', null], ['']],
                simulateCaseSensitivity: true,
            });

            expect(getDisplayedValues(model)).toStrictEqual([null, 'A', 'B', 'D', 'a', 'b', 'c']);
        });
    });

    describe('provided values list', () => {
        it('only shows distinct provided values', () => {
            model = createSetValueModel({filterParams: { values: ['A2', 'B2', 'C2', 'B2', 'C2'] }});

            expect(getDisplayedValues(model)).toStrictEqual(['A2', 'B2', 'C2']);
        });

        it.each(VALUE_TEST_CASE_KEYS)('only shows distinct %s values (case-insensitive)', (key) => {
            const { values } = VALUE_TEST_CASES[key];
            model = createSetValueModel({filterParams: {values}, simulateCaseSensitivity: false});

            const expectedValues = VALUE_TEST_CASES[key].distinctCaseInsensitiveValues || VALUE_TEST_CASES[key].distinctValues;
            expect(getDisplayedValues(model)).toStrictEqual(expectedValues);
        });

        it.each(VALUE_TEST_CASE_KEYS)('only shows distinct %s values (case-sensitive)', (key) => {
            const { values } = VALUE_TEST_CASES[key];
            model = createSetValueModel({filterParams: {values}, simulateCaseSensitivity: true});

            const expectedValues = VALUE_TEST_CASES[key].distinctValues;
            expect(getDisplayedValues(model)).toStrictEqual(expectedValues);
        });

        it('sorts provided values alphabetically by default', () => {
            model = createSetValueModel({filterParams: { values: ['1', '5', '10', '50'] }});

            expect(getDisplayedValues(model)).toStrictEqual(['1', '10', '5', '50']);
        });

        it('can sort provided values using provided comparator', () => {
            const comparator = (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10);
            model = createSetValueModel({filterParams: { values: ['1', '10', '5', '50'], comparator }});

            expect(getDisplayedValues(model)).toStrictEqual(['1', '5', '10', '50']);
        });

        it('will preserve original provided order if sorting is suppressed', () => {
            const values = ['A', 'C', 'B', 'F', 'D'];
            model = createSetValueModel({filterParams: { values }, suppressSorting: true});

            expect(getDisplayedValues(model)).toStrictEqual(values);
        });

        it('always shows all provided values regardless of whether they pass other filters', () => {
            const value = 'B';
            const values = ['A', value, 'C'];
            const doesRowPassOtherFilters = (row: RowNode) => row.data.value != value;
            model = createSetValueModel({filterParams: { values }, doesRowPassOtherFilters});

            expect(getDisplayedValues(model)).toStrictEqual(['A', 'B', 'C']);
        });
    });

    describe('provided callback values', () => {
        it('only shows distinct provided callback values', done => {
            model = createSetValueModel({filterParams: { values: (params: any) => params.success(['A2', 'B2', 'C2', 'B2', 'C2']) }});

            delayAssert(done, () => expect(getDisplayedValues(model)).toStrictEqual(['A2', 'B2', 'C2']));
        });

        for (const key of VALUE_TEST_CASE_KEYS) {
            it('only shows distinct %s provided callback values (case-insensitive)', (done) => {
                const { values } = VALUE_TEST_CASES[key];
                model = createSetValueModel({
                    filterParams: { values: (params: any) => params.success(values) },
                    simulateCaseSensitivity: false,
                });

                const expectedValues = VALUE_TEST_CASES[key].distinctCaseInsensitiveValues || VALUE_TEST_CASES[key].distinctValues;
                delayAssert(done, () => expect(getDisplayedValues(model)).toStrictEqual(expectedValues));
            });

            it('only shows distinct %s provided callback values (case-sensitive)', (done) => {
                const { values } = VALUE_TEST_CASES[key];
                model = createSetValueModel({
                    filterParams: { values: (params: any) => params.success(values) },
                    simulateCaseSensitivity: true,
                });

                const expectedValues = VALUE_TEST_CASES[key].distinctValues;
                delayAssert(done, () => expect(getDisplayedValues(model)).toStrictEqual(expectedValues));
            });
        }

        it('sorts provided callback values alphabetically by default', done => {
            model = createSetValueModel({filterParams: { values: (params: any) => params.success(['1', '5', '10', '50']) }});

            delayAssert(done, () => expect(getDisplayedValues(model)).toStrictEqual(['1', '10', '5', '50']));
        });

        it('can sort provided callback values using provided comparator', done => {
            const comparator = (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10);
            model = createSetValueModel({filterParams: { values: (params: any) => params.success(['1', '10', '5', '50']), comparator }});

            delayAssert(done, () => expect(getDisplayedValues(model)).toStrictEqual(['1', '5', '10', '50']));
        });

        it('will preserve original provided order from callback if sorting is suppressed', done => {
            const values = ['A', 'C', 'B', 'F', 'D'];
            model = createSetValueModel({filterParams: { values: (params: any) => params.success(values) }, suppressSorting: true});

            delayAssert(done, () => expect(getDisplayedValues(model)).toStrictEqual(values));
        });

        it('always shows all provided callback values regardless of whether they pass other filters', done => {
            const value = 'B';
            const values = ['A', value, 'C'];
            const doesRowPassOtherFilters = (row: RowNode) => row.data.value != value;
            model = createSetValueModel({ filterParams: { values: (params: any) => params.success(values) }, doesRowPassOtherFilters});

            delayAssert(done, () => expect(getDisplayedValues(model)).toStrictEqual(['A', 'B', 'C']));
        });
    });

    describe('mini filter', () => {
        beforeEach(() => {
            model = createSetValueModel();
        });

        it('sets mini filter text', () => {
            const miniFilterText = 'foo';

            model.setMiniFilter(miniFilterText);

            expect(model.getMiniFilter()).toBe(miniFilterText);
        });

        it('returns true if mini filter text has changed', () => {
            expect(model.setMiniFilter('foo')).toBe(true);
        });

        it('returns false if mini filter text has not changed', () => {
            const miniFilterText = 'foo';

            model.setMiniFilter(miniFilterText);

            expect(model.setMiniFilter(miniFilterText)).toBe(false);
        });

        it.each([undefined, null, ''])('turns "%s" to null value', value => {
            model.setMiniFilter(value);

            expect(model.getMiniFilter()).toBeNull();
        });

        it('updates displayed values to only show those that match (case-insensitive)', () => {
            const expectedValues = ['foo', 'fooA', 'Bfoo', 'DfooD', 'FoOE'];
            const values = ['A', 'B', 'foCo', ...expectedValues, 'F', 'G'];
            model = createSetValueModel({values, suppressSorting: true, simulateCaseSensitivity: false});

            model.setMiniFilter('foo');

            expect(getDisplayedValues(model)).toStrictEqual(expectedValues);

            model.setMiniFilter('FOO');

            expect(getDisplayedValues(model)).toStrictEqual(expectedValues);
        });

        it('updates displayed values to only show those that match (case-sensitive)', () => {
            const expectedValues1 = ['foo', 'fooA', 'Bfoo', 'DfooD'];
            const expectedValues2 = ['FOO', 'FOOA', 'BFOO', 'DFOOD'];
            const values = ['A', 'B', 'foCo', ...expectedValues1, ...expectedValues2, 'FoOE', 'F', 'G'];
            model = createSetValueModel({values, suppressSorting: true, simulateCaseSensitivity: true});

            model.setMiniFilter('foo');

            expect(getDisplayedValues(model)).toStrictEqual(expectedValues1);

            model.setMiniFilter('FOO');

            expect(getDisplayedValues(model)).toStrictEqual(expectedValues2);
        });

        it('resets to show all values if mini filter is removed', () => {
            const value = 'foo';
            const values = ['A', 'B', value, 'C', 'D'];
            model = createSetValueModel({values, suppressSorting: true});

            model.setMiniFilter(value);
            model.setMiniFilter(null);

            expect(getDisplayedValues(model)).toStrictEqual(values);
        });

        it('shows nothing if no values match', () => {
            const values = ['A', 'B', 'C', 'D'];
            model = createSetValueModel({values});

            model.setMiniFilter('foo');

            expect(getDisplayedValues(model)).toStrictEqual([]);
        });

        it('does not show Blanks entry if mini filter matches', () => {
            const values = ['A', null, 'B'];
            model = createSetValueModel({values});

            model.setMiniFilter('bla');

            expect(getDisplayedValues(model)).toStrictEqual([]);
        });

        it.each(['windows', 'mac'])('shows Blanks entry if mini filter matches in %s Excel mode', excelMode => {
            const values = ['A', null, 'B'];
            model = createSetValueModel({values, filterParams: { excelMode }});

            model.setMiniFilter('bla');

            expect(getDisplayedValues(model)).toStrictEqual([null]);
        });
    });

    describe('selectAllMatchingMiniFilter', () => {
        const values = ['A', 'B', 'C'];

        beforeEach(() => {
            model = createSetValueModel({values});
        });

        it('selects all values if no mini filter', () => {
            values.forEach(v => model.deselectValue(v));

            model.selectAllMatchingMiniFilter();

            values.forEach(v => expect(model.isValueSelected(v)).toBe(true));
        });

        it('selects all values that match mini filter', () => {
            model.deselectValue('B');
            model.deselectValue('C');
            model.setMiniFilter('B');
            model.selectAllMatchingMiniFilter();

            expect(model.isValueSelected('A')).toBe(true);
            expect(model.isValueSelected('B')).toBe(true);
            expect(model.isValueSelected('C')).toBe(false);
        });

        it.each([undefined, 'windows', 'mac'])('selects all values that match mini filter, replacing existing selection if requested, for excelMode = %s', excelMode => {
            model = createSetValueModel({values, filterParams: { excelMode }});

            model.deselectValue('B');
            model.deselectValue('C');
            model.setMiniFilter('B');
            model.selectAllMatchingMiniFilter(true);

            expect(model.isValueSelected('A')).toBe(false);
            expect(model.isValueSelected('B')).toBe(true);
            expect(model.isValueSelected('C')).toBe(false);
        });
    });

    describe('deselectAllMatchingMiniFilter', () => {
        const values = ['A', 'B', 'C'];

        beforeEach(() => {
            model = createSetValueModel({values});
        });

        it('deselects all values if no mini filter', () => {
            model.deselectAllMatchingMiniFilter();

            values.forEach(v => expect(model.isValueSelected(v)).toBe(false));
        });

        it.each([undefined, 'windows', 'mac'])('deselects all values that match mini filter, for excelMode = %s', excelMode => {
            model = createSetValueModel({values, filterParams: { excelMode }});

            model.deselectValue('C');
            model.setMiniFilter('B');
            model.deselectAllMatchingMiniFilter();

            expect(model.isValueSelected('A')).toBe(true);
            expect(model.isValueSelected('B')).toBe(false);
            expect(model.isValueSelected('C')).toBe(false);
        });
    });

    describe('isEverythingVisibleSelected', () => {
        const values = ['A', 'B', 'C'];

        beforeEach(() => {
            model = createSetValueModel({values});
        });

        it('returns true if all values are selected', () => {
            values.forEach(v => model.selectValue(v));

            expect(model.isEverythingVisibleSelected()).toBe(true);
        });

        it('returns false if any values are not selected', () => {
            model.deselectValue('B');

            expect(model.isEverythingVisibleSelected()).toBe(false);
        });

        it('returns true if everything that matches mini filter is selected', () => {
            values.forEach(v => model.deselectValue(v));

            model.selectValue(values[1]);
            model.setMiniFilter(values[1]);

            expect(model.isEverythingVisibleSelected()).toBe(true);
        });

        it('returns true if any values that match mini filter are not selected', () => {
            const values = ['A', 'fooB', 'Cfoo'];
            model = createSetValueModel({values});

            values.forEach(v => model.deselectValue(v));
            model.selectValue('fooB');
            model.setMiniFilter('foo');

            expect(model.isEverythingVisibleSelected()).toBe(false);
        });
    });

    describe('isNothingVisibleSelected', () => {
        const values = ['A', 'B', 'C'];

        beforeEach(() => {
            model = createSetValueModel({values});
        });

        it('returns true if no values are selected', () => {
            values.forEach(v => model.deselectValue(v));

            expect(model.isNothingVisibleSelected()).toBe(true);
        });

        it('returns false if any values are selected', () => {
            values.forEach(v => model.deselectValue(v));
            model.selectValue('B');

            expect(model.isNothingVisibleSelected()).toBe(false);
        });

        it('returns true if everything that matches mini filter is not selected', () => {
            values.forEach(v => model.deselectValue(v));

            model.selectValue('A');
            model.setMiniFilter('B');

            expect(model.isNothingVisibleSelected()).toBe(true);
        });

        it('returns false if any values that match mini filter are selected', () => {
            const values = ['A', 'fooB', 'Cfoo'];
            model = createSetValueModel({values});

            values.forEach(v => model.deselectValue(v));
            model.selectValue('fooB');
            model.setMiniFilter('foo');

            expect(model.isNothingVisibleSelected()).toBe(false);
        });
    });

    describe('getModel', () => {
        it('returns null if filter is not active', () => {
            model = createSetValueModel();

            expect(model.getModel()).toBe(null);
        });

        it('returns selected values if filter is active', () => {
            const expectedValues = ['B', 'C'];
            const values = ['A', ...expectedValues, 'D', 'E'];
            model = createSetValueModel({values});

            values.forEach(v => model.deselectValue(v));
            expectedValues.forEach(v => model.selectValue(v));

            expect(model.getModel()).toStrictEqual(expectedValues);
        });
    });

    describe('setModel', () => {
        it('exclusively selects provided values', done => {
            const expectedValues = ['A', 'B'];
            const otherValues = ['C', 'D', 'E'];
            model = createSetValueModel({ values: [...expectedValues, ...otherValues]});

            model.setModel(expectedValues).then(() => {
                asyncAssert(
                    done,
                    () => expectedValues.forEach(v => expect(model.isValueSelected(v)).toBe(true)),
                    () => otherValues.forEach(v => expect(model.isValueSelected(v)).toBe(false)));
            });
        });

        it('exclusively selects provided values (case-insensitive)', done => {
            const expectedValues = ['A', 'B'];
            const otherValues = ['C', 'D', 'E'];
            model = createSetValueModel({ values: [...expectedValues, ...otherValues], simulateCaseSensitivity: false });

            model.setModel(expectedValues.map(v => v.toLowerCase())).then(() => {
                asyncAssert(
                    done,
                    () => expectedValues.forEach(v => expect(model.isValueSelected(v)).toBe(true)),
                    () => otherValues.forEach(v => expect(model.isValueSelected(v)).toBe(false)));
            });
        });

        it('exclusively selects provided values (case-sensitive)', done => {
            const expectedValues = ['A', 'B'];
            const otherValues = [...expectedValues.map(v => v.toLowerCase()), 'C', 'D', 'E'];
            model = createSetValueModel({ values: [...expectedValues, ...otherValues], simulateCaseSensitivity: true });

            model.setModel(expectedValues).then(() => {
                asyncAssert(
                    done,
                    () => expectedValues.forEach(v => expect(model.isValueSelected(v)).toBe(true)),
                    () => otherValues.forEach(v => expect(model.isValueSelected(v)).toBe(false)));
            });
        });

        it('selects all values if provided model is null', done => {
            const values = ['A', 'B', 'C', 'D', 'E'];
            model = createSetValueModel({values});

            values.forEach(v => model.deselectValue(v));

            model.setModel(null).then(() => {
                asyncAssert(done, () => values.forEach(v => expect(model.isValueSelected(v)).toBe(true)));
            });
        });
    });
});
