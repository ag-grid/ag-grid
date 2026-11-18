import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions, ToolPanelDef, ToolPanelSizeChangedEvent } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

const DEFAULT_WIDTH = 250;

describe('tool panel resizing without dragging', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    function columnsPanel(def: Partial<ToolPanelDef> = {}): ToolPanelDef {
        return {
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
            ...def,
        };
    }

    async function createGrid(options: GridOptions = {}, def: Partial<ToolPanelDef> = {}) {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'country' }],
            rowData: [{ athlete: 'Michael Phelps', country: 'United States' }],
            sideBar: { toolPanels: [columnsPanel(def)], defaultToolPanel: 'columns' },
            ...options,
        });
        const gridEl = getGridElement(api)! as HTMLElement;
        const panel = gridEl.querySelector<HTMLElement>('.ag-tool-panel-wrapper')!;
        // happy-dom has no layout: give the panel the width its CSS would
        Object.defineProperty(panel, 'offsetWidth', {
            configurable: true,
            get: () => Number.parseFloat(panel.style.getPropertyValue('--ag-horizontal-size')) || DEFAULT_WIDTH,
        });
        const splitter = gridEl.querySelector<HTMLElement>('.ag-tool-panel-horizontal-resize')!;
        const [widen, narrow] = Array.from(gridEl.querySelectorAll<HTMLButtonElement>('.ag-tool-panel-resize-button'));
        const buttons = gridEl.querySelector<HTMLElement>('.ag-tool-panel-resize-buttons')!;
        const content = gridEl.querySelector<HTMLElement>('.ag-tool-panel-content')!;
        return { api, gridEl, panel, splitter, widen, narrow, buttons, content };
    }

    const width = (panel: HTMLElement) => panel.offsetWidth;
    const isShown = (el: HTMLElement) => !el.classList.contains('ag-hidden');
    const press = (el: HTMLElement, key: string, times = 1) => {
        for (let i = 0; i < times; i++) {
            el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
        }
    };

    function recordSizeEvents(api: GridApi) {
        const events: Pick<ToolPanelSizeChangedEvent, 'width' | 'started' | 'ended'>[] = [];
        api.addEventListener('toolPanelSizeChanged', ({ width, started, ended }) =>
            events.push({ width, started, ended })
        );
        return events;
    }

    test('the resize border is a focusable vertical separator named after its panel', async () => {
        const { panel, splitter } = await createGrid({}, { minWidth: 200, maxWidth: 350 });

        expect(splitter.getAttribute('role')).toBe('separator');
        expect(splitter.getAttribute('tabindex')).toBe('0');
        expect(splitter.getAttribute('aria-orientation')).toBe('vertical');
        expect(splitter.getAttribute('aria-label')).toBe('Columns');
        expect(splitter.getAttribute('aria-controls')).toBe(panel.id);
        expect(splitter.getAttribute('aria-valuemin')).toBe('200');
        expect(splitter.getAttribute('aria-valuemax')).toBe('350');

        splitter.focus();
        expect(splitter.getAttribute('aria-valuenow')).toBe(String(DEFAULT_WIDTH));
    });

    test('the separator has the default minimum and no maximum when the panel sets neither', async () => {
        const { splitter } = await createGrid();

        expect(splitter.getAttribute('aria-valuemin')).toBe('100');
        expect(splitter.hasAttribute('aria-valuemax')).toBe(false);
    });

    test('the separator value is set when the panel opens', async () => {
        const { api, splitter } = await createGrid();
        api.closeToolPanel();
        splitter.removeAttribute('aria-valuenow');

        api.openToolPanel('columns');

        expect(splitter.getAttribute('aria-valuenow')).toBe(String(DEFAULT_WIDTH));
    });

    test('a custom tool panel names its separator after its label', async () => {
        class CustomToolPanel {
            private eGui = document.createElement('div');
            public init() {}
            public getGui() {
                return this.eGui;
            }
        }
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'stats',
                        labelDefault: 'Statistics',
                        labelKey: 'statistics',
                        iconKey: 'chart',
                        toolPanel: CustomToolPanel,
                    },
                ],
                defaultToolPanel: 'stats',
            },
        });
        const splitter = getGridElement(api)!.querySelector('.ag-tool-panel-horizontal-resize')!;

        expect(splitter.getAttribute('role')).toBe('separator');
        expect(splitter.getAttribute('aria-label')).toBe('Statistics');
    });

    describe('Tab order', () => {
        test('with the side bar on the right, the border comes before the panel content', async () => {
            const { splitter, content } = await createGrid();

            expect(splitter.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        });

        test('with the side bar on the left, the border comes after the panel content', async () => {
            const { splitter, content } = await createGrid({
                sideBar: { toolPanels: [columnsPanel()], defaultToolPanel: 'columns', position: 'left' },
            });

            expect(splitter.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
        });

        test('moving the side bar moves the border to the other side of the content', async () => {
            const { api, splitter, content } = await createGrid();

            api.setSideBarPosition('left');

            expect(splitter.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
        });
    });

    describe('arrow keys', () => {
        test('with the side bar on the right, Left Arrow widens and Right Arrow narrows', async () => {
            const { panel, splitter } = await createGrid();

            press(splitter, 'ArrowLeft');
            expect(width(panel)).toBe(270);
            expect(splitter.getAttribute('aria-valuenow')).toBe('270');

            press(splitter, 'ArrowRight', 2);
            expect(width(panel)).toBe(230);
            expect(splitter.getAttribute('aria-valuenow')).toBe('230');
        });

        test('with the side bar on the left, Right Arrow widens the panel', async () => {
            const { panel, splitter } = await createGrid({
                sideBar: { toolPanels: [columnsPanel()], defaultToolPanel: 'columns', position: 'left' },
            });

            press(splitter, 'ArrowRight');
            expect(width(panel)).toBe(270);

            press(splitter, 'ArrowLeft');
            expect(width(panel)).toBe(250);
        });

        test('with enableRtl, the side bar is on the left and Right Arrow widens the panel', async () => {
            const { panel, splitter } = await createGrid({ enableRtl: true });

            press(splitter, 'ArrowRight');
            expect(width(panel)).toBe(270);

            press(splitter, 'ArrowLeft');
            expect(width(panel)).toBe(250);
        });

        test('the width stays within minWidth and maxWidth', async () => {
            const { panel, splitter } = await createGrid({}, { minWidth: 200, maxWidth: 350 });

            press(splitter, 'ArrowLeft', 10);
            expect(width(panel)).toBe(350);
            expect(splitter.getAttribute('aria-valuenow')).toBe('350');

            press(splitter, 'ArrowRight', 10);
            expect(width(panel)).toBe(200);
            expect(splitter.getAttribute('aria-valuenow')).toBe('200');
        });

        test('each step fires toolPanelSizeChanged as a drag does, and none at a limit', async () => {
            const { api, splitter } = await createGrid({}, { maxWidth: 270 });
            const events = recordSizeEvents(api);

            press(splitter, 'ArrowLeft');
            await waitFor(() => expect(events).toHaveLength(2));

            // at maxWidth this press changes nothing, so the next events are the narrowing step's
            press(splitter, 'ArrowLeft');
            press(splitter, 'ArrowRight');
            await waitFor(() => expect(events.length).toBeGreaterThanOrEqual(4));

            expect(events).toEqual([
                { width: 250, started: true, ended: false },
                { width: 270, started: false, ended: true },
                { width: 270, started: true, ended: false },
                { width: 250, started: false, ended: true },
            ]);
        });
    });

    describe('Widen and Narrow buttons', () => {
        test('are hidden until the border is clicked', async () => {
            const { splitter, buttons } = await createGrid();
            expect(isShown(buttons)).toBe(false);

            splitter.click();

            expect(isShown(buttons)).toBe(true);
            expect(splitter.ownerDocument.activeElement).toBe(splitter);
        });

        test('are shown when the border gets keyboard focus, but not when a pointer press focuses it', async () => {
            const { splitter, buttons } = await createGrid();

            splitter.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }));
            splitter.focus();
            expect(isShown(buttons)).toBe(false);

            splitter.blur();
            splitter.click();
            splitter.blur();
            expect(isShown(buttons)).toBe(false);

            splitter.focus();
            expect(isShown(buttons)).toBe(true);
        });

        test('widen and narrow the panel by one step within its limits', async () => {
            const { panel, splitter, widen, narrow } = await createGrid({}, { minWidth: 230, maxWidth: 270 });
            splitter.click();

            widen.click();
            expect(width(panel)).toBe(270);
            expect(splitter.getAttribute('aria-valuenow')).toBe('270');
            expect(widen.getAttribute('aria-disabled')).toBe('true');

            widen.click();
            expect(width(panel)).toBe(270);

            narrow.click();
            narrow.click();
            narrow.click();
            expect(width(panel)).toBe(230);
            expect(narrow.getAttribute('aria-disabled')).toBe('true');
            expect(widen.getAttribute('aria-disabled')).toBe('false');
        });

        test('have localisable accessible names', async () => {
            const { widen, narrow } = await createGrid({
                localeText: { ariaToolPanelWiden: 'Panel breiter', ariaToolPanelNarrow: 'Panel schmaler' },
            });

            expect(widen.getAttribute('aria-label')).toBe('Panel breiter');
            expect(narrow.getAttribute('aria-label')).toBe('Panel schmaler');
            expect(widen.getAttribute('type')).toBe('button');
        });

        test('point the way they move the border', async () => {
            const right = await createGrid();
            expect(right.widen.querySelector('.ag-icon-left')).not.toBeNull();
            expect(right.narrow.querySelector('.ag-icon-right')).not.toBeNull();
            gridMgr.reset();

            const left = await createGrid({
                sideBar: { toolPanels: [columnsPanel()], defaultToolPanel: 'columns', position: 'left' },
            });
            expect(left.widen.querySelector('.ag-icon-right')).not.toBeNull();
            expect(left.narrow.querySelector('.ag-icon-left')).not.toBeNull();
        });

        test('Escape hides them and keeps focus on the border', async () => {
            const { splitter, widen, buttons } = await createGrid();
            splitter.focus();
            widen.focus();

            press(widen, 'Escape');

            expect(isShown(buttons)).toBe(false);
            expect(splitter.ownerDocument.activeElement).toBe(splitter);
        });

        test('hide when focus leaves the border and its buttons', async () => {
            const { splitter, widen, buttons, gridEl } = await createGrid();
            splitter.focus();
            widen.focus();
            expect(isShown(buttons)).toBe(true);

            gridEl.querySelector<HTMLElement>('.ag-side-button-button')!.focus();

            expect(isShown(buttons)).toBe(false);
        });

        test('hide when the panel closes', async () => {
            const { api, splitter, buttons } = await createGrid();
            splitter.focus();

            api.closeToolPanel();

            expect(isShown(buttons)).toBe(false);
        });
    });
});
