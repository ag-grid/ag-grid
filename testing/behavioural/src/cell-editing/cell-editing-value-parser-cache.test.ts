import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import type { ColDef, ValueParserParams } from 'ag-grid-community';
import {
    LargeTextEditorModule,
    NumberEditorModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';

/**
 * AG-15846 regression: column `valueParser` should not be called repeatedly with the
 * same raw input during a single edit session. The fix memoises `getValue()` per editor
 * instance keyed on raw input — every code path (validation/sync/commit) that calls
 * `getValue()` shares this cache.
 *
 * Invariant tested: across one edit session, `valueParser` never receives the same raw
 * input twice. Each unique raw value parses at most once.
 */
describe('Cell Editing — valueParser cache (AG-15846)', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TextEditorModule, NumberEditorModule, LargeTextEditorModule, RichSelectModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    /**
     * Verifies the parser was never invoked twice with the same raw `newValue`.
     * Returns the list of raw inputs the parser saw in invocation order, for
     * stronger per-test assertions.
     */
    function expectNoRepeatedRawInputs(parser: ReturnType<typeof vi.fn>): unknown[] {
        const rawInputs = parser.mock.calls.map((c) => (c[0] as ValueParserParams).newValue);
        const seen = new Set<unknown>();
        for (const r of rawInputs) {
            expect(seen.has(r)).toBe(false);
            seen.add(r);
        }
        return rawInputs;
    }

    describe('parser is not called with duplicate raw inputs across one edit session', () => {
        test.each([
            { name: 'text', editor: 'agTextCellEditor', field: 'a', initial: 'hello', popup: false },
            { name: 'largeText', editor: 'agLargeTextCellEditor', field: 'a', initial: 'hello', popup: true },
            { name: 'number', editor: 'agNumberCellEditor', field: 'a', initial: 100, popup: false },
        ])('$name editor — open + commit unchanged', async ({ editor, field, initial, popup }) => {
            const valueParser = vi.fn((p: ValueParserParams) => p.newValue);

            const columnDefs: ColDef[] = [{ field, cellEditor: editor, valueParser, editable: true }];
            const api = await gridMgr.createGridAndWait('myGrid', { columnDefs, rowData: [{ [field]: initial }] });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', field));
            await userEvent.dblClick(cell);
            await asyncSetTimeout(1);

            await waitForInput(gridDiv, cell, { popup });

            // Commit unchanged: opening + closing the editor should not cause repeated parser calls
            // for the same raw input across the validation / sync / commit passes.
            await userEvent.keyboard('{Enter}');
            await asyncSetTimeout(1);

            expectNoRepeatedRawInputs(valueParser);
        });

        test('text editor — open, type, commit', async () => {
            const valueParser = vi.fn((p: ValueParserParams) => p.newValue);

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', cellEditor: 'agTextCellEditor', valueParser, editable: true }],
                rowData: [{ a: 'old' }],
            });
            await new GridColumns(api, `text editor — open, type, commit setup`).checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
            await new GridRows(api, `text editor — open, type, commit setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"old"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await userEvent.dblClick(cell);
            await asyncSetTimeout(1);

            const input = await waitForInput(gridDiv, cell);
            await userEvent.clear(input);
            await userEvent.keyboard('hi');
            await asyncSetTimeout(1);

            await userEvent.keyboard('{Enter}');
            await asyncSetTimeout(1);

            const rawInputs = expectNoRepeatedRawInputs(valueParser);

            // The committed value should have been parsed exactly once.
            expect(rawInputs).toContain('hi');
            expect(rawInputs.filter((v) => v === 'hi')).toHaveLength(1);
            await new GridRows(api, `text editor — open, type, commit final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"hi"
            `);
        });

        test('number editor — bug report scenario (AG-15846)', async () => {
            // Mirrors the user-reported reproduction: a column with a custom valueParser, click
            // the cell, type "0", press Enter. Before the fix the parser ran ~15 times; the
            // invariant we lock in is that no raw input is parsed twice within the session.
            const valueParser = vi.fn((p: ValueParserParams) => Number(p.newValue));

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'numberGood', cellEditor: 'agNumberCellEditor', valueParser, editable: true }],
                rowData: [{ numberGood: 1234 }],
            });
            await new GridColumns(api, `number editor — bug report scenario (AG-15846) setup`).checkColumns(`
                CENTER
                └── numberGood "Number Good" width:200 editable
            `);
            await new GridRows(api, `number editor — bug report scenario (AG-15846) setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 numberGood:1234
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'numberGood'));
            await userEvent.click(cell);
            await userEvent.keyboard('{Enter}'); // start edit (Enter on a focused cell)
            await asyncSetTimeout(1);

            const input = await waitForInput(gridDiv, cell);
            await userEvent.clear(input);
            await userEvent.keyboard('0');
            await asyncSetTimeout(1);

            await userEvent.keyboard('{Enter}'); // commit
            await asyncSetTimeout(1);

            const rawInputs = expectNoRepeatedRawInputs(valueParser);
            expect(rawInputs).toContain('0');
            expect(rawInputs.filter((v) => v === '0')).toHaveLength(1);
            await new GridRows(api, `number editor — bug report scenario (AG-15846) final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 numberGood:0
            `);
        });
    });

    describe('cache interacts correctly with validation rules', () => {
        // When validation rules are present, both `editor.getValidationErrors()` and the sync
        // path call `editor.getValue()`. The per-editor cache ensures `valueParser` runs at
        // most once per unique raw input across both call sites.
        test('text editor with maxLength validation', async () => {
            const valueParser = vi.fn((p: ValueParserParams) => p.newValue);

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        cellEditor: 'agTextCellEditor',
                        cellEditorParams: { maxLength: 100 },
                        valueParser,
                        editable: true,
                    },
                ],
                rowData: [{ a: 'short' }],
            });
            await new GridColumns(api, `text editor with maxLength validation setup`).checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
            await new GridRows(api, `text editor with maxLength validation setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"short"
            `);

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
            await userEvent.dblClick(cell);
            await asyncSetTimeout(1);

            const input = await waitForInput(gridDiv, cell);
            await userEvent.clear(input);
            await userEvent.keyboard('typed');
            await asyncSetTimeout(1);

            await userEvent.keyboard('{Enter}');
            await asyncSetTimeout(1);

            expectNoRepeatedRawInputs(valueParser);
            await new GridRows(api, `text editor with maxLength validation final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"typed"
            `);
        });
    });
});
