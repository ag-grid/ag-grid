import type { RichCellEditorParams } from 'ag-grid-community';

import { AgRichSelect } from '../widgets/agRichSelect';
import { RichSelectCellEditor } from './richSelectCellEditor';

type TestValue = { id: number; label: string };

function createBaseParams(
    overrides?: Partial<RichCellEditorParams<any, TestValue>>
): RichCellEditorParams<any, TestValue> {
    return {
        values: [],
        value: null,
        eventKey: null,
        column: {} as any,
        colDef: {} as any,
        node: {} as any,
        data: {},
        rowIndex: 0,
        cellStartedEdit: false,
        onKeyDown: jest.fn(),
        stopEditing: jest.fn(),
        eGridCell: document.createElement('div'),
        validate: jest.fn(),
        ...overrides,
    } as RichCellEditorParams<any, TestValue>;
}

function createEditor(params?: Partial<RichCellEditorParams<any, TestValue>>) {
    const editor = new RichSelectCellEditor<any, TestValue, any>() as any;
    editor.params = createBaseParams(params);
    editor.gos = {
        addCommon: (value: any) => value,
        get: jest.fn(() => undefined),
    };
    editor.getLocaleTextFunc = () => (_key: string, defaultValue: string) => defaultValue;
    return editor as any;
}

const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
};

describe('RichSelectCellEditor', () => {
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('builds params with required picker fields that can be consumed by AgRichSelect', () => {
        const editor = createEditor({
            values: [{ id: 1, label: 'one' }],
            formatValue: (value) => value?.label ?? '',
            eventKey: 'x',
        });

        const { params } = (editor as any).buildRichSelectParams();
        const richSelect = new AgRichSelect<TestValue>(params);

        expect((richSelect as any).config.pickerAriaLabelKey).toBe('ariaLabelRichSelectField');
        expect((richSelect as any).config.pickerAriaLabelValue).toBe('Rich Select Field');
        expect((richSelect as any).config.pickerType).toBe('virtual-list');
    });

    it('supports object search strings when formatValue is missing', () => {
        const editor = createEditor({
            colDef: { cellEditorParams: { formatValue: jest.fn() } } as any,
            formatValue: undefined,
        });

        const callback = (editor as any).getSearchStringCallback([{ id: 1, label: 'one' }]);
        expect(callback?.([{ id: 1, label: 'one' } as TestValue])).toEqual(['[object Object]']);
    });

    it('supports complex object search via keyCreator', () => {
        const editor = createEditor({
            column: { getColId: () => 'value' } as any,
            node: { id: 'row-1' } as any,
            data: { key: 'row-data' } as any,
            colDef: {
                keyCreator: ({ value }: any) => `key-${value.id}`,
            } as any,
        });

        const callback = (editor as any).getSearchStringCallback([
            { id: 1, label: 'one' },
            { id: 2, label: 'two' },
        ]);

        expect(
            callback?.([
                { id: 1, label: 'one' },
                { id: 2, label: 'two' },
            ])
        ).toEqual(['key-1', 'key-2']);
    });

    it('keeps typing enabled for multi-select while preserving full-async search wiring', () => {
        const valuesFn = jest.fn(() => Promise.resolve([] as TestValue[]));
        const editor = createEditor({
            values: valuesFn as any,
            allowTyping: true,
            filterListAsync: true,
            filterList: false,
            multiSelect: true,
        });

        const { params } = (editor as any).buildRichSelectParams();

        expect(params.allowTyping).toBe(true);
        expect(params.filterList).toBe(true);
        expect(params.allowNoResultsCopy).toBe(true);
        expect(typeof params.onSearch).toBe('function');
    });

    it('handles async search promise rejection by returning empty results for the latest request', async () => {
        const setValueList = jest.fn();
        const values = jest.fn(() => Promise.reject(new Error('boom')));
        const editor = createEditor({
            values: values as any,
            allowTyping: true,
            filterList: true,
            filterListAsync: true,
        });
        (editor as any).eEditor = { setValueList } as any;

        (editor as any).onSearchCallback('term');

        expect(setValueList).toHaveBeenCalledTimes(2);
        expect(setValueList).toHaveBeenNthCalledWith(1, { refresh: true, valueList: undefined });

        const request = setValueList.mock.calls[1][0];
        await expect(request.valueList).resolves.toEqual([]);
    });

    it('ignores stale async search responses when a newer request exists', async () => {
        let firstResolve: ((values: TestValue[]) => void) | undefined;
        let secondResolve: ((values: TestValue[]) => void) | undefined;
        const values = jest
            .fn()
            .mockImplementationOnce(() => new Promise<TestValue[]>((resolve) => (firstResolve = resolve)))
            .mockImplementationOnce(() => new Promise<TestValue[]>((resolve) => (secondResolve = resolve)));

        const setValueList = jest.fn();
        const editor = createEditor({
            values: values as any,
            allowTyping: true,
            filterList: true,
            filterListAsync: true,
        });
        (editor as any).eEditor = { setValueList } as any;

        (editor as any).onSearchCallback('first');
        (editor as any).onSearchCallback('second');

        const firstRequest = setValueList.mock.calls[1][0];
        const secondRequest = setValueList.mock.calls[3][0];

        firstResolve?.([{ id: 1, label: 'first' }]);
        secondResolve?.([{ id: 2, label: 'second' }]);

        await expect(firstRequest.valueList).resolves.toBeUndefined();
        await expect(secondRequest.valueList).resolves.toEqual([{ id: 2, label: 'second' }]);
    });

    it('processes event key when one-time async values reject during initialise', async () => {
        const values = jest.fn(() => Promise.reject(new Error('load failed')));
        const editor = createEditor({
            values: values as any,
            eventKey: 'A',
        });

        const richSelect = {
            addCss: jest.fn(),
            showPicker: jest.fn(),
            setValueList: jest.fn(),
            setSearchStringCreator: jest.fn(),
            searchTextFromString: jest.fn(),
        };

        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();

        const processEventKeySpy = jest.spyOn(editor as any, 'processEventKey');

        (editor as any).initialiseEditor((editor as any).params);
        await flushMicrotasks();

        expect(processEventKeySpy).toHaveBeenCalledWith('A');
    });
});
