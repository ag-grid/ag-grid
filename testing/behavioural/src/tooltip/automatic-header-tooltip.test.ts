import { fireEvent, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, ColGroupDef, IHeaderGroupParams, IHeaderParams } from 'ag-grid-community';
import { AllCommunityModule, getGridElement } from 'ag-grid-community';

describe.each([{ group: false }, { group: true }])('Automatic header tooltips (group=$group)', ({ group }) => {
    const grids = new TestGridsManager({ modules: [AllCommunityModule] });
    const headerSelector = group ? '.ag-header-group-cell' : '.ag-header-cell';
    const textSelector = group ? '.ag-header-group-text' : '.ag-header-cell-text';

    afterEach(() => {
        grids.reset();
        vi.restoreAllMocks();
    });

    const createGrid = async (options: Partial<ColDef & ColGroupDef> = {}) => {
        const api = await grids.createGridAndWait('automatic-header-tooltip', {
            columnDefs: group
                ? [{ headerName: 'Header name', ...options, children: [{ field: 'value' }] }]
                : [{ field: 'value', headerName: 'Header name', ...options }],
            rowData: [{ value: 'Value' }],
            enableBrowserTooltips: true,
        });
        const header = getGridElement(api)!.querySelector<HTMLElement>(headerSelector)!;
        const text = header.querySelector<HTMLElement>(textSelector)!;
        vi.spyOn(text, 'clientWidth', 'get').mockReturnValue(100);
        vi.spyOn(text, 'scrollWidth', 'get').mockReturnValue(300);
        vi.spyOn(text, 'clientHeight', 'get').mockReturnValue(20);
        vi.spyOn(text, 'scrollHeight', 'get').mockReturnValue(20);
        return { api, header, text };
    };

    test.each([
        { name: 'static params', callback: false, pending: false },
        { name: 'resolved params callback', callback: true, pending: false },
        { name: 'pending inner component', callback: true, pending: true },
    ])('does not measure a custom layout from $name', async ({ callback, pending }) => {
        let finishInit: (() => void) | undefined;
        class InnerHeader {
            private readonly eGui = document.createElement('span');

            public init(): void | Promise<void> {
                this.eGui.textContent = 'Custom content';
                if (pending) {
                    return new Promise<void>((resolve) => {
                        finishInit = resolve;
                    });
                }
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        const params = group ? { innerHeaderGroupComponent: InnerHeader } : { innerHeaderComponent: InnerHeader };
        const getParams = vi.fn(() => params);
        const componentParams = callback ? getParams : params;
        const { header, text } = await createGrid(
            group ? { headerGroupComponentParams: componentParams } : { headerComponentParams: componentParams }
        );
        const callsAfterCreation = getParams.mock.calls.length;
        if (callback) {
            expect(callsAfterCreation).toBeGreaterThan(0);
        }
        if (pending) {
            expect(finishInit).toBeDefined();
            expect(text).not.toHaveTextContent('Custom content');
            fireEvent.mouseEnter(header);
            expect(header.getAttribute('title') || undefined).toBeUndefined();
            fireEvent.mouseLeave(header);
            finishInit!();
        }

        await waitFor(() => expect(text).toHaveTextContent('Custom content'));
        fireEvent.mouseEnter(header);
        expect(header.getAttribute('title') || undefined).toBeUndefined();
        expect(getParams).toHaveBeenCalledTimes(callsAfterCreation);
    });

    test('measures built-in text without re-evaluating params callbacks', async () => {
        const getParams = vi.fn(() => ({}));
        const { header, text } = await createGrid(
            group ? { headerGroupComponentParams: getParams } : { headerComponentParams: getParams }
        );
        expect(text).toHaveTextContent('Header name');
        const callsAfterCreation = getParams.mock.calls.length;
        expect(callsAfterCreation).toBeGreaterThan(0);

        fireEvent.mouseEnter(header);
        expect(header).toHaveAttribute('title', 'Header name');
        expect(getParams).toHaveBeenCalledTimes(callsAfterCreation);
    });

    test('does not measure the previous header while a custom replacement is pending', async () => {
        const { api, header } = await createGrid();
        fireEvent.mouseEnter(header);
        expect(header).toHaveAttribute('title', 'Header name');
        fireEvent.mouseLeave(header);

        let finishInit: (() => void) | undefined;
        class Header {
            private readonly eGui = document.createElement('span');

            public init(): Promise<void> {
                this.eGui.textContent = 'Replacement content';
                return new Promise<void>((resolve) => {
                    finishInit = resolve;
                });
            }

            public getGui(): HTMLElement {
                return this.eGui;
            }
        }

        api.setGridOption(
            'columnDefs',
            group
                ? [{ headerName: 'Header name', headerGroupComponent: Header, children: [{ field: 'value' }] }]
                : [{ field: 'value', headerName: 'Header name', headerComponent: Header }]
        );
        const replacement = getGridElement(api)!.querySelector<HTMLElement>(headerSelector)!;
        expect(finishInit).toBeDefined();
        fireEvent.mouseEnter(replacement);
        expect(replacement.getAttribute('title') || undefined).toBeUndefined();
        fireEvent.mouseLeave(replacement);

        finishInit!();
        await waitFor(() => expect(replacement).toHaveTextContent('Replacement content'));
        fireEvent.mouseEnter(replacement);
        expect(replacement.getAttribute('title') || undefined).toBeUndefined();
    });

    test.each([false, true])(
        'only uses a full custom header with its own predicate (predicate=%s)',
        async (predicate) => {
            const shouldDisplay = vi.fn(() => true);
            class Header {
                private readonly eGui = document.createElement('span');

                public init(params: IHeaderParams | IHeaderGroupParams): void {
                    this.eGui.className = textSelector.slice(1);
                    this.eGui.textContent = params.displayName;
                    if (predicate) {
                        params.setTooltip(params.displayName, shouldDisplay);
                    }
                }

                public getGui(): HTMLElement {
                    return this.eGui;
                }
            }

            const { header } = await createGrid(group ? { headerGroupComponent: Header } : { headerComponent: Header });
            fireEvent.mouseEnter(header);
            expect(header.getAttribute('title') || undefined).toBe(predicate ? 'Header name' : undefined);
            if (predicate) {
                expect(shouldDisplay).toHaveBeenCalled();
            }
        }
    );
});
