import { getErrorText } from './getErrorText';

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

    it('falls back to the raw string when a bracketed value is not valid JSON', () => {
        expect(() =>
            getErrorText({ errorCode: 307, params: { objectName: 'x', name: 'y', suggestions: '[not json' } })
        ).not.toThrow();
    });
});
