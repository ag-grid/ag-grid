import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import type { GridOptions, ICellEditorParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberEditorModule,
    PinnedRowModule,
    SelectEditorModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    BatchEditModule,
    CellSelectionModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    CustomEditorModule,
    RenderApiModule,
    RowGroupingModule,
} from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

interface PersonRow {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    age?: number;
    mood: string;
    country: string;
    address: string;
}

interface EventRow {
    id: string;
    firstName: string;
    lastName: string;
}

describe('Cell editing start/stop documentation examples', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            ClientSideRowModelModule,
            NumberEditorModule,
            TextEditorModule,
            SelectEditorModule,
            PinnedRowModule,
            BatchEditModule,
            CellSelectionModule,
            ColumnsToolPanelModule,
            ColumnMenuModule,
            ContextMenuModule,
            CustomEditorModule,
            RenderApiModule,
            RowGroupingModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.clearAllMocks();
    });

    test('cell editing start/stop doc example interactions', async () => {
        const baseRows: PersonRow[] = [
            {
                id: '0',
                firstName: 'Bob',
                lastName: 'Harrison',
                gender: 'Male',
                age: 21,
                mood: 'Happy',
                country: 'Ireland',
                address: '1197 Thunder Rd',
            },
            {
                id: '1',
                firstName: 'Mary',
                lastName: 'Wilson',
                gender: 'Female',
                age: 19,
                mood: 'Sad',
                country: 'Ireland',
                address: '3685 Rocky Gld',
            },
        ];

        const rowData: PersonRow[] = baseRows.map((row) => ({ ...row }));
        const pinnedRow: PersonRow = {
            id: 'pinned',
            firstName: '##',
            lastName: '##',
            gender: '##',
            address: '##',
            mood: '##',
            country: '##',
        };

        const eventLog: Array<[string, any]> = [];
        const expectEventSequence = async (expected: Array<[string, any]>) => {
            await asyncSetTimeout(0);
            expect(eventLog).toHaveLength(expected.length);
            const snapshot = [...eventLog];
            eventLog.length = 0;
            expect(snapshot).toEqual(expected);
        };

        const api = await gridsManager.createGridAndWait('cellEditingStartStop', {
            columnDefs: [
                { field: 'firstName' },
                { field: 'lastName' },
                { field: 'gender' },
                { field: 'age' },
                { field: 'mood' },
                { field: 'country' },
                { field: 'address', minWidth: 300 },
            ],
            rowData,
            pinnedTopRowData: [pinnedRow],
            pinnedBottomRowData: [pinnedRow],
            defaultColDef: {
                editable: true,
                flex: 1,
                minWidth: 110,
            },
            onCellEditingStarted: (event) => eventLog.push(['cellEditingStarted', { value: event.value }]),
            onCellValueChanged: (event) =>
                eventLog.push([
                    'cellValueChanged',
                    { newValue: event.newValue, oldValue: event.oldValue, source: event.source },
                ]),
            onCellEditingStopped: (event) =>
                eventLog.push([
                    'cellEditingStopped',
                    {
                        newValue: event.newValue,
                        oldValue: event.oldValue,
                        value: event.value,
                        valueChanged: event.valueChanged,
                    },
                ]),
        } satisfies GridOptions<PersonRow>);

        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        api.ensureColumnVisible('firstName');
        await asyncSetTimeout(0);
        const editableFirstNameCell = getByTestId(gridElement, agTestIdFor.cell('0', 'firstName'));

        await user.dblClick(editableFirstNameCell);
        await user.keyboard('Fred');
        await user.keyboard('{Enter}');
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(editableFirstNameCell).toHaveTextContent('Fred');
        await expectEventSequence([
            ['cellEditingStarted', { value: 'Bob' }],
            ['cellValueChanged', { newValue: 'Fred', oldValue: 'Bob', source: 'edit' }],
            ['cellEditingStopped', { newValue: 'Fred', oldValue: 'Bob', value: 'Fred', valueChanged: true }],
        ]);

        await user.click(editableFirstNameCell);
        await user.keyboard('{F2}');
        await user.keyboard('{End}dy');
        api.stopEditing();
        expect(editableFirstNameCell).toHaveTextContent('Freddy');
        await expectEventSequence([
            ['cellEditingStarted', { value: 'Fred' }],
            ['cellValueChanged', { newValue: 'Freddy', oldValue: 'Fred', source: 'edit' }],
            ['cellEditingStopped', { newValue: 'Freddy', oldValue: 'Fred', value: 'Freddy', valueChanged: true }],
        ]);

        await user.click(editableFirstNameCell);
        await user.keyboard('{F2}');
        await user.keyboard('X');
        api.stopEditing(true);
        expect(editableFirstNameCell).toHaveTextContent('Freddy');
        await expectEventSequence([
            ['cellEditingStarted', { value: 'Freddy' }],
            ['cellEditingStopped', { newValue: undefined, oldValue: 'Freddy', value: 'Freddy', valueChanged: false }],
        ]);

        await user.click(editableFirstNameCell);
        await user.keyboard('Hi');
        await user.keyboard('{Escape}');
        expect(editableFirstNameCell).toHaveTextContent('Freddy');
        await expectEventSequence([
            ['cellEditingStarted', { value: 'Freddy' }],
            ['cellEditingStopped', { newValue: undefined, oldValue: 'Freddy', value: 'Freddy', valueChanged: false }],
        ]);

        await user.click(editableFirstNameCell);
        await user.keyboard('Fred');
        await user.keyboard('{Enter}');
        expect(editableFirstNameCell).toHaveTextContent('Fred');
        await expectEventSequence([
            ['cellEditingStarted', { value: 'Freddy' }],
            ['cellValueChanged', { newValue: 'Fred', oldValue: 'Freddy', source: 'edit' }],
            ['cellEditingStopped', { newValue: 'Fred', oldValue: 'Freddy', value: 'Fred', valueChanged: true }],
        ]);

        rowData[0].firstName = 'Freddy';
        api.applyTransaction({ update: [rowData[0]] });
        expect(editableFirstNameCell).toHaveTextContent('Freddy');

        await new GridRows(api, 'cell editing start stop').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 firstName:"Freddy" lastName:"Harrison" gender:"Male" age:21 mood:"Happy" country:"Ireland" address:"1197 Thunder Rd"
            └── LEAF id:1 firstName:"Mary" lastName:"Wilson" gender:"Female" age:19 mood:"Sad" country:"Ireland" address:"3685 Rocky Gld"
        `);

        const makeEventRows = (): EventRow[] => [
            { id: '0', firstName: 'Ali', lastName: 'Johnson' },
            { id: '1', firstName: 'Bob', lastName: 'Harrison' },
        ];

        type EventLogEntry = [string, any];
        const editorEventLog: EventLogEntry[] = [];
        const pushEditorEventLog = (name: string, payload: any) => editorEventLog.push([name, payload]);
        let cancelBeforeStart = false;
        let cancelAfterEnd = false;

        class LoggingTestEditor {
            private input!: HTMLInputElement;

            public init(params: ICellEditorParams) {
                this.input = document.createElement('input');
                this.input.type = 'text';
                this.input.value = params.value ?? '';
            }

            public getGui(): HTMLElement {
                return this.input;
            }

            public afterGuiAttached() {
                this.input?.focus();
            }

            public getValue(): string | null {
                pushEditorEventLog('getValue', []);
                return this.input?.value ?? null;
            }

            public isCancelBeforeStart(): boolean {
                pushEditorEventLog('isCancelBeforeStart', []);
                return cancelBeforeStart;
            }

            public isCancelAfterEnd(): boolean {
                pushEditorEventLog('isCancelAfterEnd', []);
                return cancelAfterEnd;
            }
        }

        const eventsApi = await gridsManager.createGridAndWait('cellEditingStartStopEvents', {
            columnDefs: [
                { field: 'firstName', editable: true, cellEditor: LoggingTestEditor },
                { field: 'lastName', editable: true },
            ],
            rowData: makeEventRows(),
            getRowId: (params) => params.data.id,
            defaultColDef: {
                editable: true,
                flex: 1,
                minWidth: 110,
            },
            readOnlyEdit: false,
            onCellEditingStarted: (event) => pushEditorEventLog('cellEditingStarted', { value: event.value }),
            onCellValueChanged: (event) =>
                pushEditorEventLog('cellValueChanged', {
                    newValue: event.newValue,
                    oldValue: event.oldValue,
                    source: event.source,
                }),
            onCellEditingStopped: (event) =>
                pushEditorEventLog('cellEditingStopped', {
                    newValue: event.newValue,
                    oldValue: event.oldValue,
                    value: event.value,
                    valueChanged: event.valueChanged,
                }),
        } satisfies GridOptions<EventRow>);

        const eventsGridElement = getGridElement(eventsApi)! as HTMLElement;
        const eventsUser = userEvent.setup();
        const firstEventCell = () => getByTestId(eventsGridElement, agTestIdFor.cell('0', 'firstName'));
        const secondEventCell = () => getByTestId(eventsGridElement, agTestIdFor.cell('1', 'firstName'));

        await new GridRows(eventsApi, 'cell editing events baseline').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 firstName:"Ali" lastName:"Johnson"
            └── LEAF id:1 firstName:"Bob" lastName:"Harrison"
        `);

        const resetEventsState = async () => {
            editorEventLog.length = 0;
            cancelBeforeStart = false;
            cancelAfterEnd = false;
            eventsApi.setGridOption('rowData', makeEventRows());
            await asyncSetTimeout(0);
            firstEventCell();
        };

        const setReadOnlyEdit = (value: boolean) => {
            eventsApi.setGridOption('readOnlyEdit', value);
            return Promise.resolve();
        };

        const expectEditorEventSequence = async (expected: EventLogEntry[]) => {
            await asyncSetTimeout(0);
            expect(editorEventLog).toHaveLength(expected.length);
            const snapshot = [...editorEventLog];
            editorEventLog.length = 0;
            expect(snapshot).toEqual(expected);
        };

        const runEventScenario = async (
            _label: string,
            action: (readOnlyEdit: boolean) => Promise<void>,
            expectations: { true: EventLogEntry[]; false: EventLogEntry[] },
            options: {
                beforeStart?: boolean;
                afterEnd?: boolean;
                verifyDom?: (readOnlyEdit: boolean) => Promise<void>;
            } = {}
        ) => {
            for (const readOnlyEdit of [false, true] as const) {
                await resetEventsState();
                await setReadOnlyEdit(readOnlyEdit);
                cancelBeforeStart = options?.beforeStart ?? false;
                cancelAfterEnd = options?.afterEnd ?? false;
                await action(readOnlyEdit);
                await expectEditorEventSequence(expectations[String(readOnlyEdit) as 'true' | 'false']);
                await asyncSetTimeout(0);
                await options.verifyDom?.(readOnlyEdit);
            }
        };

        await runEventScenario(
            'edit enter stop',
            async () => {
                const cell = firstEventCell();
                await eventsUser.dblClick(cell);
                await eventsUser.keyboard('Fred');
                await eventsUser.keyboard('{Enter}');
            },
            {
                false: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['getValue', []],
                    ['cellValueChanged', { newValue: 'AliFred', oldValue: 'Ali', source: 'edit' }],
                    [
                        'cellEditingStopped',
                        { newValue: 'AliFred', oldValue: 'Ali', value: 'AliFred', valueChanged: true },
                    ],
                ],
                true: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['getValue', []],
                    [
                        'cellEditingStopped',
                        { newValue: 'AliFred', oldValue: 'Ali', value: 'AliFred', valueChanged: true },
                    ],
                ],
            }
        );

        await runEventScenario(
            'edit enter submit',
            async () => {
                const cell = firstEventCell();
                await eventsUser.dblClick(cell);
                await eventsUser.keyboard('Fred');
                await eventsUser.keyboard('{Enter}');
            },
            {
                false: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['getValue', []],
                    ['cellValueChanged', { newValue: 'AliFred', oldValue: 'Ali', source: 'edit' }],
                    [
                        'cellEditingStopped',
                        { newValue: 'AliFred', oldValue: 'Ali', value: 'AliFred', valueChanged: true },
                    ],
                ],
                true: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['getValue', []],
                    [
                        'cellEditingStopped',
                        { newValue: 'AliFred', oldValue: 'Ali', value: 'AliFred', valueChanged: true },
                    ],
                ],
            }
        );

        await runEventScenario(
            'edit cancel via escape',
            async () => {
                const cell = firstEventCell();
                await eventsUser.dblClick(cell);
                await eventsUser.keyboard('Fred');
                await eventsUser.keyboard('{Escape}');
            },
            {
                false: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['cellEditingStopped', { newValue: undefined, oldValue: 'Ali', value: 'Ali', valueChanged: false }],
                ],
                true: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['cellEditingStopped', { newValue: undefined, oldValue: 'Ali', value: 'Ali', valueChanged: false }],
                ],
            },
            {
                verifyDom: async (readOnly) => {
                    if (!readOnly) {
                        expect(firstEventCell()).toHaveTextContent('Ali');
                    }
                },
            }
        );

        await runEventScenario(
            'cancel before start',
            async () => {
                const cell = firstEventCell();
                await eventsUser.dblClick(cell);
            },
            {
                false: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStopped', { newValue: undefined, oldValue: 'Ali', value: 'Ali', valueChanged: false }],
                    ['cellEditingStarted', { value: 'Ali' }],
                ],
                true: [
                    ['isCancelBeforeStart', []],
                    [
                        'cellEditingStopped',
                        { newValue: undefined, oldValue: undefined, value: 'Ali', valueChanged: false },
                    ],
                    ['cellEditingStopped', { newValue: undefined, oldValue: 'Ali', value: 'Ali', valueChanged: false }],
                    ['cellEditingStarted', { value: 'Ali' }],
                ],
            },
            {
                beforeStart: true,
                verifyDom: async (readOnly) => {
                    if (!readOnly) {
                        expect(firstEventCell()).toHaveTextContent('Ali');
                    }
                },
            }
        );

        await runEventScenario(
            'cancel after enter',
            async () => {
                const cell = firstEventCell();
                await eventsUser.dblClick(cell);
                await eventsUser.keyboard('Fred');
                await eventsUser.keyboard('{Enter}');
            },
            {
                false: [
                    ['isCancelBeforeStart', []],
                    [
                        'cellEditingStopped',
                        { newValue: undefined, oldValue: undefined, value: 'Ali', valueChanged: false },
                    ],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['cellEditingStopped', { newValue: undefined, oldValue: 'Ali', value: 'Ali', valueChanged: false }],
                ],
                true: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['cellEditingStopped', { newValue: undefined, oldValue: 'Ali', value: 'Ali', valueChanged: false }],
                ],
            },
            {
                afterEnd: true,
                verifyDom: async (readOnly) => {
                    if (!readOnly) {
                        expect(firstEventCell()).toHaveTextContent('Ali');
                    }
                },
            }
        );

        await runEventScenario(
            'stop editing commit',
            async () => {
                const cell = firstEventCell();
                await eventsUser.dblClick(cell);
                await eventsUser.keyboard('Fred');
                eventsApi.stopEditing();
            },
            {
                false: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['getValue', []],
                    ['cellValueChanged', { newValue: 'AliFred', oldValue: 'Ali', source: 'edit' }],
                    [
                        'cellEditingStopped',
                        { newValue: 'AliFred', oldValue: 'Ali', value: 'AliFred', valueChanged: true },
                    ],
                ],
                true: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['getValue', []],
                    [
                        'cellEditingStopped',
                        { newValue: 'AliFred', oldValue: 'Ali', value: 'AliFred', valueChanged: true },
                    ],
                ],
            },
            {
                verifyDom: async (readOnly) => {
                    if (!readOnly) {
                        await expect(firstEventCell()).toHaveTextContent('AliFred');
                    }
                },
            }
        );

        await runEventScenario(
            'edit click another cell',
            async () => {
                const cell = firstEventCell();
                await eventsUser.dblClick(cell);
                await eventsUser.keyboard('Fred');
                await eventsUser.click(secondEventCell());
            },
            {
                false: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['getValue', []],
                    ['cellValueChanged', { newValue: 'AliFred', oldValue: 'Ali', source: 'edit' }],
                    [
                        'cellEditingStopped',
                        { newValue: 'AliFred', oldValue: 'Ali', value: 'AliFred', valueChanged: true },
                    ],
                ],
                true: [
                    ['isCancelBeforeStart', []],
                    ['cellEditingStarted', { value: 'Ali' }],
                    ['isCancelAfterEnd', []],
                    ['getValue', []],
                    [
                        'cellEditingStopped',
                        { newValue: 'AliFred', oldValue: 'Ali', value: 'AliFred', valueChanged: true },
                    ],
                ],
            },
            {
                verifyDom: async (readOnly) => {
                    if (!readOnly) {
                        expect(firstEventCell()).toHaveTextContent('Fred');
                    }
                },
            }
        );
    });
});
