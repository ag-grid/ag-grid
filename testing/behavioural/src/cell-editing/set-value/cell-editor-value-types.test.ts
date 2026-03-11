import {
    CheckboxEditorModule,
    DateEditorModule,
    LargeTextEditorModule,
    NumberEditorModule,
    RenderApiModule,
    SelectEditorModule,
    TextEditorModule,
} from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../../test-utils';

/**
 * Tests for getDataValue / setDataValue type conversion correctness.
 *
 * Each built-in cell editor has its own getValue() implementation that may convert the
 * raw editor widget value (always a string internally) into the column's data type
 * (e.g. number, Date, boolean). These tests verify that the round-trip:
 *
 *   typed data → editor initialisation → getValue() (via from:'edit') → correct type
 *   setDataValue(typedValue, 'edit') → getValue() (via from:'edit') → correct type
 *   stopEditing() → rowNode.data[col] → correct type
 *
 * is correct for all built-in editors.
 */
describe('Cell Editor Value Types: getDataValue / setDataValue type conversion', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            RenderApiModule,
            TextEditorModule,
            NumberEditorModule,
            DateEditorModule,
            SelectEditorModule,
            CheckboxEditorModule,
            LargeTextEditorModule,
            RichSelectModule,
        ],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    // ---------------------------------------------------------------------------
    // agTextCellEditor
    // ---------------------------------------------------------------------------
    describe('agTextCellEditor', () => {
        test('initial string value round-trips as string', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'hello' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('hello');
            expect(typeof value).toBe('string');
        });

        test('setDataValue string round-trips as string', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'updated', 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('updated');
            expect(typeof value).toBe('string');
        });

        test('commit path preserves string type in data', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'committed', 'edit');
            await asyncSetTimeout(1);

            api.stopEditing();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('committed');
            expect(typeof rowNode.data.a).toBe('string');
        });
    });

    // ---------------------------------------------------------------------------
    // agNumberCellEditor
    // ---------------------------------------------------------------------------
    describe('agNumberCellEditor', () => {
        test('initial number value round-trips as number', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agNumberCellEditor' }],
                rowData: [{ id: '0', a: 42 }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe(42);
            expect(typeof value).toBe('number');
        });

        test('setDataValue number round-trips as number', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agNumberCellEditor' }],
                rowData: [{ id: '0', a: 10 }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 99, 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe(99);
            expect(typeof value).toBe('number');
        });

        test('setDataValue null results in null from editor', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agNumberCellEditor' }],
                rowData: [{ id: '0', a: 10 }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', null, 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBeNull();
        });

        test('commit path preserves number type in data', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agNumberCellEditor' }],
                rowData: [{ id: '0', a: 10 }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 77, 'edit');
            await asyncSetTimeout(1);

            api.stopEditing();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe(77);
            expect(typeof rowNode.data.a).toBe('number');
        });
    });

    // ---------------------------------------------------------------------------
    // agDateCellEditor
    // ---------------------------------------------------------------------------
    describe('agDateCellEditor', () => {
        test('initial Date value round-trips as Date object', async () => {
            // Use local-time constructor to avoid UTC-vs-local serialisation differences
            const initialDate = new Date(2024, 0, 15); // Jan 15, 2024 local time
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agDateCellEditor' }],
                rowData: [{ id: '0', a: initialDate }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            // The editor returns a Date from input.valueAsDate (UTC).
            // Verify it's a Date with the expected year/month/day components.
            expect(value).toBeInstanceOf(Date);
        });

        test('setDataValue Date round-trips as Date object', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agDateCellEditor' }],
                rowData: [{ id: '0', a: new Date(2024, 0, 15) }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const newDate = new Date(2025, 5, 20); // June 20, 2025 local time
            rowNode.setDataValue('a', newDate, 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBeInstanceOf(Date);
            // Year and month should round-trip correctly through the ISO-string serialisation
            expect((value as Date).getUTCFullYear()).toBe(2025);
            expect((value as Date).getUTCMonth()).toBe(5); // June
        });

        test('commit path preserves Date type in data', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agDateCellEditor' }],
                rowData: [{ id: '0', a: new Date(2024, 0, 15) }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const newDate = new Date(2025, 5, 20); // June 20, 2025 local time
            rowNode.setDataValue('a', newDate, 'edit');
            await asyncSetTimeout(1);

            // Capture what the editor says the value is, then verify data matches after commit
            const editValue = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' }) as Date;
            expect(editValue).toBeInstanceOf(Date);

            api.stopEditing();
            await asyncSetTimeout(1);

            // The committed data value must be a Date with the same time as what the editor returned
            expect(rowNode.data.a).toBeInstanceOf(Date);
            expect((rowNode.data.a as Date).getTime()).toBe(editValue.getTime());
        });
    });

    // ---------------------------------------------------------------------------
    // agDateStringCellEditor
    // ---------------------------------------------------------------------------
    describe('agDateStringCellEditor', () => {
        test('initial date string value round-trips as string', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agDateStringCellEditor' }],
                rowData: [{ id: '0', a: '2024-01-15' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('2024-01-15');
            expect(typeof value).toBe('string');
        });

        test('setDataValue date string round-trips as string', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agDateStringCellEditor' }],
                rowData: [{ id: '0', a: '2024-01-15' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', '2025-06-20', 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('2025-06-20');
            expect(typeof value).toBe('string');
        });

        test('commit path preserves date string type in data', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agDateStringCellEditor' }],
                rowData: [{ id: '0', a: '2024-01-15' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', '2025-06-20', 'edit');
            await asyncSetTimeout(1);

            api.stopEditing();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('2025-06-20');
            expect(typeof rowNode.data.a).toBe('string');
        });
    });

    // ---------------------------------------------------------------------------
    // agCheckboxCellEditor
    // ---------------------------------------------------------------------------
    describe('agCheckboxCellEditor', () => {
        test('initial boolean true value round-trips as boolean', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agCheckboxCellEditor' }],
                rowData: [{ id: '0', a: true }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe(true);
            expect(typeof value).toBe('boolean');
        });

        test('initial boolean false value round-trips as boolean', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agCheckboxCellEditor' }],
                rowData: [{ id: '0', a: false }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe(false);
            expect(typeof value).toBe('boolean');
        });

        test('setDataValue true round-trips as boolean true', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agCheckboxCellEditor' }],
                rowData: [{ id: '0', a: false }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', true, 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe(true);
            expect(typeof value).toBe('boolean');
        });

        test('setDataValue false round-trips as boolean false', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agCheckboxCellEditor' }],
                rowData: [{ id: '0', a: true }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', false, 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe(false);
            expect(typeof value).toBe('boolean');
        });

        test('commit path preserves boolean type in data', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [{ field: 'a', editable: true, cellEditor: 'agCheckboxCellEditor' }],
                rowData: [{ id: '0', a: false }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', true, 'edit');
            await asyncSetTimeout(1);

            api.stopEditing();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe(true);
            expect(typeof rowNode.data.a).toBe('boolean');
        });
    });

    // ---------------------------------------------------------------------------
    // agSelectCellEditor
    // ---------------------------------------------------------------------------
    describe('agSelectCellEditor', () => {
        test('initial value from values list round-trips as same value', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agSelectCellEditor',
                        cellEditorParams: { values: ['alpha', 'beta', 'gamma'] },
                    },
                ],
                rowData: [{ id: '0', a: 'beta' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('beta');
        });

        test('setDataValue to list item round-trips correctly', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agSelectCellEditor',
                        cellEditorParams: { values: ['alpha', 'beta', 'gamma'] },
                    },
                ],
                rowData: [{ id: '0', a: 'alpha' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'gamma', 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('gamma');
        });

        test('numeric values preserve number type through select editor', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agSelectCellEditor',
                        cellEditorParams: { values: [1, 2, 3] },
                    },
                ],
                rowData: [{ id: '0', a: 2 }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 3, 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe(3);
            expect(typeof value).toBe('number');
        });

        test('commit path preserves value type in data', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agSelectCellEditor',
                        cellEditorParams: { values: ['alpha', 'beta', 'gamma'] },
                    },
                ],
                rowData: [{ id: '0', a: 'alpha' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'gamma', 'edit');
            await asyncSetTimeout(1);

            api.stopEditing();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('gamma');
        });
    });

    // ---------------------------------------------------------------------------
    // agLargeTextCellEditor
    // ---------------------------------------------------------------------------
    describe('agLargeTextCellEditor', () => {
        test('initial string value round-trips as string', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    { field: 'a', editable: true, cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true },
                ],
                rowData: [{ id: '0', a: 'long text here' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('long text here');
            expect(typeof value).toBe('string');
        });

        test('setDataValue string round-trips as string', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    { field: 'a', editable: true, cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true },
                ],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'updated long text', 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('updated long text');
            expect(typeof value).toBe('string');
        });

        test('commit path preserves string type in data', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    { field: 'a', editable: true, cellEditor: 'agLargeTextCellEditor', cellEditorPopup: true },
                ],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'committed text', 'edit');
            await asyncSetTimeout(1);

            api.stopEditing();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('committed text');
            expect(typeof rowNode.data.a).toBe('string');
        });
    });

    // ---------------------------------------------------------------------------
    // agRichSelectCellEditor (Enterprise)
    // ---------------------------------------------------------------------------
    describe('agRichSelectCellEditor', () => {
        test('initial value from values list round-trips as same value', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agRichSelectCellEditor',
                        cellEditorParams: { values: ['alpha', 'beta', 'gamma'] },
                    },
                ],
                rowData: [{ id: '0', a: 'beta' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('beta');
        });

        test('setDataValue to list item round-trips correctly', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agRichSelectCellEditor',
                        cellEditorParams: { values: ['alpha', 'beta', 'gamma'] },
                    },
                ],
                rowData: [{ id: '0', a: 'alpha' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'gamma', 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe('gamma');
        });

        test('numeric values preserve number type through rich select editor', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agRichSelectCellEditor',
                        cellEditorParams: { values: [1, 2, 3] },
                    },
                ],
                rowData: [{ id: '0', a: 2 }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 3, 'edit');
            await asyncSetTimeout(1);

            const value = api.getCellValue({ rowNode, colKey: 'a', from: 'edit' });
            expect(value).toBe(3);
            expect(typeof value).toBe('number');
        });

        test('commit path preserves value type in data', async () => {
            const api = await gridMgr.createGridAndWait('grid', {
                columnDefs: [
                    {
                        field: 'a',
                        editable: true,
                        cellEditor: 'agRichSelectCellEditor',
                        cellEditorParams: { values: ['alpha', 'beta', 'gamma'] },
                    },
                ],
                rowData: [{ id: '0', a: 'alpha' }],
                getRowId: (p) => p.data.id,
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'gamma', 'edit');
            await asyncSetTimeout(1);

            api.stopEditing();
            await asyncSetTimeout(1);

            expect(rowNode.data.a).toBe('gamma');
        });
    });
});
