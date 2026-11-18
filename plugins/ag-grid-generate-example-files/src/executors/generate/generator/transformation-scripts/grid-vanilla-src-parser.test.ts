import { parser } from './grid-vanilla-src-parser';

const html = '<div id="myGrid" style="height: 100%"></div>';

const gridOptionsTypes = {
    onFirstDataRendered: {
        typeName: '(event: FirstDataRenderedEvent<TData>) => void',
        typesToInclude: ['FirstDataRenderedEvent'],
    },
};

function parseEventHandler(handler: string) {
    const source = `
import type { GridOptions } from 'ag-grid-community';

const gridOptions: GridOptions = {
    onFirstDataRendered: ${handler},
};
`;
    const { typedBindings } = parser('row-numbers/_examples/example', source, html, {}, gridOptionsTypes);
    return typedBindings.eventHandlers[0];
}

describe('parser inline event handlers', () => {
    it('types the parameter of an inline handler with the event type of its grid option', () => {
        const eventHandler = parseEventHandler('(params) => params.api.sizeColumnsToFit()');

        expect(eventHandler.handler).toContain('(params: FirstDataRenderedEvent<TData>) =>');
        expect(eventHandler.typings).toEqual(gridOptionsTypes.onFirstDataRendered);
    });

    it('keeps the type an inline handler already declares', () => {
        const eventHandler = parseEventHandler('(params: MyEvent) => params.api.sizeColumnsToFit()');

        expect(eventHandler.handler).toContain('(params: MyEvent) =>');
        expect(eventHandler.typings).toBeUndefined();
    });
});
