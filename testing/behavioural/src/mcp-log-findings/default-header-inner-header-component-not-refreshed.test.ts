/**
 * Issue: with the default column header, an `innerHeaderComponent` was destroyed and recreated on every column
 * definition update instead of having its `refresh` called, so any state it held was lost: `AgColumnHeader.refresh`
 * compared the template it would build by identity, and without a custom `template` built a new object each time.
 *
 * Setup: a column with an inner header component that implements `refresh` and returns true. `columnDefs` is then
 * updated with a new `headerName`.
 *
 * Expected: the Column Headers docs (Refreshing Headers) say that a header component that still exists after a
 * column definition update has its `refresh` method called, and is only destroyed and recreated if `refresh`
 * returns false. So the same inner header instance is kept and refreshed with the new name.
 *
 * Reported: a new inner header instance was created and `refresh` was never called.
 *
 * Reported on: possibly React 36.0.0 and Angular 34.3.1 (searches below; not confirmed to be this cause).
 *
 * Source: found while investigating the Angular inner header refresh finding (`innerHeaderComponent.refresh.spec.ts`
 * in ag-grid-angular) for AG-18665, then matched to the docs MCP search log. A React 36.0.0 client in July 2026
 * searched "custom inner header component refresh lifecycle columnDefs new reference React rerender", and an Angular
 * 34.3.1 client in May 2026 searched "inner header component refresh when columnDefs change innerHeaderComponent"
 * and "IInnerHeaderAngularComp refresh method when not called".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type {
    ColDef,
    ColGroupDef,
    GridApi,
    GridParams,
    IHeaderGroupParams,
    IHeaderParams,
    IInnerHeaderComponent,
    WrappableInterface,
} from 'ag-grid-community';
import {
    AgPromise,
    BaseComponentWrapper,
    ClientSideRowModelModule,
    VanillaFrameworkOverrides,
} from 'ag-grid-community';

let refreshedWith: string[] = [];

interface SuffixedHeaderParams extends IHeaderParams {
    suffix?: string;
}

class TestInnerHeader implements IInnerHeaderComponent {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): void {
        this.eGui.textContent = params.displayName;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: SuffixedHeaderParams): boolean {
        refreshedWith.push(params.displayName + (params.suffix ?? ''));
        this.eGui.textContent = params.displayName;
        return true;
    }
}

class FirstInnerHeader implements IInnerHeaderComponent {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): void {
        this.eGui.className = 'test-inner-first';
        this.eGui.textContent = `first ${params.displayName}`;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IHeaderParams): boolean {
        this.eGui.textContent = `first ${params.displayName}`;
        return true;
    }
}

class SecondInnerHeader implements IInnerHeaderComponent {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): void {
        this.eGui.className = 'test-inner-second';
        this.eGui.textContent = `second ${params.displayName}`;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IHeaderParams): boolean {
        this.eGui.textContent = `second ${params.displayName}`;
        return true;
    }
}

class NoRefreshInnerHeader {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): void {
        this.eGui.className = 'test-inner-plain';
        this.eGui.textContent = params.displayName;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}

class RefreshFalseInnerHeader extends NoRefreshInnerHeader {
    public refresh(): boolean {
        return false;
    }
}

class FrameworkInnerHeader extends NoRefreshInnerHeader {
    public refresh(params: SuffixedHeaderParams): boolean {
        refreshedWith.push(params.displayName + (params.suffix ?? ''));
        this.getGui().textContent = params.displayName;
        return true;
    }
}

/** Wraps a framework component as the Angular and Vue wrappers do: only the methods its type lists are proxied. */
class TestFrameworkWrapper extends BaseComponentWrapper<WrappableInterface> {
    protected createWrapper(FrameworkComponent: new () => any): WrappableInterface {
        const instance = new FrameworkComponent();
        const wrapper: WrappableInterface & Record<string, unknown> = {
            hasMethod: (name: string) => instance[name] != null,
            callMethod: (name: string, args: IArguments) => instance[name](...args),
            addMethod: (name: string, callback: () => unknown) => {
                wrapper[name] = callback;
            },
            init: (params: IHeaderParams) => instance.init(params),
            getGui: () => instance.getGui(),
        };
        return wrapper;
    }
}

class FrameworkGroupHeader {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderGroupParams): void {
        this.eGui.className = 'test-group-framework';
        this.eGui.textContent = params.displayName;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IHeaderGroupParams): boolean {
        refreshedWith.push(params.displayName);
        this.eGui.textContent = params.displayName;
        return true;
    }
}

class NoRefreshFrameworkGroupHeader {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderGroupParams): void {
        this.eGui.className = 'test-group-framework';
        this.eGui.textContent = params.displayName;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}

