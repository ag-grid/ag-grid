import { BASE_URL } from '../../../../packages/ag-grid-community/src/baseUrl';
import { getErrorParamNames, getErrorText, getErrorTextDetails, getMissingErrorParams } from './getErrorText';

// `BASE_URL` is rewritten at release time — localhost while developing, the archive URL on a
// `b<major>.<minor>.<patch>` branch — so normalise it out before snapshotting. The docs path is
// what an error message has to get right; the origin it is served from is not this test's business.
function withStableBaseUrl(text: string): string {
    return text.replaceAll(BASE_URL, '<base-url>');
}

// Params reach the error page as strings from the URL; arrays/objects are JSON-encoded by
// `stringifyValue` in the grid's logging util. These assert the full reconstructed message so a
// regression in either the JSON round-trip or the error text itself is caught.
describe('getErrorText param reconstruction', () => {
    it('reconstructs an array param and renders the full #109 message', () => {
        const text = getErrorText({
            errorCode: 109,
            params: { inputValue: 'sm', allSuggestions: JSON.stringify(['sum', 'avg', 'min']) },
        });

        expect(text).toMatchInlineSnapshot(`
          "Could not find \`sm\` aggregate function. It was configured as "aggFunc: \`sm\`" but it wasn't found in the list of registered aggregations.

                   Did you mean: \`[sum,min]\`?

          If using a custom aggregation function check it has been registered correctly."
        `);
    });

    it('reconstructs an array param and renders the full #307 message', () => {
        const text = getErrorText({
            errorCode: 307,
            params: {
                objectName: 'gridOptions',
                name: 'notAnOption',
                suggestions: JSON.stringify(['tooltipInteraction', 'dataTypeDefinitions']),
            },
        });

        expect(text).toMatchInlineSnapshot(
            `"Invalid \`gridOptions\` property \`notAnOption\` did you mean any of these: \`tooltipInteraction\`, \`dataTypeDefinitions\`."`
        );
    });

    it('reconstructs an array param and renders the full #101 message', () => {
        const text = getErrorText({
            errorCode: 101,
            params: {
                propertyName: 'cellRenderer',
                componentName: 'notARealCellRenderer',
                suggestions: JSON.stringify(['agGroupCellRenderer', 'agCheckboxCellRenderer']),
            },
        });

        expect(text).toMatchInlineSnapshot(`
          "Could not find \`notARealCellRenderer\` component. It was configured as "cellRenderer: \`notARealCellRenderer\`" but it wasn't found in the list of registered components.

                   Did you mean: \`[agGroupCellRenderer,agCheckboxCellRenderer]\`?

          If using a custom component check it has been registered correctly."
        `);
    });

    it('reconstructs an array param and renders the full #215 message', () => {
        const text = getErrorText({
            errorCode: 215,
            params: { key: 'notAPanel', validKeys: JSON.stringify(['columns', 'filters']) },
        });

        expect(text).toMatchInlineSnapshot(
            `"the key notAPanel is not a valid key for specifying a tool panel, valid keys are: columns,filters"`
        );
    });

    it('leaves plain string params untouched', () => {
        const text = getErrorText({ errorCode: 200, params: { moduleName: 'SideBar', reasonOrId: 'sideBar' } });

        expect(text).toContain('SideBar');
    });

    it('reconstructs a batched #200 message from JSON-encoded reports (the URL form)', () => {
        // The grid encodes each missing-module report to a JSON string and the array to a JSON param, so a
        // batched error survives the URL. The page must rebuild the per-report message, not a single line.
        const reports = [
            JSON.stringify({ reasonOrId: '`rowSelection`', moduleName: 'RowSelection' }),
            JSON.stringify({ reasonOrId: '`enableValue`', moduleName: 'RowGrouping' }),
        ];
        const text = getErrorText({
            errorCode: 200,
            params: {
                reports: JSON.stringify(reports),
                reasonOrId: '`rowSelection`',
                moduleName: 'RowSelection',
                gridScoped: 'false',
                gridId: '1',
                rowModelType: 'clientSide',
            },
        });

        expect(withStableBaseUrl(text)).toMatchInlineSnapshot(`
          "Unable to use \`rowSelection\` as \`RowSelectionModule\` is not registered.
          Unable to use \`enableValue\` as \`RowGroupingModule\` is not registered.
          Check if you have registered the modules:

          import { ModuleRegistry, RowSelectionModule } from 'ag-grid-community'; 
          import { RowGroupingModule } from 'ag-grid-enterprise';

          ModuleRegistry.registerModules([ RowSelectionModule, RowGroupingModule ]);

          For more info see: <base-url>/javascript-data-grid/modules/"
        `);
    });

    it('falls back to the raw string when a bracketed value is not valid JSON', () => {
        expect(() =>
            getErrorText({ errorCode: 307, params: { objectName: 'x', name: 'y', suggestions: '[not json' } })
        ).not.toThrow();
    });

    it('renders the single-report fallback when a batched #200 reports param is truncated to a corrupt string', () => {
        // A large batch can push the URL past MAX_URL_LENGTH; truncation corrupts the JSON reports array,
        // so `cleanParams` hands back a raw string. The message must not throw and should use the top-level
        // reason/module that also survive the URL.
        let text = '';
        expect(() => {
            text = getErrorText({
                errorCode: 200,
                params: {
                    reports: '["{\\"reasonOrId\\":\\"`rowSelection`\\",\\"modu',
                    reasonOrId: '`rowSelection`',
                    moduleName: 'RowSelection',
                    rowModelType: 'clientSide',
                },
            });
        }).not.toThrow();

        expect(text).toContain('Unable to use `rowSelection` as `RowSelectionModule` is not registered.');
    });
});

