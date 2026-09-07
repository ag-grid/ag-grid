import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { GridRows, TestGridsManager, waitForInput } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    DateEditorModule,
    LocaleModule,
    NumberEditorModule,
    TextEditorModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

interface PersonRow {
    athlete: string;
    age: number;
    when: Date;
}

function makeRowData(): PersonRow[] {
    return [
        { athlete: 'Alice', age: 23, when: new Date(2020, 0, 15) },
        { athlete: 'Bob', age: 40, when: new Date(2020, 5, 10) },
    ];
}

describe('Cell editing validation — editor types and custom hooks', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            ClientSideRowModelModule,
            NumberEditorModule,
            TextEditorModule,
            DateEditorModule,
            CustomEditorModule,
            LocaleModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.clearAllMocks();
    });

    const cell = (api: GridApi, rowIndex: number, colId: string): HTMLElement => {
        const gridElement = getGridElement(api)! as HTMLElement;
        return gridElement.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="${colId}"]`)!;
    };

    const editorCount = (api: GridApi): number => api.getCellEditorInstances().length;

    describe('Number editor — min violation', () => {
        const columnDefs: ColDef<PersonRow>[] = [
            { field: 'athlete' },
            { field: 'age', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 100 } },
        ];

        const create = (invalidEditValueMode: 'revert' | 'block', rowData: PersonRow[]) =>
            gridsManager.createGridAndWait(`number-min-${invalidEditValueMode}`, {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType: 'singleCell',
                invalidEditValueMode,
            } satisfies GridOptions<PersonRow>);

        test('block: value below min keeps editor open, sets ARIA/validity, clears when made valid', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '-5');

            // DOM/ARIA side-effects of an invalid edit, asserted live while the editor is open.
            expect(ageInput.getAttribute('aria-invalid')).toBe('true');
            expect(ageInput.validationMessage).toContain('greater than or equal to 0');

            await new GridRows(api, 'block: -5 typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');

            // Blocked: editor stays open, value not committed.
            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);

            await new GridRows(api, 'block: invalid -5 held in the editor, marked ❌, data still 23').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Retype a valid value — invalid state clears without committing (still blocked open until Enter).
            await user.clear(ageInput);
            await user.type(ageInput, '55');
            expect(ageInput.getAttribute('aria-invalid')).toBe('false');
            expect(ageInput.validationMessage).toBe('');

            await new GridRows(api, 'block: valid 55 held in the editor, no ❌, data still 23 until Enter').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 athlete:"Alice" age:🖍️55 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: value below min reverts and closes on Enter', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '-5');
            await new GridRows(api, 'revert: -5 typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(23);

            await new GridRows(api, 'revert: invalid -5 reverted to source 23').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });

    describe('Number editor — custom getValidationErrors callback', () => {
        // Combines internal min/max rules with a custom rule; returns internalErrors passthrough when present.
        const columnDefs: ColDef<PersonRow>[] = [
            { field: 'athlete' },
            {
                field: 'age',
                cellEditor: 'agNumberCellEditor',
                cellEditorParams: {
                    min: 0,
                    max: 100,
                    getValidationErrors: ({
                        value,
                        internalErrors,
                    }: {
                        value: number;
                        internalErrors: string[] | null;
                    }) => {
                        if (internalErrors) {
                            return [...internalErrors, 'Custom rule failed'];
                        }
                        if (value === 42) {
                            return ['42 is not allowed'];
                        }
                        return null;
                    },
                },
            },
        ];

        const create = (invalidEditValueMode: 'revert' | 'block', rowData: PersonRow[]) =>
            gridsManager.createGridAndWait(`number-custom-${invalidEditValueMode}`, {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType: 'singleCell',
                invalidEditValueMode,
            } satisfies GridOptions<PersonRow>);

        test('block: custom-only error keeps editor open and does not commit', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '42');
            expect(ageInput.validationMessage).toBe('42 is not allowed');

            await new GridRows(api, 'block: custom-rejected 42 typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');
            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);

            await new GridRows(api, 'block: custom-rejected 42 held in the editor, marked ❌').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('block: internalErrors passed through and combined with the custom rule', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '999');

            // Both the internal max message and the appended custom message are present (joined with '. ').
            expect(ageInput.validationMessage).toContain('less than or equal to 100');
            expect(ageInput.validationMessage).toContain('Custom rule failed');

            await new GridRows(api, 'block: 999 typed against both rules, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');
            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);

            await new GridRows(api, 'block: internal max + custom error hold invalid 999 in the editor ❌').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('block: a value passing every rule commits and closes', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '50');
            await new GridRows(api, 'block: valid 50 typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:"Alice" age:🖍️50 23
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(50);

            await new GridRows(api, 'valid 50 committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:50
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('uses the locale validation separator for the native validity message', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('number-custom-locale-separator', {
                columnDefs: [
                    { field: 'athlete' },
                    {
                        field: 'age',
                        cellEditor: 'agNumberCellEditor',
                        cellEditorParams: {
                            getValidationErrors: () => ['First error', 'Second error'],
                        },
                    },
                ],
                rowData,
                defaultColDef: { editable: true },
                invalidEditValueMode: 'block',
                localeText: { tooltipValidationErrorSeparator: ' / ' },
            } satisfies GridOptions<PersonRow>);
            const gridElement = getGridElement(api)! as HTMLElement;

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridElement, ageCell);

            expect(ageInput.validationMessage).toBe('First error / Second error');
        });
    });

    describe('Text editor — maxLength behaviour', () => {
        const columnDefs: ColDef<PersonRow>[] = [
            { field: 'athlete', cellEditor: 'agTextCellEditor', cellEditorParams: { maxLength: 5 } },
            { field: 'age' },
        ];

        // NOTE: maxLength maps to the native input `maxlength` attribute (setMaxLength). The input
        // caps the typed length, so `getValidationErrors` never sees an over-length value and the
        // edit commits (capped). maxLength does NOT surface as a validation error via typing.
        test('block: maxLength caps the input rather than producing a validation error', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('text-maxlength-block', {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType: 'singleCell',
                invalidEditValueMode: 'block',
            } satisfies GridOptions<PersonRow>);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const athleteCell = cell(api, 0, 'athlete');
            await user.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridElement, athleteCell);
            await user.clear(athleteInput);
            await user.type(athleteInput, 'ABCDEFGHIJ');

            // Native maxlength caps the value; no validation error is produced.
            expect(athleteInput.value.length).toBeLessThanOrEqual(5);
            expect(athleteInput.getAttribute('aria-invalid')).not.toBe('true');
            expect(athleteInput.validationMessage).toBe('');

            await new GridRows(api, 'block: over-long text typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:🖍️"ABCDE" "Alice" age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');

            // Capped value commits normally.
            expect(editorCount(api)).toBe(0);
            expect(rowData[0].athlete).toBe('ABCDE');

            // No validation error path: the capped value committed cleanly, no markers remain.
            await new GridRows(api, 'block: maxLength-capped value committed cleanly').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"ABCDE" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });

    describe('Text editor — custom getValidationErrors callback', () => {
        const columnDefs: ColDef<PersonRow>[] = [
            {
                field: 'athlete',
                cellEditor: 'agTextCellEditor',
                cellEditorParams: {
                    getValidationErrors: ({ value }: { value: string }) =>
                        value === 'BAD' ? ['Name not allowed'] : null,
                },
            },
            { field: 'age' },
        ];

        const create = (invalidEditValueMode: 'revert' | 'block', rowData: PersonRow[]) =>
            gridsManager.createGridAndWait(`text-custom-${invalidEditValueMode}`, {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType: 'singleCell',
                invalidEditValueMode,
            } satisfies GridOptions<PersonRow>);

        test('block: custom error keeps editor open and sets validity', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const athleteCell = cell(api, 0, 'athlete');
            await user.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridElement, athleteCell);
            await user.clear(athleteInput);
            await user.type(athleteInput, 'BAD');
            expect(athleteInput.getAttribute('aria-invalid')).toBe('true');
            expect(athleteInput.validationMessage).toBe('Name not allowed');

            await new GridRows(api, 'block: rejected text typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice"❌ age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');
            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].athlete).toBe('Alice');

            // Custom rule rejected "BAD": editor held open, flagged ❌, source name intact.
            await new GridRows(api, 'block: custom text error held in the editor ❌').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice"❌ age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: custom error reverts and closes on Enter', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const athleteCell = cell(api, 0, 'athlete');
            await user.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridElement, athleteCell);
            await user.clear(athleteInput);
            await user.type(athleteInput, 'BAD');
            await new GridRows(api, 'revert: rejected text typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice"❌ age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].athlete).toBe('Alice');

            // Revert discarded "BAD" and closed the editor — source name restored, no markers.
            await new GridRows(api, 'revert: custom text error reverted to source').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });

    describe('Date editor — custom getValidationErrors callback', () => {
        // Date min/max relies on the native date input reporting `valueAsDate`, which is not driven
        // reliably by simulated typing under happy-dom; a custom rule exercises the DateEditor path instead.
        const columnDefs: ColDef<PersonRow>[] = [
            { field: 'athlete' },
            {
                field: 'when',
                cellEditor: 'agDateCellEditor',
                cellEditorParams: {
                    getValidationErrors: ({ value }: { value: Date | null }) =>
                        value && value.getUTCFullYear() < 2000 ? ['Date too early'] : null,
                },
            },
        ];

        const create = (invalidEditValueMode: 'revert' | 'block', rowData: PersonRow[]) =>
            gridsManager.createGridAndWait(`date-custom-${invalidEditValueMode}`, {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType: 'singleCell',
                invalidEditValueMode,
            } satisfies GridOptions<PersonRow>);

        test('block: too-early date keeps editor open and does not commit', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const whenCell = cell(api, 0, 'when');
            await user.dblClick(whenCell);
            const whenInput = await waitForInput(gridElement, whenCell);
            await user.clear(whenInput);
            await user.type(whenInput, '1995-06-15');
            expect(whenInput.validationMessage).toBe('Date too early');

            await new GridRows(api, 'block: too-early date typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" when:"2020-01-15"❌
            └── LEAF id:1 athlete:"Bob" when:"2020-06-10"
        `);

            await user.keyboard('{Enter}');
            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].when).toEqual(new Date(2020, 0, 15));

            // Custom rule rejected the too-early date: editor held open ❌, source date intact.
            await new GridRows(api, 'block: too-early date held in the editor ❌').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" when:"2020-01-15"❌
                └── LEAF id:1 athlete:"Bob" when:"2020-06-10"
            `);
        });

        test('revert: too-early date reverts and closes on Enter', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const whenCell = cell(api, 0, 'when');
            await user.dblClick(whenCell);
            const whenInput = await waitForInput(gridElement, whenCell);
            await user.clear(whenInput);
            await user.type(whenInput, '1995-06-15');
            await new GridRows(api, 'revert: too-early date typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" when:"2020-01-15"❌
            └── LEAF id:1 athlete:"Bob" when:"2020-06-10"
        `);

            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].when).toEqual(new Date(2020, 0, 15));

            // Revert discarded the invalid date and closed the editor — source date restored.
            await new GridRows(api, 'revert: too-early date reverted to source').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" when:"2020-01-15"
                └── LEAF id:1 athlete:"Bob" when:"2020-06-10"
            `);
        });
    });

    describe('Date string editor — custom getValidationErrors callback', () => {
        test('a required error clears and exposes the custom-formatted value after a complete date', async () => {
            interface Row {
                when?: string;
            }

            const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            const validationValues: Array<string | null | undefined> = [];
            const rowData: Row[] = [{}];
            const api = await gridsManager.createGridAndWait('date-string-required', {
                columnDefs: [
                    {
                        field: 'when',
                        editable: true,
                        cellDataType: 'customDateString',
                        cellEditor: 'agDateStringCellEditor',
                        cellEditorParams: {
                            getValidationErrors: ({ value }: { value: string | null | undefined }) => {
                                validationValues.push(value);
                                return value == null || value === '' ? ['Required'] : null;
                            },
                        },
                    },
                ],
                dataTypeDefinitions: {
                    customDateString: {
                        baseDataType: 'dateString',
                        extendsDataType: 'dateString',
                        valueParser: ({ newValue }) => (datePattern.test(newValue) ? newValue : null),
                        dataTypeMatcher: (value) => typeof value === 'string' && datePattern.test(value),
                        dateParser: (value) => {
                            const match = value?.match(datePattern);
                            return match
                                ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
                                : undefined;
                        },
                        dateFormatter: (value) =>
                            value
                                ? `${String(value.getDate()).padStart(2, '0')}/${String(value.getMonth() + 1).padStart(2, '0')}/${value.getFullYear()}`
                                : undefined,
                    },
                },
                rowData,
                invalidEditValueMode: 'block',
            } satisfies GridOptions<Row>);

            api.startEditingCell({ rowIndex: 0, colKey: 'when' });
            const whenCell = cell(api, 0, 'when');
            const whenInput = await waitForInput(getGridElement(api)! as HTMLElement, whenCell);

            // An incomplete native date has no value, so the required rule marks it invalid.
            whenInput.value = '';
            whenInput.dispatchEvent(new Event('input', { bubbles: true }));
            await waitFor(() => expect(whenInput.validationMessage).toBe('Required'));
            expect(validationValues.at(-1)).toBeUndefined();

            // The previous custom validity must not hide the newly completed date from the callback.
            whenInput.value = '2012-12-12';
            whenInput.dispatchEvent(new Event('input', { bubbles: true }));
            await waitFor(() => expect(validationValues.at(-1)).toBe('12/12/2012'));
            expect(whenInput.validationMessage).toBe('');
            expect(whenInput.getAttribute('aria-invalid')).toBe('false');

            api.stopEditing();
            expect(rowData[0].when).toBe('12/12/2012');
        });
    });

    describe('fullRow — per-cell custom validation blocks the whole row', () => {
        const columnDefs: ColDef<PersonRow>[] = [
            { field: 'athlete' },
            {
                field: 'age',
                cellEditor: 'agNumberCellEditor',
                cellEditorParams: {
                    getValidationErrors: ({ value }: { value: number }) =>
                        value === 42 ? ['42 is not allowed'] : null,
                },
            },
        ];

        test('block: an invalid cell keeps every row editor open on Enter', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('fullrow-custom-block', {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType: 'fullRow',
                invalidEditValueMode: 'block',
            } satisfies GridOptions<PersonRow>);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const ageCell = cell(api, 0, 'age');
            await user.dblClick(ageCell);
            const ageInput = await waitForInput(gridElement, ageCell);
            await user.clear(ageInput);
            await user.type(ageInput, '42');
            await new GridRows(api, 'fullRow block: invalid age typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');

            // Full-row edit opens editors on every editable cell; the invalid cell blocks all of them.
            expect(editorCount(api)).toBeGreaterThan(1);
            expect(rowData[0].age).toBe(23);

            await new GridRows(api, 'fullRow block: invalid age 42 marked ❌ holds the whole row open').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });

    describe('Custom cell editor (CustomEditorModule) implementing getValidationErrors', () => {
        class ValidatingEditor implements ICellEditorComp {
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
                return this.eGui.value === 'INVALID' ? ['Custom editor rejected value'] : null;
            }
        }

        test('block: custom editor validation error keeps the editor open', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('custom-editor-block', {
                columnDefs: [{ field: 'athlete', cellEditor: ValidatingEditor }, { field: 'age' }],
                rowData,
                defaultColDef: { editable: true },
                editType: 'singleCell',
                invalidEditValueMode: 'block',
            } satisfies GridOptions<PersonRow>);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const athleteCell = cell(api, 0, 'athlete');
            await user.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridElement, athleteCell);
            await user.clear(athleteInput);
            await user.type(athleteInput, 'INVALID');
            await new GridRows(api, 'block: custom editor value typed, before Enter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:"Alice" age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);

            await user.keyboard('{Enter}');

            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].athlete).toBe('Alice');

            await new GridRows(api, 'block: custom editor rejected "INVALID", held in the editor ❌').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice"❌ age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });

    describe('Composite custom cell editor (multiple inputs)', () => {
        // Renders two inputs; the value lives in the second, so the first is an "arbitrary" input.
        // GridRows must not compare its DOM value against getValue() — that input never holds it.
        class CompositeEditor implements ICellEditorComp {
            private eGui!: HTMLElement;
            private eValue!: HTMLInputElement;

            public init(params: ICellEditorParams): void {
                this.eGui = document.createElement('div');
                const decorative = document.createElement('input');
                decorative.value = 'decorative';
                this.eValue = document.createElement('input');
                this.eValue.value = String(params.value ?? '');
                this.eGui.appendChild(decorative);
                this.eGui.appendChild(this.eValue);
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }

            public afterGuiAttached(): void {
                this.eValue.focus();
            }

            public getValue(): string {
                return this.eValue.value;
            }
        }

        test('a valid value held open is not reported as a DOM value mismatch', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('custom-editor-composite', {
                columnDefs: [{ field: 'athlete', cellEditor: CompositeEditor }, { field: 'age' }],
                rowData,
                defaultColDef: { editable: true },
                editType: 'singleCell',
                invalidEditValueMode: 'block',
            } satisfies GridOptions<PersonRow>);
            const gridElement = getGridElement(api)! as HTMLElement;
            const user = userEvent.setup();

            const athleteCell = cell(api, 0, 'athlete');
            await user.dblClick(athleteCell);
            const valueInput = await waitForInput(gridElement, athleteCell, { selector: 'input:nth-of-type(2)' });
            await user.clear(valueInput);
            await user.type(valueInput, 'Amy');

            expect(editorCount(api)).toBeGreaterThan(0);

            // The first (decorative) input holds "decorative" ≠ getValue() "Amy"; GridRows tolerates it
            // because a composite editor's value need not map to any single input.
            await new GridRows(api, 'composite editor: valid value held open, no value-mismatch error').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });
});