class TestFrameworkOverrides extends VanillaFrameworkOverrides {
    public override isFrameworkComponent(comp: unknown): boolean {
        return (
            comp === NoRefreshInnerHeader ||
            comp === FrameworkInnerHeader ||
            comp === FrameworkGroupHeader ||
            comp === NoRefreshFrameworkGroupHeader
        );
    }
}

let pendingInits: (() => void)[] = [];

class SlowInnerHeader implements IInnerHeaderComponent {
    private readonly eGui = document.createElement('span');

    public init(params: IHeaderParams): AgPromise<void> {
        this.eGui.className = 'test-inner-slow';
        this.eGui.textContent = params.displayName;
        return new AgPromise<void>((resolve) => {
            pendingInits.push(() => resolve());
        });
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IHeaderParams): boolean {
        this.eGui.textContent = params.displayName;
        return true;
    }
}

describe('inner header component across column definition updates', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    beforeEach(() => {
        refreshedWith = [];
        pendingInits = [];
    });
    afterEach(() => gridMgr.reset());

    test('the default header refreshes its inner header component in place, with its params as at init', async () => {
        for (const innerHeaderComponentParams of [{ suffix: '!' }, () => ({ suffix: '!' })]) {
            refreshedWith = [];
            const colDef = (headerName: string): ColDef => ({
                field: 'a',
                headerName,
                headerComponentParams: { innerHeaderComponent: TestInnerHeader, innerHeaderComponentParams },
            });
            const api = await gridMgr.createGridAndWait('grid', { columnDefs: [colDef('Name')], rowData: [{ a: 1 }] });

            api.setGridOption('columnDefs', [colDef('Renamed')]);

            await waitFor(() => expect(TestGridsManager.getHTMLElement(api)!.textContent).toContain('Renamed'));
            expect(refreshedWith).toEqual(['Renamed!']);
            gridMgr.reset();
        }
    });

    test('the default header recreates an inner header component without refresh, or whose refresh returns false', async () => {
        for (const innerHeaderComponent of [NoRefreshInnerHeader, RefreshFalseInnerHeader]) {
            const colDef = (headerName: string): ColDef => ({
                field: 'a',
                headerName,
                headerComponentParams: { innerHeaderComponent },
            });
            const api = await gridMgr.createGridAndWait('grid', { columnDefs: [colDef('Name')], rowData: [{ a: 1 }] });
            const inner = () =>
                Array.from(
                    TestGridsManager.getHTMLElement(api)!.querySelectorAll(
                        '.ag-header-cell[col-id="a"] .test-inner-plain'
                    )
                );
            const before = inner();
            expect(before.map((el) => el.textContent)).toEqual(['Name']);

            api.setGridOption('columnDefs', [colDef('Renamed')]);

            await waitFor(() => expect(inner().map((el) => el.textContent)).toEqual(['Renamed']));
            expect(inner()[0] === before[0]).toBe(false);
            gridMgr.reset();
        }
    });

    test('a framework inner header component is refreshed when it has refresh, and recreated when it has none', async () => {
        for (const innerHeaderComponent of [FrameworkInnerHeader, NoRefreshInnerHeader]) {
            refreshedWith = [];
            const colDef = (headerName: string): ColDef => ({
                field: 'a',
                headerName,
                headerComponentParams: { innerHeaderComponent },
            });
            const frameworkParams: GridParams = {
                frameworkOverrides: new TestFrameworkOverrides(),
                providedBeanInstances: { frameworkCompWrapper: new TestFrameworkWrapper() },
            };
            const api = await gridMgr.createGridAndWait(
                'grid',
                { columnDefs: [colDef('Name')], rowData: [{ a: 1 }] },
                frameworkParams
            );
            const inner = () =>
                Array.from(
                    TestGridsManager.getHTMLElement(api)!.querySelectorAll(
                        '.ag-header-cell[col-id="a"] .test-inner-plain'
                    )
                );
            const before = inner();
            expect(before.map((el) => el.textContent)).toEqual(['Name']);

            api.setGridOption('columnDefs', [colDef('Renamed')]);

            await waitFor(() => expect(inner().map((el) => el.textContent)).toEqual(['Renamed']));
            const refreshed = innerHeaderComponent === FrameworkInnerHeader;
            expect({ kept: inner()[0] === before[0], refreshedWith }).toEqual({
                kept: refreshed,
                refreshedWith: refreshed ? ['Renamed'] : [],
            });
            gridMgr.reset();
        }
    });

    test('a column definition update adds, swaps and removes the inner header component', async () => {
        const colDef = (innerHeaderComponent?: new () => IInnerHeaderComponent): ColDef => ({
            field: 'a',
            headerName: 'Name',
            headerComponentParams: { innerHeaderComponent },
        });
        const api = await gridMgr.createGridAndWait('grid', { columnDefs: [colDef()], rowData: [{ a: 1 }] });
        const header = () => TestGridsManager.getHTMLElement(api)!.querySelector('.ag-header-cell[col-id="a"]')!;
        const state = () => ({
            first: header().querySelectorAll('.test-inner-first').length,
            second: header().querySelectorAll('.test-inner-second').length,
            text: header().querySelector('.ag-header-cell-text')?.textContent ?? header().textContent,
        });

        expect(state()).toEqual({ first: 0, second: 0, text: 'Name' });

        api.setGridOption('columnDefs', [colDef(FirstInnerHeader)]);
        await waitFor(() => expect(state()).toEqual({ first: 1, second: 0, text: 'first Name' }));

        api.setGridOption('columnDefs', [colDef(SecondInnerHeader)]);
        await waitFor(() => expect(state()).toEqual({ first: 0, second: 1, text: 'second Name' }));

        api.setGridOption('columnDefs', [colDef()]);
        await waitFor(() => expect(state()).toEqual({ first: 0, second: 0, text: 'Name' }));
    });

    test('a rename while the inner header component is still loading ends with the new name shown', async () => {
        const colDef = (headerName: string): ColDef => ({
            field: 'a',
            headerName,
            headerComponentParams: { innerHeaderComponent: SlowInnerHeader },
        });
        const resolveAll = () => {
            const pending = pendingInits;
            pendingInits = [];
            for (let i = 0, len = pending.length; i < len; ++i) {
                pending[i]();
            }
        };
        const innerHeaderTexts = (api: GridApi) =>
            Array.from(
                TestGridsManager.getHTMLElement(api)!.querySelectorAll('.ag-header-cell[col-id="a"] .test-inner-slow'),
                (el) => el.textContent
            );

        const loaded = gridMgr.createGrid('loaded', { columnDefs: [colDef('Name')], rowData: [{ a: 1 }] });
        await waitFor(() => {
            resolveAll();
            expect(innerHeaderTexts(loaded)).toEqual(['Name']);
        });
        gridMgr.reset();

        const api = gridMgr.createGrid('grid', { columnDefs: [colDef('Name')], rowData: [{ a: 1 }] });
        expect(pendingInits).toHaveLength(1);

        api.setGridOption('columnDefs', [colDef('Renamed')]);
        resolveAll();

        await waitFor(() => {
            resolveAll();
            expect(innerHeaderTexts(api)).toEqual(['Renamed']);
        });
        await asyncSetTimeout(0);
        resolveAll();
        expect(innerHeaderTexts(api)).toEqual(['Renamed']);
    });
});

