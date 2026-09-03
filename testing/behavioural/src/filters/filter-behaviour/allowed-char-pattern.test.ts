import { userEvent } from '@testing-library/user-event';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    NumberFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';

/**
 * Black-box coverage for `allowedCharPattern`, shared by every text-input filter. Judged on the text an edit
 * brings in, so a drop, an autocorrect or a context-menu paste is held to it as a keystroke is.
 */
describe('allowedCharPattern', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, BigIntFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        // Restored first: a throw from `reset` would otherwise leave a spy mocked for the rest of the file.
        vi.restoreAllMocks();
        gridsManager.reset();
        // A test suppressing a warning must not leave it suppressed for the next one.
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    const numberColumn = (allowedCharPattern?: string) => [
        { field: 'val', filter: 'agNumberColumnFilter' as const, filterParams: { debounceMs: 0, allowedCharPattern } },
    ];

    // A pattern already written as a character class must not be wrapped in another, which would only ever
    // match a two-character string and so refuse every single character.
    test.each([
        ['a bare pattern', '\\d'],
        ['one already written as a character class', '[0-9]'],
    ])('admits the characters it names, given %s', async (_name, allowedCharPattern) => {
        const userSession = userEvent.setup();
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: numberColumn(allowedCharPattern),
            rowData: [{ val: 1234 }, { val: 7 }],
        });

        const input = (await ColumnFilterHarness.open(api, 'val')).input('text');
        await userSession.type(input, '1234');

        expect(input.value).toBe('1234');
        await new GridRows(api, 'the admitted digits filter').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 val:1234
        `);
    });

    test('refuses a typed character it does not name', async () => {
        const userSession = userEvent.setup();
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: numberColumn('\\d'),
            rowData: [{ val: 12 }],
        });

        const input = (await ColumnFilterHarness.open(api, 'val')).input('text');
        // Typed mid-sequence, so a refusal that swallowed the rest of the sequence would show.
        await userSession.type(input, '1a2');

        expect(input.value).toBe('12');
    });

    // The edits a `keydown` guard never saw. Each names its text differently, and a paste or a drop carries it
    // on the transfer rather than in `data`.
    test.each([
        ['a paste', 'insertFromPaste', true],
        ['a drop', 'insertFromDrop', true],
        ['an autocorrect', 'insertReplacementText', false],
    ] as const)('refuses %s bringing in a character it does not name', async (_name, inputType, onTransfer) => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: numberColumn('\\d'),
            rowData: [{ val: 12 }],
        });

        const input = (await ColumnFilterHarness.open(api, 'val')).input('text');
        await userEvent.setup().type(input, '12');

        const init: InputEventInit = { inputType, cancelable: true, bubbles: true };
        if (onTransfer) {
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/plain', '3a4');
            init.dataTransfer = dataTransfer;
        } else {
            init.data = '3a4';
        }
        // A synthetic event has no default action, so the refusal is only observable as the cancellation.
        expect(input.dispatchEvent(new InputEvent('beforeinput', init))).toBe(false);
        await asyncSetTimeout(0);

        expect(input.value).toBe('12');
    });

    // Documented on the parameter and on the docs page: a composition event cannot be cancelled, so an IME
    // and any keyboard that composes are not held to the pattern.
    test('lets composed text through, which is the exemption the parameter names', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: numberColumn('\\d'),
            rowData: [{ val: 12 }],
        });

        const input = (await ColumnFilterHarness.open(api, 'val')).input('text');
        await userEvent.setup().type(input, '12');

        const composed = new InputEvent('beforeinput', {
            inputType: 'insertCompositionText',
            data: '3a4',
            cancelable: true,
            bubbles: true,
        });
        // Not cancelled, where the same text through a paste is: the sibling test above pins that half.
        expect(input.dispatchEvent(composed)).toBe(true);
    });

    test('lets an edit whose every character it names through', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: numberColumn('\\d'),
            rowData: [{ val: 12 }, { val: 1234 }],
        });

        const input = (await ColumnFilterHarness.open(api, 'val')).input('text');
        await userEvent.setup().type(input, '12');
        input.focus();
        await userEvent.setup().paste('34');

        expect(input.value).toBe('1234');
        await new GridRows(api, 'the admitted paste reaches the filter').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 val:1234
        `);
    });

    test('never refuses a deletion, which brings nothing in', async () => {
        const userSession = userEvent.setup();
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: numberColumn('\\d'),
            rowData: [{ val: 12 }],
        });

        const input = (await ColumnFilterHarness.open(api, 'val')).input('text');
        await userSession.type(input, '123');
        await userSession.type(input, '{Backspace}');

        expect(input.value).toBe('12');
    });

    test('holds a floating filter input to the pattern as the popup is held', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    filterParams: { debounceMs: 0, allowedCharPattern: '\\d' },
                },
            ],
            rowData: [{ val: 12 }],
        });

        const input = FloatingFilterHarness.get(api, 'val').input();
        await userEvent.setup().type(input, '1a2');

        expect(input.value).toBe('12');
    });

    test('holds a bigint filter input to the pattern, which is where hex is typed', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint' as const,
                    filter: 'agBigIntColumnFilter' as const,
                    filterParams: { debounceMs: 0, allowedCharPattern: '\\dxXa-fA-F' },
                },
            ],
            rowData: [{ val: 255n }],
        });

        const input = (await ColumnFilterHarness.open(api, 'val')).input('text');
        // The refused character is typed mid-sequence, so a refusal that swallowed the rest would show.
        await userEvent.setup().type(input, '0xFzF');

        expect(input.value).toBe('0xFF');
    });

    // A filter input is built while the header and the filter panel are, where throwing takes down the grid.
    test('a pattern that will not compile is reported rather than thrown', async () => {
        // Deliberate: the pattern that will not compile is reported as warning #327.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [327] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    filterParams: { debounceMs: 0, allowedCharPattern: '\\' },
                },
            ],
            rowData: [{ val: 1 }, { val: 12 }],
        });

        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #327');
        expect(warnings).toContain('allowedCharPattern');

        // Held to nothing, rather than to a pattern that refuses everything.
        const input = FloatingFilterHarness.get(api, 'val').input();
        await userEvent.setup().type(input, '12');
        expect(input.value).toBe('12');
        await new GridRows(api, 'a pattern that could not compile constrains nothing').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 val:12
        `);
    });

    // The pattern is read once, when an input is built, so a new one takes effect only by replacing the
    // element. Identity is asserted too: the value alone would read the same whichever happened.
    test('a pattern replaced at runtime replaces the input holding the old one', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: numberColumn('\\d'),
            rowData: [{ val: 1 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        const before = filter.input('text');
        await userEvent.setup().type(before, '1a');
        expect(before.value).toBe('1');

        api.setGridOption('columnDefs', numberColumn('\\da-z'));
        await asyncSetTimeout(0);

        const after = filter.input('text');
        expect(after).not.toBe(before);
        await userEvent.setup().type(after, 'a');
        expect(after.value).toBe('1a');
    });
});
