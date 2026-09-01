import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import type { EditorFormControl } from 'ag-test-utils';
import { TestGridsManager, waitForInput, waitForPopup } from 'ag-test-utils';
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';

import type { GridApi, GridOptions, ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomEditorModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
} from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

interface RowData {
    value: string;
    other?: string;
}

class StatefulValidationEditor implements ICellEditorComp {
    public static instances: StatefulValidationEditor[] = [];
    public static deferNextInit = false;
    public static validationCalls = 0;
    public static validationErrors: (call: number) => string[] | null = () => null;

    public validationCalls = 0;
    private eGui!: HTMLInputElement;

    public init(params: ICellEditorParams): void | AgPromise<void> {
        StatefulValidationEditor.instances.push(this);
        this.eGui = document.createElement('input');
        this.eGui.value = String(params.value ?? '');
        if (StatefulValidationEditor.deferNextInit) {
            // Mimic a framework editor whose component attaches after `_setupEditor` has returned.
            StatefulValidationEditor.deferNextInit = false;
            return new AgPromise((resolve) => window.setTimeout(resolve));
        }
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public afterGuiAttached(): void {
        this.eGui.focus();
    }

    public getValue(): string {
        return this.eGui.value;
    }

    public getValidationErrors(): string[] | null {
        StatefulValidationEditor.validationCalls++;
        return StatefulValidationEditor.validationErrors(++this.validationCalls);
    }
}

describe('cell edit validation pass caching', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [BatchEditModule, ClientSideRowModelModule, CustomEditorModule, TextEditorModule, TextFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
        StatefulValidationEditor.instances = [];
        StatefulValidationEditor.deferNextInit = false;
        StatefulValidationEditor.validationCalls = 0;
        StatefulValidationEditor.validationErrors = () => null;
    });

    const createGrid = (
        rowData: RowData[],
        gridOptions: Partial<GridOptions<RowData>> = {}
    ): Promise<GridApi<RowData>> =>
        gridsManager.createGridAndWait('cell-edit-validation-cache', {
            columnDefs: [{ field: 'value', cellEditor: StatefulValidationEditor }],
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            rowData,
            ...gridOptions,
        } satisfies GridOptions<RowData>);