describe('inner header group component across a header name change', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    beforeEach(() => {
        refreshedWith = [];
    });
    afterEach(() => gridMgr.reset());

    test('a framework inner header group component is refreshed with its params when it has refresh, and recreated when it has none', async () => {
        for (const innerHeaderGroupComponent of [FrameworkInnerHeader, NoRefreshInnerHeader]) {
            refreshedWith = [];
            const frameworkParams: GridParams = {
                frameworkOverrides: new TestFrameworkOverrides(),
                providedBeanInstances: { frameworkCompWrapper: new TestFrameworkWrapper() },
            };
            const groupDef: ColGroupDef = {
                groupId: 'g',
                headerName: 'Name',
                headerGroupComponentParams: {
                    innerHeaderGroupComponent,
                    innerHeaderGroupComponentParams: { suffix: '!' },
                },
                children: [{ field: 'a' }],
            };
            const api = await gridMgr.createGridAndWait(
                'grid',
                { columnDefs: [groupDef], rowData: [{ a: 1 }] },
                frameworkParams
            );
            const inner = () =>
                Array.from(
                    TestGridsManager.getHTMLElement(api)!.querySelectorAll('.ag-header-group-cell .test-inner-plain')
                );
            const before = inner();
            expect(before.map((el) => el.textContent)).toEqual(['Name']);

            // a column's header name change refreshes the group headers in place
            api.applyColumnState({ state: [{ colId: 'a', headerName: 'Renamed' }] });

            const refreshed = innerHeaderGroupComponent === FrameworkInnerHeader;
            await waitFor(() => expect(inner()[0] === before[0]).toBe(refreshed));
            expect({ texts: inner().map((el) => el.textContent), refreshedWith }).toEqual({
                texts: ['Name'],
                refreshedWith: refreshed ? ['Name!'] : [],
            });
            gridMgr.reset();
        }
    });

    test('a column definition update renaming a group refreshes its inner header group component in place', async () => {
        const groupDef = (headerName: string): ColGroupDef => ({
            groupId: 'g',
            headerName,
            headerGroupComponentParams: { innerHeaderGroupComponent: TestInnerHeader },
            children: [{ field: 'a' }],
        });
        const api = await gridMgr.createGridAndWait('grid', { columnDefs: [groupDef('Name')], rowData: [{ a: 1 }] });
        const groupCell = () => TestGridsManager.getHTMLElement(api)!.querySelector('.ag-header-group-cell');
        const before = groupCell();

        api.setGridOption('columnDefs', [groupDef('Renamed')]);

        await waitFor(() => expect(groupCell()!.textContent).toContain('Renamed'));
        expect({ kept: groupCell() === before, refreshedWith }).toEqual({ kept: true, refreshedWith: ['Renamed'] });
    });

    test('a column definition update renaming one group leaves the header group component of another group as it was', async () => {
        let inits = 0;
        class NoRefreshGroupHeader {
            private readonly eGui = document.createElement('span');
            public init(params: IHeaderGroupParams): void {
                ++inits;
                this.eGui.className = 'test-other-group';
                this.eGui.textContent = params.displayName;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
        }
        const defs = (headerName: string): ColGroupDef[] => [
            { groupId: 'g1', headerName, children: [{ field: 'a' }] },
            {
                groupId: 'g2',
                headerName: 'Other',
                headerGroupComponent: NoRefreshGroupHeader,
                children: [{ field: 'b' }],
            },
        ];
        const api = await gridMgr.createGridAndWait('grid', { columnDefs: defs('Name'), rowData: [{ a: 1, b: 2 }] });
        const header = (selector: string) => TestGridsManager.getHTMLElement(api)!.querySelector(selector);
        const other = header('.test-other-group');

        api.setGridOption('columnDefs', defs('Renamed'));

        await waitFor(() => expect(header('.ag-header-group-cell')!.textContent).toContain('Renamed'));
        expect({ kept: header('.test-other-group') === other, inits }).toEqual({ kept: true, inits: 1 });
    });

    test('a header name change refreshing a group whose params function now gives another inner header group component shows the new one', async () => {
        const rows: [string, unknown, unknown, { first: number; second: number; text: string }][] = [
            ['added', undefined, FirstInnerHeader, { first: 1, second: 0, text: 'first Medals' }],
            ['dropped', FirstInnerHeader, undefined, { first: 0, second: 0, text: 'Medals' }],
            ['swapped', FirstInnerHeader, SecondInnerHeader, { first: 0, second: 1, text: 'second Medals' }],
        ];
        for (const [name, before, after, expected] of rows) {
            let current = before;
            const groupDef: ColGroupDef = {
                groupId: 'g',
                headerName: 'Medals',
                headerGroupComponentParams: () => ({ innerHeaderGroupComponent: current }),
                children: [{ field: 'a' }],
            };
            const api = await gridMgr.createGridAndWait('grid', { columnDefs: [groupDef], rowData: [{ a: 1 }] });
            const header = () => TestGridsManager.getHTMLElement(api)!.querySelector('.ag-header-group-cell')!;
            const state = () => ({
                name,
                first: header().querySelectorAll('.test-inner-first').length,
                second: header().querySelectorAll('.test-inner-second').length,
                text: header().textContent!.trim(),
            });

            current = after;
            api.applyColumnState({ state: [{ colId: 'a', headerName: 'Renamed' }] });

            await waitFor(() => expect(state()).toEqual({ name, ...expected }));
            gridMgr.reset();
        }
    });

    test('a framework headerGroupComponent is kept and refreshed when it has refresh, and recreated when it has none', async () => {
        for (const [headerGroupComponent, kept, refreshed] of [
            [FrameworkGroupHeader, true, ['Name']],
            [NoRefreshFrameworkGroupHeader, false, []],
        ] as const) {
            refreshedWith = [];
            const frameworkParams: GridParams = {
                frameworkOverrides: new TestFrameworkOverrides(),
                providedBeanInstances: { frameworkCompWrapper: new TestFrameworkWrapper() },
            };
            const api = await gridMgr.createGridAndWait(
                'grid',
                {
                    columnDefs: [
                        { groupId: 'g', headerName: 'Name', headerGroupComponent, children: [{ field: 'a' }] },
                    ],
                    rowData: [{ a: 1 }],
                },
                frameworkParams
            );
            const group = () => TestGridsManager.getHTMLElement(api)!.querySelector('.test-group-framework');
            const before = group();

            api.applyColumnState({ state: [{ colId: 'a', headerName: 'Renamed' }] });

            await waitFor(() =>
                expect({ kept: group() === before, text: group()?.textContent, refreshedWith }).toEqual({
                    kept,
                    text: 'Name',
                    refreshedWith: refreshed,
                })
            );
            gridMgr.reset();
        }
    });
});
