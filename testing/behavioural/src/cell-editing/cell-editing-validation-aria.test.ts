import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, asyncSetTimeout, waitForInput, waitForPopup } from 'ag-test-utils';
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';

import type { ColDef, GridApi, GridOptions, ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    LocaleModule,
    NumberEditorModule,
    TextEditorModule,
    enableDevValidations,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

interface MeasurementRow {
    name: string;
    weightLbs: number;
    weightKg: number;
    heightCm: number;
}

const makeRowData = (): MeasurementRow[] => [
    { name: 'Alice', weightLbs: 220, weightKg: 100, heightCm: 200 },
    { name: 'Bob', weightLbs: 176, weightKg: 80, heightCm: 180 },
];

/** Pull-only editor: tests decide exactly when validation runs by calling api.validateEdit(). */
class PassiveValidatingEditor implements ICellEditorComp {
    public static validationCalls = 0;
    public static validationErrors: ((value: string, call: number) => string[] | null) | undefined;

    private eGui!: HTMLInputElement;

    public init(params: ICellEditorParams): void {
        this.eGui = document.createElement('input');
        this.eGui.value = String(params.value ?? '');
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
        const call = ++PassiveValidatingEditor.validationCalls;
        if (PassiveValidatingEditor.validationErrors) {
            return PassiveValidatingEditor.validationErrors(this.eGui.value, call);
        }
        return this.eGui.value === 'INVALID' ? ['Custom editor rejected value'] : null;
    }
}

describe('Full-row edit validation ARIA announcements', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            BatchEditModule,
            ClientSideRowModelModule,
            CustomEditorModule,
            LocaleModule,
            NumberEditorModule,
            TextEditorModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
        PassiveValidatingEditor.validationCalls = 0;
        PassiveValidatingEditor.validationErrors = undefined;
        vi.clearAllMocks();
    });

    const cell = (api: GridApi, rowIndex: number, colId: string): HTMLElement => {
        const gridElement = getGridElement(api)! as HTMLElement;
        return gridElement.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="${colId}"]`)!;
    };

    const getAriaAnnouncementText = (gridElement: HTMLElement): string =>
        (gridElement.querySelector('.ag-aria-description-container')?.textContent ?? '').replaceAll('\u200B', '');

    const waitForAriaAnnouncement = async (gridElement: HTMLElement, expected: string | RegExp): Promise<string> =>
        waitFor(() => {
            const announcement = getAriaAnnouncementText(gridElement);
            expect(announcement).toMatch(expected);
            return announcement;
        });

    const expectNoAriaAnnouncementMutation = async (
        gridElement: HTMLElement,
        action: () => Promise<void>
    ): Promise<void> => {
        const liveRegion = gridElement.querySelector<HTMLElement>('.ag-aria-description-container')!;
        const initialText = liveRegion.textContent;
        const mutations: MutationRecord[] = [];
        const observer = new MutationObserver((records) => mutations.push(...records));
        observer.observe(liveRegion, { childList: true, characterData: true, subtree: true });

        try {
            await action();
            // Flush both the zero-delay announcement debounce and its repeat timer.
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);
        } finally {
            observer.disconnect();
        }

        expect(mutations).toHaveLength(0);
        expect(liveRegion.textContent).toBe(initialText);
    };

    const baseColumnDefs: ColDef<MeasurementRow>[] = [
        { field: 'name' },
        {
            field: 'weightLbs',
            headerName: 'Weight (lbs)',
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: { min: 0, max: 500 },
        },
        {
            field: 'weightKg',
            headerName: 'Weight (kg)',
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: { min: 0, max: 500 },
        },
        {
            field: 'heightCm',
            headerName: 'Height (cm)',
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: { min: 0, max: 300 },
        },
    ];

    const createGrid = (gridOptions: Partial<GridOptions<MeasurementRow>> = {}): Promise<GridApi<MeasurementRow>> =>
        gridsManager.createGridAndWait('full-row-validation-aria', {
            columnDefs: baseColumnDefs,
            rowData: makeRowData(),
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            ...gridOptions,
        } satisfies GridOptions<MeasurementRow>);

    test('announces a new cell error with its display header, but does not repeat it on intra-row Tab', async () => {
        const api = await createGrid();
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const weightLbsCell = cell(api, 0, 'weightLbs');
        await user.dblClick(weightLbsCell);
        const weightLbsInput = await waitForInput(gridElement, weightLbsCell);
        await user.clear(weightLbsInput);
        await user.type(weightLbsInput, '3000');

        await waitForAriaAnnouncement(
            gridElement,
            'Cell Editor Validation Weight (lbs): Must be less than or equal to 500.'
        );

        await expectNoAriaAnnouncementMutation(gridElement, () => user.keyboard('{Tab}'));

        expect(document.activeElement).toBe(cell(api, 0, 'weightKg').querySelector('input'));
    });

    test('announces a new full-row error, but does not repeat an unchanged error on intra-row Tab', async () => {
        const rowError = 'BMI is outside the realistic range';
        const api = await createGrid({
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const values = Object.fromEntries(editorsState.map(({ colId, newValue }) => [colId, newValue]));
                const weight = Number(values.weightKg);
                const heightM = Number(values.heightCm) / 100;
                const bmi = weight / (heightM * heightM);

                return Number.isFinite(bmi) && (bmi < 10 || bmi > 80) ? [rowError] : null;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const weightKgCell = cell(api, 0, 'weightKg');
        await user.dblClick(weightKgCell);
        const weightKgInput = await waitForInput(gridElement, weightKgCell);
        await user.clear(weightKgInput);
        await user.type(weightKgInput, '10');

        await waitForAriaAnnouncement(gridElement, `Full Row Validation: ${rowError}.`);

        await expectNoAriaAnnouncementMutation(gridElement, () => user.keyboard('{Tab}'));

        expect(document.activeElement).toBe(cell(api, 0, 'heightCm').querySelector('input'));
    });

    test('announces when a full-row validation message changes', async () => {
        const api = await createGrid({
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const weight = Number(editorsState.find(({ colId }) => colId === 'weightKg')?.newValue);
                return weight < 20 ? [`Weight is ${weight}`] : null;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const weightKgCell = cell(api, 0, 'weightKg');
        await user.dblClick(weightKgCell);
        const weightKgInput = await waitForInput(gridElement, weightKgCell);
        await user.clear(weightKgInput);
        await user.type(weightKgInput, '1');

        await waitForAriaAnnouncement(gridElement, 'Full Row Validation: Weight is 1.');

        await user.type(weightKgInput, '0');

        await waitForAriaAnnouncement(gridElement, 'Full Row Validation: Weight is 10.');
    });

    test('announces changed full-row messages when the callback reuses and mutates its error array', async () => {
        const reusedErrors = [''];
        const api = await createGrid({
            columnDefs: [{ field: 'weightKg', headerName: 'Weight (kg)', cellEditor: PassiveValidatingEditor }],
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const weight = Number(editorsState[0]?.newValue);
                if (weight >= 20) {
                    return null;
                }

                reusedErrors[0] = `Weight is ${weight}`;
                return reusedErrors;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const weightKgCell = cell(api, 0, 'weightKg');
        await user.dblClick(weightKgCell);
        const weightKgInput = await waitForInput(gridElement, weightKgCell);
        await user.clear(weightKgInput);
        await user.type(weightKgInput, '1');

        api.validateEdit();
        await waitForAriaAnnouncement(gridElement, 'Full Row Validation: Weight is 1.');

        await user.type(weightKgInput, '0');

        api.validateEdit();
        await waitForAriaAnnouncement(gridElement, 'Full Row Validation: Weight is 10.');
    });

    test('calls a custom cell validator once per explicit pass and preserves row-validation value semantics', async () => {
        const valuesSeenByRowValidation: unknown[] = [];
        const api = await createGrid({
            columnDefs: [{ field: 'name', cellEditor: PassiveValidatingEditor }],
            getFullRowEditValidationErrors: ({ editorsState }) => {
                valuesSeenByRowValidation.push(editorsState[0]?.newValue);
                return null;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const nameCell = cell(api, 0, 'name');
        await user.dblClick(nameCell);
        const nameInput = await waitForInput(gridElement, nameCell);
        await user.clear(nameInput);
        await user.type(nameInput, 'VALID');

        PassiveValidatingEditor.validationCalls = 0;
        valuesSeenByRowValidation.length = 0;
        expect(api.validateEdit()).toEqual([]);
        expect(PassiveValidatingEditor.validationCalls).toBe(1);
        expect(valuesSeenByRowValidation).toEqual(['VALID']);

        await user.clear(nameInput);
        await user.type(nameInput, 'INVALID');

        PassiveValidatingEditor.validationCalls = 0;
        valuesSeenByRowValidation.length = 0;
        expect(api.validateEdit()).toEqual([expect.objectContaining({ messages: ['Custom editor rejected value'] })]);
        expect(PassiveValidatingEditor.validationCalls).toBe(1);
        // Invalid cell values continue to be withheld from row validation, which sees the source value instead.
        expect(valuesSeenByRowValidation).toEqual(['Alice']);
        expect(nameInput.value).toBe('INVALID');
    });

    test('announces a full-row error that reappears when a blocked popup value is reverted', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [98] });
        const rowError = 'The staged name needs review';
        const rowValues: unknown[] = [];
        const api = await createGrid({
            columnDefs: [
                { field: 'name', cellEditor: PassiveValidatingEditor, cellEditorPopup: true },
                { field: 'weightKg' },
            ],
            stopEditingWhenCellsLoseFocus: true,
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const name = editorsState.find(({ colId }) => colId === 'name')?.newValue;
                rowValues.push(name);
                return name === 'ROW_ERROR' ? [rowError] : null;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const nameCell = cell(api, 0, 'name');

        await user.dblClick(nameCell);
        let popupInput = (await waitForPopup(gridElement)).querySelector<HTMLInputElement>('input')!;
        await user.clear(popupInput);
        await user.type(popupInput, 'ROW_ERROR');
        api.validateEdit();
        await waitForAriaAnnouncement(gridElement, `Full Row Validation: ${rowError}.`);
        await user.click(cell(api, 0, 'weightKg').querySelector<HTMLInputElement>('input')!);
        await waitFor(() => expect(gridElement.querySelector('.ag-popup-editor')).toBeNull());
        expect(rowValues.at(-1)).toBe('ROW_ERROR');

        api.startEditingCell({ rowIndex: 0, colKey: 'name' });
        popupInput = (await waitForPopup(gridElement)).querySelector<HTMLInputElement>('input')!;
        await user.clear(popupInput);
        await user.type(popupInput, 'INVALID');
        api.validateEdit();
        await waitForAriaAnnouncement(gridElement, 'Cell Editor Validation Name: Custom editor rejected value.');
        expect(rowValues.at(-1)).toBe('Alice');

        await user.click(cell(api, 0, 'weightKg').querySelector<HTMLInputElement>('input')!);

        await waitForAriaAnnouncement(gridElement, `Full Row Validation: ${rowError}.`);
        expect(rowValues.at(-1)).toBe('ROW_ERROR');
    });

    test('cancelling an unvalidated edit emits no validation announcement', async () => {
        const api = await createGrid({
            columnDefs: [{ field: 'name', cellEditor: PassiveValidatingEditor }],
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const nameCell = cell(api, 0, 'name');
        await user.dblClick(nameCell);
        const input = await waitForInput(gridElement, nameCell);
        await user.clear(input);
        await user.type(input, 'INVALID');
        PassiveValidatingEditor.validationCalls = 0;

        await expectNoAriaAnnouncementMutation(gridElement, async () => api.stopEditing(true));

        expect(PassiveValidatingEditor.validationCalls).toBe(0);
        expect(api.getCellEditorInstances()).toHaveLength(0);
    });

    test.each(['singleCell', 'fullRow'] as const)(
        'api.stopEditing reuses one stateful cell-validation result through %s commit and editor teardown',
        async (editType) => {
            const rowData = makeRowData();
            const api = await createGrid({
                columnDefs: [{ field: 'name', cellEditor: PassiveValidatingEditor }],
                editType,
                rowData,
            });
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const nameCell = cell(api, 0, 'name');
            await user.dblClick(nameCell);
            const nameInput = await waitForInput(gridElement, nameCell);
            await user.clear(nameInput);
            await user.type(nameInput, 'VALID');

            // The first result allows the commit; any repeated call in the same stop would change the verdict.
            PassiveValidatingEditor.validationCalls = 0;
            PassiveValidatingEditor.validationErrors = (_value, call) =>
                call === 1 ? null : ['Validator was called more than once'];

            api.stopEditing();

            expect(PassiveValidatingEditor.validationCalls).toBe(1);
            expect(rowData[0].name).toBe('VALID');
            expect(api.getCellEditorInstances()).toHaveLength(0);
        }
    );

    test('api.stopEditing reuses one stateful cell-validation result when closing batch editors', async () => {
        const rowData = makeRowData();
        const api = await createGrid({
            columnDefs: [{ field: 'name', cellEditor: PassiveValidatingEditor }],
            rowData,
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        api.startBatchEdit();
        const nameCell = cell(api, 0, 'name');
        await user.dblClick(nameCell);
        const nameInput = await waitForInput(gridElement, nameCell);
        await user.clear(nameInput);
        await user.type(nameInput, 'VALID');

        PassiveValidatingEditor.validationCalls = 0;
        PassiveValidatingEditor.validationErrors = (_value, call) =>
            call === 1 ? null : ['Validator was called more than once'];

        // In a batch, stopEditing closes the editors and stages their values without ending the batch.
        api.stopEditing();

        expect(PassiveValidatingEditor.validationCalls).toBe(1);
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(rowData[0].name).toBe('Alice');

        api.commitBatchEdit();

        expect(PassiveValidatingEditor.validationCalls).toBe(1);
        expect(rowData[0].name).toBe('VALID');
    });

    test('blocked Enter identifies an invalid earlier batch row when the current row is valid', async () => {
        const rowError = 'Weight (kg) must be at least 20';
        const api = await createGrid({
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const weight = Number(editorsState.find(({ colId }) => colId === 'weightKg')?.newValue);
                return weight < 20 ? [rowError] : null;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        api.startBatchEdit();
        api.getDisplayedRowAtIndex(0)!.setDataValue('weightKg', 10, 'batch');

        const nameCell = cell(api, 1, 'name');
        await user.dblClick(nameCell);
        const nameInput = await waitForInput(gridElement, nameCell);
        await waitForAriaAnnouncement(gridElement, rowError);

        await user.keyboard('{Enter}');

        await waitForAriaAnnouncement(
            gridElement,
            `Cannot complete row edit. Row 2, Full Row Validation: ${rowError}.`
        );
        expect(document.activeElement).toBe(nameInput);
        expect(api.getCellEditorInstances()).not.toHaveLength(0);
    });

    test.each([
        { boundary: 'first', rowIndex: 0, colId: 'name', key: '{Shift>}{Tab}{/Shift}' },
        { boundary: 'last', rowIndex: 1, colId: 'heightCm', key: '{Tab}' },
    ])(
        'blocked Tab at the $boundary grid boundary announces the completion error',
        async ({ rowIndex, colId, key }) => {
            const rowError = 'Weight (kg) must be at least 20';
            const api = await createGrid({
                getFullRowEditValidationErrors: ({ editorsState }) => {
                    const weight = Number(editorsState.find(({ colId }) => colId === 'weightKg')?.newValue);
                    return weight < 20 ? [rowError] : null;
                },
            });
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const weightKgCell = cell(api, rowIndex, 'weightKg');
            await user.dblClick(weightKgCell);
            const weightKgInput = await waitForInput(gridElement, weightKgCell);
            await user.clear(weightKgInput);
            await user.type(weightKgInput, '10');
            await waitForAriaAnnouncement(gridElement, `Full Row Validation: ${rowError}.`);

            const boundaryInput = await waitForInput(gridElement, cell(api, rowIndex, colId));
            await user.click(boundaryInput);
            expect(document.activeElement).toBe(boundaryInput);

            await user.keyboard(key);

            await waitForAriaAnnouncement(gridElement, `Cannot complete row edit. Full Row Validation: ${rowError}.`);
            expect(document.activeElement).toBe(boundaryInput);
            expect(api.getCellEditorInstances()).not.toHaveLength(0);
        }
    );

    test('blocked completion repeats a row-only error and retains focus in the current editor', async () => {
        const rowError = 'BMI is outside the realistic range';
        const api = await createGrid({
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const weight = Number(editorsState.find(({ colId }) => colId === 'weightKg')?.newValue);
                return weight < 20 ? [rowError] : null;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const weightKgCell = cell(api, 0, 'weightKg');
        await user.dblClick(weightKgCell);
        const weightKgInput = await waitForInput(gridElement, weightKgCell);
        await user.clear(weightKgInput);
        await user.type(weightKgInput, '10');
        const initialAnnouncement = await waitForAriaAnnouncement(gridElement, rowError);

        await user.keyboard('{Enter}');

        const completionAnnouncement = await waitFor(() => {
            const text = getAriaAnnouncementText(gridElement);
            expect(text).not.toBe(initialAnnouncement);
            expect(text).toMatch(/cannot complete.*row edit/i);
            expect(text).toContain(rowError);
            return text;
        });
        expect(completionAnnouncement).toBe(`Cannot complete row edit. Full Row Validation: ${rowError}.`);
        expect(document.activeElement).toBe(weightKgInput);
        expect(api.getCellEditorInstances()).not.toHaveLength(0);
    });

    test('Tab leaving a row with only a row error announces the blocked completion and keeps the current editor', async () => {
        const rowError = 'BMI is outside the realistic range';
        const api = await createGrid({
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const weight = Number(editorsState.find(({ colId }) => colId === 'weightKg')?.newValue);
                return weight < 20 ? [rowError] : null;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const weightKgCell = cell(api, 0, 'weightKg');
        await user.dblClick(weightKgCell);
        const weightKgInput = await waitForInput(gridElement, weightKgCell);
        await user.clear(weightKgInput);
        await user.type(weightKgInput, '10');
        await waitForAriaAnnouncement(gridElement, `Full Row Validation: ${rowError}.`);

        // The first Tab stays within the edited row, so unchanged validation is silent.
        await expectNoAriaAnnouncementMutation(gridElement, () => user.keyboard('{Tab}'));
        const heightInput = await waitForInput(gridElement, cell(api, 0, 'heightCm'));
        expect(document.activeElement).toBe(heightInput);

        // The next Tab would leave the row and is therefore a blocked completion attempt.
        await user.keyboard('{Tab}');

        await waitForAriaAnnouncement(gridElement, `Cannot complete row edit. Full Row Validation: ${rowError}.`);
        expect(document.activeElement).toBe(heightInput);
        expect(api.getCellEditorInstances()).not.toHaveLength(0);
        expect(cell(api, 1, 'name').querySelector('input')).toBeNull();
    });

    test('blocked completion announces cell errors in visible column order and aggregates the row error', async () => {
        const rowError = 'BMI is outside the realistic range';
        const api = await createGrid({
            columnDefs: [baseColumnDefs[0], baseColumnDefs[3], baseColumnDefs[1], baseColumnDefs[2]],
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const weight = Number(editorsState.find(({ colId }) => colId === 'weightKg')?.newValue);
                return weight < 20 ? [rowError] : null;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'heightCm'));

        const heightInput = await waitForInput(gridElement, cell(api, 0, 'heightCm'));
        await user.clear(heightInput);
        await user.type(heightInput, '400');

        const weightLbsInput = await waitForInput(gridElement, cell(api, 0, 'weightLbs'));
        await user.clear(weightLbsInput);
        await user.type(weightLbsInput, '3000');

        const weightKgInput = await waitForInput(gridElement, cell(api, 0, 'weightKg'));
        await user.clear(weightKgInput);
        await user.type(weightKgInput, '10');
        await waitForAriaAnnouncement(gridElement, rowError);

        await user.keyboard('{Enter}');

        const announcement = await waitForAriaAnnouncement(gridElement, /cannot complete.*row edit/i);
        expect(announcement).toBe(
            `Cannot complete row edit. Height (cm): Must be less than or equal to 300. ` +
                `Weight (lbs): Must be less than or equal to 500. Full Row Validation: ${rowError}.`
        );
    });

    test('uses locale text overrides for full-row validation and blocked completion announcements', async () => {
        const rowError = 'BMI is outside the realistic range';
        const secondError = 'Check Weight and Height';
        const api = await createGrid({
            localeText: {
                ariaFullRowValidationError: 'Row problem: ${variable}',
                ariaFullRowEditValidationFailed: 'Edit blocked. ${variable}',
                tooltipValidationErrorSeparator: '。',
            },
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const weight = Number(editorsState.find(({ colId }) => colId === 'weightKg')?.newValue);
                return weight < 20 ? [rowError, secondError] : null;
            },
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const weightKgCell = cell(api, 0, 'weightKg');
        await user.dblClick(weightKgCell);
        const weightKgInput = await waitForInput(gridElement, weightKgCell);
        await user.clear(weightKgInput);
        await user.type(weightKgInput, '10');

        const validationMessage = `${rowError}。${secondError}。`;
        await waitForAriaAnnouncement(gridElement, `Row problem: ${validationMessage}`);

        await user.keyboard('{Enter}');

        await waitForAriaAnnouncement(gridElement, `Edit blocked. Row problem: ${validationMessage}`);
    });
});