    const startEditing = async (api: GridApi<RowData>, rowIndex = 0): Promise<EditorFormControl> => {
        const gridElement = getGridElement(api)! as HTMLElement;
        const cell = gridElement.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="value"]`)!;
        await userEvent.setup().dblClick(cell);
        return waitForInput(gridElement, cell);
    };

    const makeFirstPassStateful = (firstResult: string[] | null): void => {
        StatefulValidationEditor.validationCalls = 0;
        for (const editor of StatefulValidationEditor.instances) {
            editor.validationCalls = 0;
        }
        StatefulValidationEditor.validationErrors = (call) =>
            call === 1 ? firstResult : firstResult ? null : ['A repeated validation changed the result'];
    };

    test('Enter reuses its preflight validation through commit and editor cleanup', async () => {
        const rowData = [{ value: 'source' }];
        const api = await createGrid(rowData);
        const user = userEvent.setup();
        const input = await startEditing(api);
        await user.clear(input);
        await user.type(input, 'updated');
        makeFirstPassStateful(null);

        await user.keyboard('{Enter}');

        expect(StatefulValidationEditor.validationCalls).toBe(1);
        expect(rowData[0].value).toBe('updated');
        expect(api.getCellEditorInstances()).toHaveLength(0);
    });

    test('final Tab reuses its preflight validation while committing the previous row', async () => {
        const rowData = [{ value: 'first' }, { value: 'second' }];
        const events: string[] = [];
        const api = await createGrid(rowData, {
            onCellValueChanged: ({ node }) => events.push(`cellValueChanged:${node.rowIndex}`),
            onCellEditingStopped: ({ node }) => events.push(`cellEditingStopped:${node.rowIndex}`),
            onRowValueChanged: ({ node }) => events.push(`rowValueChanged:${node.rowIndex}`),
            onRowEditingStopped: ({ node }) => events.push(`rowEditingStopped:${node.rowIndex}`),
            onRowEditingStarted: ({ node }) => events.push(`rowEditingStarted:${node.rowIndex}`),
            onCellEditingStarted: ({ node }) => events.push(`cellEditingStarted:${node.rowIndex}`),
        });
        const user = userEvent.setup();
        const input = await startEditing(api);
        await user.clear(input);
        await user.type(input, 'updated');
        const previousEditor = api.getCellEditorInstances()[0] as StatefulValidationEditor;
        events.length = 0;
        makeFirstPassStateful(null);

        await user.keyboard('{Tab}');

        const nextEditor = api.getCellEditorInstances()[0] as StatefulValidationEditor;
        expect(previousEditor.validationCalls).toBe(1);
        expect(nextEditor).not.toBe(previousEditor);
        expect(nextEditor.validationCalls).toBeLessThanOrEqual(1);
        expect(StatefulValidationEditor.instances.every(({ validationCalls }) => validationCalls <= 1)).toBe(true);
        expect(rowData[0].value).toBe('updated');
        expect(events).toEqual([
            'cellEditingStarted:1',
            'cellValueChanged:0',
            'cellEditingStopped:0',
            'cellEditingStopped:1',
            'rowValueChanged:0',
            'rowEditingStopped:0',
            'rowEditingStarted:1',
            'cellEditingStarted:1',
        ]);
        expect(document.activeElement).toBe(
            (getGridElement(api)! as HTMLElement).querySelector('[row-index="1"] [col-id="value"] input')
        );
    });

    test('Tab reuses its preflight validation while restoring a missing full-row editor', async () => {
        const rowData = [{ value: 'first', other: 'second' }];
        const api = await createGrid(rowData, {
            columnDefs: [
                { field: 'value', cellEditor: StatefulValidationEditor },
                { field: 'other', cellEditor: StatefulValidationEditor },
            ],
        });
        const user = userEvent.setup();
        const valueInput = await startEditing(api);
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(2));

        const existingEditor = StatefulValidationEditor.instances.find((editor) => editor.getGui() === valueInput)!;
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        const beans = (rowNode as any).beans;
        const otherColumn = api.getColumn('other')!;
        const otherCellCtrl = beans.rowRenderer.getCellCtrls([rowNode], [otherColumn])[0];
        otherCellCtrl.comp.setEditDetails();
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));
        valueInput.focus();
        makeFirstPassStateful(null);
        StatefulValidationEditor.deferNextInit = true;

        await user.keyboard('{Tab}');

        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(2));

        const restoredEditor = StatefulValidationEditor.instances.at(-1)!;
        expect(restoredEditor).not.toBe(existingEditor);
        expect(existingEditor.validationCalls).toBe(1);
        expect(restoredEditor.validationCalls).toBe(1);
        expect(document.activeElement).toBe(
            (getGridElement(api)! as HTMLElement).querySelector('[row-index="0"] [col-id="other"] input')
        );
    });

    test('batch Enter reuses its preflight validation through staging and cleanup', async () => {
        const rowData = [{ value: 'source' }];
        const api = await createGrid(rowData);
        const user = userEvent.setup();
        api.startBatchEdit();
        const input = await startEditing(api);
        await user.clear(input);
        await user.type(input, 'updated');
        makeFirstPassStateful(null);

        await user.keyboard('{Enter}');

        expect(StatefulValidationEditor.validationCalls).toBe(1);
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(rowData[0].value).toBe('source');

        api.commitBatchEdit();
        expect(StatefulValidationEditor.validationCalls).toBe(1);
        expect(rowData[0].value).toBe('updated');
    });

    test('blocked batch commit keeps the valid current editor open when an earlier row is invalid', async () => {
        const rowData = [{ value: 'first' }, { value: 'second' }];
        let rejectEarlierRow = false;
        const api = await createGrid(rowData, {
            getFullRowEditValidationErrors: ({ editorsState }) =>
                rejectEarlierRow && editorsState[0]?.rowIndex === 0 ? ['Earlier row is invalid'] : null,
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        api.startBatchEdit();

        const firstInput = await startEditing(api);
        await user.clear(firstInput);
        await user.type(firstInput, 'staged');
        await user.keyboard('{Tab}');

        const currentInput = gridElement.querySelector<HTMLInputElement>('[row-index="1"] [col-id="value"] input')!;
        await user.clear(currentInput);
        await user.type(currentInput, 'current');
        rejectEarlierRow = true;
        makeFirstPassStateful(null);

        api.commitBatchEdit();

        expect(StatefulValidationEditor.validationCalls).toBe(1);
        expect(api.isBatchEditing()).toBe(true);
        expect(api.getCellEditorInstances()).toHaveLength(1);
        expect(document.activeElement).toBe(currentInput);
        expect(rowData).toEqual([{ value: 'first' }, { value: 'second' }]);
        await waitFor(() => {
            const announcement =
                gridElement.querySelector('.ag-aria-description-container')?.textContent?.replaceAll('\u200B', '') ??
                '';
            expect(announcement).toContain(
                'Cannot complete row edit. Row 2, Full Row Validation: Earlier row is invalid.'
            );
        });
    });

    test('popup focus loss reuses the close preflight through commit and teardown', async () => {
        const rowData = [{ value: 'source' }];
        const api = await createGrid(rowData, {
            columnDefs: [{ field: 'value', cellEditor: StatefulValidationEditor, cellEditorPopup: true }],
            editType: 'singleCell',
            stopEditingWhenCellsLoseFocus: true,
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const cell = gridElement.querySelector<HTMLElement>('[row-index="0"] [col-id="value"]')!;
        await user.dblClick(cell);
        const popup = await waitForPopup(gridElement);
        const input = popup.querySelector<HTMLInputElement>('input')!;
        await user.clear(input);
        await user.type(input, 'updated');
        makeFirstPassStateful(null);

        await user.click(document.body);

        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));
        expect(StatefulValidationEditor.validationCalls).toBe(1);
        expect(rowData[0].value).toBe('updated');
    });

    test('revert-mode full-row popup close populates validation once and reuses that result', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [98] });
        const rowData = [{ value: 'source', other: 'sibling' }];
        const api = await createGrid(rowData, {
            columnDefs: [
                { field: 'value', cellEditor: StatefulValidationEditor, cellEditorPopup: true },
                { field: 'other' },
            ],
            invalidEditValueMode: 'revert',
            stopEditingWhenCellsLoseFocus: true,
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const valueCell = gridElement.querySelector<HTMLElement>('[row-index="0"] [col-id="value"]')!;
        await user.dblClick(valueCell);
        const popup = await waitForPopup(gridElement);
        const input = popup.querySelector<HTMLInputElement>('input')!;
        await user.clear(input);
        await user.type(input, 'updated');
        makeFirstPassStateful(null);

        await user.click(gridElement.querySelector<HTMLInputElement>('[row-index="0"] [col-id="other"] input')!);

        await waitFor(() => expect(valueCell.querySelector('input')).toBeNull());
        expect(StatefulValidationEditor.validationCalls).toBe(1);

        await user.keyboard('{Enter}');
        expect(rowData[0].value).toBe('updated');
    });

    test('mid-batch API cancellation invokes no validators and preserves the prior pending value', async () => {
        const rowData = [{ value: 'source' }];
        const api = await createGrid(rowData);
        const user = userEvent.setup();
        api.startBatchEdit();
        api.getDisplayedRowAtIndex(0)!.setDataValue('value', 'staged', 'batch');

        const input = await startEditing(api);
        await user.clear(input);
        await user.type(input, 'transient');
        makeFirstPassStateful(['Cancellation must not validate']);

        api.stopEditing(true);

        expect(StatefulValidationEditor.validationCalls).toBe(0);
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(rowData[0].value).toBe('source');

        api.commitBatchEdit();
        expect(StatefulValidationEditor.validationCalls).toBe(0);
        expect(rowData[0].value).toBe('staged');
    });

    test('non-popup batch Escape invokes no validators, including sibling full-row editors', async () => {
        const rowData = [{ value: 'source', other: 'source-other' }];
        const api = await createGrid(rowData, {
            columnDefs: [
                { field: 'value', cellEditor: StatefulValidationEditor },
                { field: 'other', cellEditor: StatefulValidationEditor },
            ],
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        api.startBatchEdit();
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('value', 'staged', 'batch');
        rowNode.setDataValue('other', 'staged-other', 'batch');

        const valueInput = await startEditing(api);
        await user.clear(valueInput);
        await user.type(valueInput, 'transient');
        const otherInput = gridElement.querySelector<HTMLInputElement>('[row-index="0"] [col-id="other"] input')!;
        await user.clear(otherInput);
        await user.type(otherInput, 'transient-other');
        makeFirstPassStateful(['Cancellation must not validate']);

        const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
        valueInput.dispatchEvent(escape);
        expect(escape.defaultPrevented).toBe(true);

        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));
        expect(StatefulValidationEditor.validationCalls).toBe(0);

        api.commitBatchEdit();
        expect(StatefulValidationEditor.validationCalls).toBe(0);
        expect(rowData[0]).toEqual({ value: 'staged', other: 'staged-other' });
    });

    test('popup Escape invokes no validators', async () => {
        const rowData = [{ value: 'source' }];
        const api = await createGrid(rowData, {
            columnDefs: [{ field: 'value', cellEditor: StatefulValidationEditor, cellEditorPopup: true }],
            editType: 'singleCell',
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const cell = gridElement.querySelector<HTMLElement>('[row-index="0"] [col-id="value"]')!;
        await user.dblClick(cell);
        const input = (await waitForPopup(gridElement)).querySelector<HTMLInputElement>('input')!;
        await user.clear(input);
        await user.type(input, 'transient');
        makeFirstPassStateful(['Cancellation must not validate']);

        await user.keyboard('{Escape}');

        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));
        expect(StatefulValidationEditor.validationCalls).toBe(0);
        expect(rowData[0].value).toBe('source');
    });

    test.each([
        { eventName: 'filterChanged', firstResult: null, expectedValue: 'updated' },
        { eventName: 'sortChanged', firstResult: ['invalid'], expectedValue: 'source' },
    ] as const)(
        '$eventName reuses the preflight result through its commit or cancel branch',
        async ({ eventName, firstResult, expectedValue }) => {
            const rowData = [{ value: 'source' }];
            const api = await createGrid(rowData);
            const user = userEvent.setup();
            const input = await startEditing(api);
            await user.clear(input);
            await user.type(input, 'updated');
            makeFirstPassStateful(firstResult ? [...firstResult] : null);

            if (eventName === 'filterChanged') {
                api.onFilterChanged();
            } else {
                api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
            }

            await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));
            expect(StatefulValidationEditor.validationCalls).toBe(1);
            expect(rowData[0].value).toBe(expectedValue);
        }
    );

    test.each([
        { firstResult: null, expectedValue: 'updated' },
        { firstResult: ['invalid'], expectedValue: 'source' },
    ] as const)(
        'revert-mode batch editor close reuses one $firstResult validation result',
        async ({ firstResult, expectedValue }) => {
            const rowData = [{ value: 'source' }];
            const api = await createGrid(rowData, { invalidEditValueMode: 'revert' });
            const user = userEvent.setup();
            api.startBatchEdit();
            const input = await startEditing(api);
            await user.clear(input);
            await user.type(input, 'updated');
            makeFirstPassStateful(firstResult ? [...firstResult] : null);

            api.stopEditing();

            expect(StatefulValidationEditor.validationCalls).toBe(1);
            expect(api.getCellEditorInstances()).toHaveLength(0);

            api.commitBatchEdit();
            expect(StatefulValidationEditor.validationCalls).toBe(1);
            expect(rowData[0].value).toBe(expectedValue);
        }
    );
});
