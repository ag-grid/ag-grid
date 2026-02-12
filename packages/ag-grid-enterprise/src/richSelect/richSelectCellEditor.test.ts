import type { RichCellEditorParams } from 'ag-grid-community';

import { AgRichSelect } from '../widgets/agRichSelect';
import { RichSelectAsyncRequestsFeature } from './richSelectAsyncRequestsFeature';
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

function createRichSelectMock() {
    let asyncRequests: RichSelectAsyncRequestsFeature<TestValue> | undefined;
    let loadMoreCallback: ((direction?: 'up' | 'down') => void) | undefined;
    let useAsyncSearch = false;

    const setValueList = jest.fn();
    const setIsLoading = jest.fn();
    const setLoadMoreRowsCallback = jest.fn(
        (callback?: (direction?: 'up' | 'down') => void, _thresholdRows?: number) => {
            loadMoreCallback = callback;
        }
    );

    const richSelect = {
        addCss: jest.fn(),
        showPicker: jest.fn(),
        setValueList,
        setIsLoading,
        setSearchStringCreator: jest.fn(),
        setLoadMoreRowsCallback,
        searchTextFromString: jest.fn((value?: string | null) => {
            if (useAsyncSearch) {
                asyncRequests?.onSearch(value ?? '');
            }
        }),
        setAsyncValuesSource: jest.fn((params: any) => {
            asyncRequests?.destroy();
            useAsyncSearch = !!params.useAsyncSearch;
            asyncRequests = new RichSelectAsyncRequestsFeature<TestValue>({
                host: { setValueList, setIsLoading },
                source: params.source,
                onMisconfiguredSearchSource: params.onMisconfiguredSearchSource,
                onFirstValuesPageLoaded: params.onFirstValuesPageLoaded ?? (() => {}),
            });

            if (params.source?.loadValuesPage) {
                setLoadMoreRowsCallback(
                    (direction?: 'up' | 'down') => asyncRequests?.loadValuesPage(direction ?? 'down'),
                    params.thresholdRows
                );
            } else {
                setLoadMoreRowsCallback(undefined);
            }
        }),
        resetAsyncValues: jest.fn((searchString = '') => asyncRequests?.resetValuesPage(searchString)),
    };

    return {
        richSelect,
        setValueList,
        setIsLoading,
        setLoadMoreRowsCallback,
        runAsyncSearch: (searchString: string) => asyncRequests?.onSearch(searchString),
        getLoadMoreCallback: () => loadMoreCallback,
    };
}

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
        expect(params.onSearch).toBeUndefined();
    });

    it('handles async search promise rejection by returning empty results for the latest request', async () => {
        const values = jest.fn(() => Promise.reject(new Error('boom')));
        const editor = createEditor({
            values: values as any,
            allowTyping: true,
            filterList: true,
            filterListAsync: true,
        });
        const { richSelect, setValueList, runAsyncSearch } = createRichSelectMock();
        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();
        (editor as any).initialiseEditor((editor as any).params);
        setValueList.mockClear();

        runAsyncSearch('term');

        expect(setValueList).toHaveBeenCalledTimes(2);
        expect(setValueList).toHaveBeenNthCalledWith(1, { refresh: true, valueList: undefined });

        const request = setValueList.mock.calls[1][0];
        await expect(request.valueList).resolves.toEqual([]);
    });

    it('handles sync throws from values callback by clearing results for the latest request', () => {
        const values = jest.fn(() => {
            throw new Error('sync boom');
        });
        const editor = createEditor({
            values: values as any,
            allowTyping: true,
            filterList: true,
            filterListAsync: true,
        });
        const { richSelect, setValueList, runAsyncSearch } = createRichSelectMock();
        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();
        (editor as any).initialiseEditor((editor as any).params);
        setValueList.mockClear();

        runAsyncSearch('term');

        expect(setValueList).toHaveBeenCalledTimes(2);
        expect(setValueList).toHaveBeenNthCalledWith(1, { refresh: true, valueList: undefined });
        expect(setValueList).toHaveBeenNthCalledWith(2, { refresh: true, valueList: [] });
    });

    it('ignores stale async search responses when a newer request exists', async () => {
        let firstResolve: ((values: TestValue[]) => void) | undefined;
        let secondResolve: ((values: TestValue[]) => void) | undefined;
        const values = jest
            .fn()
            .mockImplementationOnce(() => new Promise<TestValue[]>((resolve) => (firstResolve = resolve)))
            .mockImplementationOnce(() => new Promise<TestValue[]>((resolve) => (secondResolve = resolve)));

        const editor = createEditor({
            values: values as any,
            allowTyping: true,
            filterList: true,
            filterListAsync: true,
        });
        const { richSelect, setValueList, runAsyncSearch } = createRichSelectMock();
        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();
        (editor as any).initialiseEditor((editor as any).params);
        setValueList.mockClear();

        runAsyncSearch('first');
        runAsyncSearch('second');

        const firstRequest = setValueList.mock.calls[1][0];
        const secondRequest = setValueList.mock.calls[3][0];

        firstResolve?.([{ id: 1, label: 'first' }]);
        secondResolve?.([{ id: 2, label: 'second' }]);

        await expect(firstRequest.valueList).resolves.toBeUndefined();
        await expect(secondRequest.valueList).resolves.toEqual([{ id: 2, label: 'second' }]);
    });

    it('passes an immutable search value per request to async values callback', () => {
        let firstParams: any;
        let secondParams: any;
        const values = jest
            .fn()
            .mockImplementationOnce((params) => {
                firstParams = params;
                return new Promise<TestValue[]>(() => {});
            })
            .mockImplementationOnce((params) => {
                secondParams = params;
                return new Promise<TestValue[]>(() => {});
            });

        const editor = createEditor({
            values: values as any,
            allowTyping: true,
            filterList: true,
            filterListAsync: true,
        });
        const { richSelect, setValueList, runAsyncSearch } = createRichSelectMock();
        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();
        (editor as any).initialiseEditor((editor as any).params);
        setValueList.mockClear();

        runAsyncSearch('first');
        runAsyncSearch('second');

        expect(firstParams.search).toBe('first');
        expect(secondParams.search).toBe('second');
        expect(firstParams).not.toBe(secondParams);
    });

    it('warns and disables full async mode when filterListAsync is set without allowTyping', () => {
        const editor = createEditor({
            values: (() => Promise.resolve([] as TestValue[])) as any,
            allowTyping: false,
            filterListAsync: true,
        });

        expect((editor as any).isFullAsync()).toBe(false);
        expect(warnSpy).toHaveBeenCalled();
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
            setAsyncValuesSource: jest.fn(),
            resetAsyncValues: jest.fn(),
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

    it('loads initial paged values and wires load-more callback', async () => {
        const valuesPage = jest.fn().mockReturnValue({
            values: [{ id: 1, label: 'one' }],
            cursor: 'next',
        });
        const editor = createEditor({
            values: undefined,
            valuesPage: valuesPage as any,
            valuesPageSize: 25,
        });

        const { richSelect, setLoadMoreRowsCallback, setIsLoading, getLoadMoreCallback } = createRichSelectMock();

        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();

        (editor as any).initialiseEditor((editor as any).params);
        await flushMicrotasks();

        expect(setLoadMoreRowsCallback).toHaveBeenCalled();
        expect(valuesPage).toHaveBeenCalledWith(
            expect.objectContaining({
                search: '',
                startRow: 0,
                endRow: 25,
                cursor: undefined,
            })
        );
        expect(setIsLoading).toHaveBeenCalled();
        expect(getLoadMoreCallback()).toBeDefined();
    });

    it('replays initial event key once after the first paged load in non-full-async mode', async () => {
        let resolveFirstPage: ((result: { values: TestValue[]; cursor: string }) => void) | undefined;
        const valuesPage = jest
            .fn()
            .mockImplementationOnce(
                () =>
                    new Promise<{ values: TestValue[]; cursor: string }>((resolve) => {
                        resolveFirstPage = resolve;
                    })
            )
            .mockReturnValueOnce({
                values: [{ id: 2, label: 'two' }],
                lastRow: 2,
            });
        const editor = createEditor({
            values: undefined,
            valuesPage: valuesPage as any,
            eventKey: 'A',
            allowTyping: false,
            filterList: false,
            filterListAsync: false,
        });

        const { richSelect, getLoadMoreCallback } = createRichSelectMock();

        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();

        jest.useFakeTimers();
        try {
            (editor as any).initialiseEditor((editor as any).params);
            (editor as any).afterGuiAttached();
            jest.runOnlyPendingTimers();

            expect(richSelect.searchTextFromString).toHaveBeenCalledTimes(0);

            resolveFirstPage?.({
                values: [{ id: 1, label: 'one' }],
                cursor: 'next',
            });
            await flushMicrotasks();

            expect(richSelect.searchTextFromString).toHaveBeenCalledTimes(1);
            expect(richSelect.searchTextFromString).toHaveBeenCalledWith('A');

            getLoadMoreCallback()?.();
            await flushMicrotasks();

            expect(richSelect.searchTextFromString).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it('processes initial event key once in full-async paged mode', async () => {
        const valuesPage = jest.fn().mockReturnValue({
            values: [{ id: 1, label: 'one' }],
            lastRow: 1,
        });
        const editor = createEditor({
            values: undefined,
            valuesPage: valuesPage as any,
            eventKey: 'A',
            allowTyping: true,
            filterList: true,
            filterListAsync: true,
        });

        const { richSelect } = createRichSelectMock();

        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();

        jest.useFakeTimers();
        try {
            (editor as any).initialiseEditor((editor as any).params);
            (editor as any).afterGuiAttached();
            jest.runOnlyPendingTimers();
            await flushMicrotasks();

            expect(richSelect.searchTextFromString).toHaveBeenCalledTimes(1);
            expect(richSelect.searchTextFromString).toHaveBeenCalledWith('A');
        } finally {
            jest.useRealTimers();
        }
    });

    it('supports custom initial start row for paged values and continues from that offset', async () => {
        const valuesPageInitialStartRow = jest.fn(() => 10);
        const valuesPage = jest
            .fn()
            .mockReturnValueOnce({
                values: [
                    { id: 10, label: 'ten' },
                    { id: 11, label: 'eleven' },
                ],
                cursor: 'next',
            })
            .mockReturnValueOnce({
                values: [{ id: 12, label: 'twelve' }],
                lastRow: 13,
            });
        const editor = createEditor({
            values: undefined,
            valuesPage: valuesPage as any,
            valuesPageSize: 2,
            value: { id: 999, label: 'selected' } as any,
            valuesPageInitialStartRow: valuesPageInitialStartRow as any,
        });

        const { richSelect, getLoadMoreCallback } = createRichSelectMock();

        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();

        (editor as any).initialiseEditor((editor as any).params);
        await flushMicrotasks();
        getLoadMoreCallback()?.();
        await flushMicrotasks();

        expect(valuesPageInitialStartRow).toHaveBeenCalledWith({ id: 999, label: 'selected' });
        expect(valuesPage).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                search: '',
                startRow: 10,
                endRow: 12,
            })
        );
        expect(valuesPage).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                search: '',
                startRow: 12,
                endRow: 14,
            })
        );
    });

    it('loads previous pages when initial paged load starts after row zero', async () => {
        const dataset = Array.from({ length: 40 }, (_, id) => ({ id, label: `value-${id}` }));
        const valuesPage = jest.fn().mockImplementation((request: any) => ({
            values: dataset.slice(request.startRow, request.endRow),
            lastRow: dataset.length,
        }));
        const editor = createEditor({
            values: undefined,
            valuesPage: valuesPage as any,
            valuesPageSize: 10,
            valuesPageInitialStartRow: 20,
        });

        const { richSelect, getLoadMoreCallback } = createRichSelectMock();

        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();

        (editor as any).initialiseEditor((editor as any).params);
        await flushMicrotasks();

        getLoadMoreCallback()?.('up');
        await flushMicrotasks();
        getLoadMoreCallback()?.('up');
        await flushMicrotasks();
        getLoadMoreCallback()?.('down');
        await flushMicrotasks();

        expect(valuesPage).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                search: '',
                startRow: 20,
                endRow: 30,
            })
        );
        expect(valuesPage).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                search: '',
                startRow: 10,
                endRow: 20,
            })
        );
        expect(valuesPage).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                search: '',
                startRow: 0,
                endRow: 10,
            })
        );
        expect(valuesPage).toHaveBeenNthCalledWith(
            4,
            expect.objectContaining({
                search: '',
                startRow: 30,
                endRow: 40,
            })
        );
    });

    it('appends additional pages when load-more callback is invoked', async () => {
        const valuesPage = jest
            .fn()
            .mockReturnValueOnce({
                values: [
                    { id: 1, label: 'one' },
                    { id: 2, label: 'two' },
                ],
                cursor: 'next',
            })
            .mockReturnValueOnce({
                values: [{ id: 3, label: 'three' }],
                lastRow: 3,
            });
        const editor = createEditor({
            values: undefined,
            valuesPage: valuesPage as any,
            valuesPageSize: 2,
        });

        const { richSelect, getLoadMoreCallback } = createRichSelectMock();

        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();

        (editor as any).initialiseEditor((editor as any).params);
        await flushMicrotasks();
        getLoadMoreCallback()?.();
        await flushMicrotasks();

        expect(valuesPage).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                search: '',
                startRow: 0,
                endRow: 2,
                cursor: undefined,
            })
        );
        expect(valuesPage).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                search: '',
                startRow: 2,
                endRow: 4,
                cursor: 'next',
            })
        );
        expect(richSelect.setValueList).toHaveBeenCalledWith(
            expect.objectContaining({
                valueList: [
                    { id: 1, label: 'one' },
                    { id: 2, label: 'two' },
                    { id: 3, label: 'three' },
                ],
                refresh: true,
            })
        );
    });

    it('continues loading pages when cursor is undefined but page is full', async () => {
        const valuesPage = jest
            .fn()
            .mockReturnValueOnce({
                values: [
                    { id: 1, label: 'one' },
                    { id: 2, label: 'two' },
                ],
                cursor: undefined,
            })
            .mockReturnValueOnce({
                values: [{ id: 3, label: 'three' }],
                lastRow: 3,
            });
        const editor = createEditor({
            values: undefined,
            valuesPage: valuesPage as any,
            valuesPageSize: 2,
        });

        const { richSelect, getLoadMoreCallback } = createRichSelectMock();

        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();

        (editor as any).initialiseEditor((editor as any).params);
        await flushMicrotasks();
        getLoadMoreCallback()?.();
        await flushMicrotasks();

        expect(valuesPage).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                startRow: 0,
                endRow: 2,
            })
        );
        expect(valuesPage).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                startRow: 2,
                endRow: 4,
            })
        );
    });

    it('ignores stale paged responses after a newer search reset', async () => {
        const pendingResolvers: Record<string, Array<(result: { values: TestValue[]; lastRow?: number }) => void>> = {};
        const valuesPage = jest.fn().mockImplementation((params: { search: string }) => {
            return new Promise<{ values: TestValue[]; lastRow?: number }>((resolve) => {
                (pendingResolvers[params.search] ??= []).push(resolve);
            });
        });

        const editor = createEditor({
            values: undefined,
            valuesPage: valuesPage as any,
            allowTyping: true,
            filterList: true,
            filterListAsync: true,
        });

        const { richSelect, setValueList, runAsyncSearch } = createRichSelectMock();
        (editor as any).createManagedBean = jest.fn(() => richSelect);
        (editor as any).appendChild = jest.fn();
        (editor as any).addManagedListeners = jest.fn();
        (editor as any).initialiseEditor((editor as any).params);
        setValueList.mockClear();

        runAsyncSearch('first');
        runAsyncSearch('second');

        pendingResolvers['second']?.[0]?.({
            values: [{ id: 2, label: 'second' }],
            lastRow: 1,
        });
        pendingResolvers['first']?.[0]?.({
            values: [{ id: 1, label: 'stale' }],
        });
        await flushMicrotasks();

        expect(setValueList).toHaveBeenLastCalledWith(
            expect.objectContaining({
                valueList: [{ id: 2, label: 'second' }],
                refresh: true,
            })
        );
    });
});