describe('missing param handling', () => {
    it('reports no params for an error whose text takes none', () => {
        expect(getErrorParamNames(239)).toEqual([]);
        expect(getMissingErrorParams({ errorCode: 239 })).toEqual([]);
    });

    it('renders an error taking no params in full with no params supplied', () => {
        expect(getErrorText({ errorCode: 239 })).toContain('Theming API and CSS File Themes');
    });

    it('reads the destructured param names of an error that takes them', () => {
        expect(getErrorParamNames(48)).toEqual(['property', 'inferred', 'colId']);
    });

    it('reports only the params the URL did not carry', () => {
        expect(getMissingErrorParams({ errorCode: 48, params: { property: 'Parser' } })).toEqual(['inferred', 'colId']);
    });

    it('substitutes a placeholder for an absent param rather than rendering `undefined`', () => {
        const text = getErrorText({ errorCode: 36 });

        expect(text).toBe('`colDef.type` `<type>` does not correspond to defined `gridOptions.columnTypes`');
        expect(text).not.toContain('undefined');
    });

    it('substitutes placeholders only for the absent params', () => {
        const text = getErrorText({ errorCode: 26, params: { fnName: 'setRowData' } });

        expect(text).toContain('`setRowData()`');
        expect(text).toContain('<preDestroyLink>');
    });

    it('reports a nested object param as missing even though its text cannot be completed', () => {
        // A placeholder is a string, so error #9 reading `variable.cssName` off it still renders nothing
        // useful. The page relies on the missing-param report, not the text, to explain itself.
        expect(getMissingErrorParams({ errorCode: 9 })).toEqual(['variable']);
    });
});

describe('hasPlaceholders', () => {
    it('is false for an error taking no params', () => {
        expect(getErrorTextDetails({ errorCode: 239 }).hasPlaceholders).toBe(false);
    });

    it('is true when a param the message interpolates is absent', () => {
        expect(getErrorTextDetails({ errorCode: 36 }).hasPlaceholders).toBe(true);
    });

    it('is false for a #200 link carrying only the params the grid actually logs', () => {
        // #200 declares several optional params (`reports`, `isUmd`, `usesAgGridProvider`, `additionalText`)
        // that a console link never sends, so a missing-param count would warn on every real link.
        const { text, hasPlaceholders } = getErrorTextDetails({
            errorCode: 200,
            params: {
                reasonOrId: 'Row Grouping',
                moduleName: 'RowGrouping',
                gridScoped: 'false',
                gridId: 'myGrid1',
                rowModelType: 'clientSide',
            },
        });

        expect(hasPlaceholders).toBe(false);
        expect(text).toContain('RowGroupingModule');
        expect(text).not.toContain('<');
    });

    it('reports placeholders when a #200 link carries nothing at all', () => {
        const { text, hasPlaceholders } = getErrorTextDetails({ errorCode: 200 });

        expect(hasPlaceholders).toBe(true);
        expect(text).not.toContain('undefined');
        expect(text).toContain('<unknown>');
    });
});

describe('known edge: a message whose own text says "undefined"', () => {
    it('scrubs #190\'s legitimate "undefined" along with the absent params', () => {
        // #190 is the one parameterised error whose text genuinely contains the word (\"null and
        // undefined values are not allowed...\"), so an incomplete link to it loses that word to the
        // anonymous placeholder. Accepted rather than fixed: narrowing the scrub to only the last-resort
        // branch would regress #9, which renders a real `undefined` through the placeholder path because
        // its `variable` param is an object. #190 is far less trafficked, the loss is one cosmetic word,
        // and the page shows the missing-parameter warning alongside it.
        const { text, hasPlaceholders } = getErrorTextDetails({ errorCode: 190, params: {} });

        expect(hasPlaceholders).toBe(true);
        expect(text).toContain('<unknown> values are not allowed');
    });
});

describe('message parts that are values rather than text', () => {
    it('serialises the row data #5 could not match, rather than coercing it', () => {
        // #5's whole purpose is showing which object the grid could not find, so `[object Object]` here
        // loses the only detail worth having.
        const { text } = getErrorTextDetails({
            errorCode: 5,
            params: { data: JSON.stringify({ id: 1, name: 'John' }) },
        });

        expect(text).toContain('{"id":1,"name":"John"}');
        expect(text).not.toContain('[object Object]');
    });

    it('leaves a message with no params to render complete and unflagged', () => {
        // `data` absent drops out of the array, and what remains reads correctly, so nothing is missing
        // from the reader's point of view.
        const { text, hasPlaceholders } = getErrorTextDetails({ errorCode: 5 });

        expect(hasPlaceholders).toBe(false);
        expect(text).toContain('Consider using `getRowId`');
    });
});
