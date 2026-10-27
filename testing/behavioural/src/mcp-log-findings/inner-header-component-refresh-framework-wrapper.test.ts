/*
 * Issue: a framework-provided (for example Angular) `innerHeaderComponent` never has its `refresh`
 * method called when the column definitions change. The grid calls
 * `innerHeaderComponent.refresh?.(params)` but the framework component wrapper only creates proxy
 * methods for the "optional methods" listed for the component type, and `innerHeaderComponent` (and
 * `innerHeaderGroupComponent`) list none, unlike `headerComponent` which lists `refresh`. So the
 * call is a silent no-op and the inner header keeps showing the old header name.
 *
 * Setup: a column with `headerComponentParams.innerHeaderComponent` set to a framework component (simulated here with a
 * minimal wrapper built on the same BaseComponentWrapper that the Angular, React and Vue wrappers
 * extend; the wrapped component exposes `refresh` the way an Angular component instance does).
 * The column definitions are then updated with a new `headerName`.
 *
 * Expected: IHeader.refresh is documented as "Get the header to refresh. Gets called whenever Column
 * Defs are updated." and the inner header component interface has an optional `refresh`, so
 * `refresh` is called with the new params and the displayed name updates. A plain JavaScript inner
 * header component behaves this way.
 *
 * Actual: `refresh` is never called on the framework inner header component.
 *
 * No custom `headerComponent` is set: `innerHeaderComponent` in `headerComponentParams` on top of the
 * default header is the documented way to customise just the header's inner content.
 *
 * Reported on ag-grid-angular 34.3.1. This test uses a simulated wrapper, not Angular itself.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on Angular 34.3.1
 * searched, in May 2026: "inner header component refresh when columnDefs change innerHeaderComponent".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ComponentType, WrappableInterface } from 'ag-grid-community';
import { BaseComponentWrapper, ClientSideRowModelModule, VanillaFrameworkOverrides } from 'ag-grid-community';

class FrameworkInnerHeader {
    static readonly isFrameworkComponent = true;
    static refreshedWith: any[] = [];

    eGui = document.createElement('span');

    agInit(params: any) {
        this.eGui.className = 'fw-inner-header';
        this.eGui.textContent = params.displayName;
    }

    refresh(params: any) {
        FrameworkInnerHeader.refreshedWith.push(params);
        this.eGui.textContent = params.displayName;
        return true;
    }
}

class AngularLikeWrapper extends BaseComponentWrapper<WrappableInterface> {
    protected createWrapper(OriginalConstructor: new () => any, _type: ComponentType): WrappableInterface {
        const instance = new OriginalConstructor();
        const wrapper: any = {
            init: (params: any) => instance.agInit(params),
            getGui: () => instance.eGui,
            destroy: () => {},
            hasMethod: (name: string) => instance[name] != null,
            callMethod: (name: string, args: IArguments) => instance[name](...Array.from(args)),
            addMethod: (name: string, callback: (...args: any[]) => any) => {
                wrapper[name] = callback;
            },
        };
        return wrapper;
    }
}

class AngularLikeOverrides extends VanillaFrameworkOverrides {
    constructor() {
        super('angular');
    }
    override isFrameworkComponent(comp: any): boolean {
        return !!comp?.isFrameworkComponent;
    }
}

describe('Framework innerHeaderComponent refresh', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
        FrameworkInnerHeader.refreshedWith = [];
    });

    test('refresh is called on the inner header component when column definitions change', async () => {
        const api = gridsManager.createGrid(
            'myGrid',
            {
                columnDefs: [
                    {
                        field: 'a',
                        headerName: 'A',
                        headerComponentParams: { innerHeaderComponent: FrameworkInnerHeader },
                    },
                ],
                rowData: [{ a: 1 }],
            },
            {
                frameworkOverrides: new AngularLikeOverrides(),
                providedBeanInstances: { frameworkCompWrapper: new AngularLikeWrapper() },
            } as any
        );
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const innerText = () => gridDiv.querySelector('.fw-inner-header')?.textContent;

        await waitFor(() => expect(innerText()).toBe('A'));

        api.setGridOption('columnDefs', [
            { field: 'a', headerName: 'B', headerComponentParams: { innerHeaderComponent: FrameworkInnerHeader } },
        ]);

        await waitFor(() => expect(FrameworkInnerHeader.refreshedWith.map((p) => p.displayName)).toEqual(['B']));
        expect(innerText()).toBe('B');
    });
});
