/*
 * Issue: an Angular `innerHeaderComponent` never has its `refresh` method called when the column
 * definitions change, so it keeps showing the old header name. The default header calls
 * `innerHeaderComponent.refresh?.(params)`, but the Angular component wrapper only proxies the
 * "optional methods" listed for the component type, and `innerHeaderComponent` (and
 * `innerHeaderGroupComponent`) list none, unlike `headerComponent` which lists `refresh`.
 *
 * Setup: a column with `headerComponentParams.innerHeaderComponent` set to an Angular component
 * implementing `IInnerHeaderAngularComp`, plus the header `template` from the Column Headers docs (so
 * the default header refreshes in place rather than being recreated). The host's `columnDefs` input
 * is then replaced with one that has a new `headerName`.
 *
 * Expected: IHeader.refresh is documented as "Get the header to refresh. Gets called whenever Column
 * Defs are updated.", so `refresh` is called with the new params and the displayed name updates. A
 * plain JavaScript inner header component behaves this way (control below).
 *
 * Actual: `refresh` is never called on the Angular inner header component.
 *
 * Reported on ag-grid-angular 34.3.1 and 35.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Coding agents on Angular searched twice:
 * on 35.0.0 in February 2026 and on 34.3.1 in May 2026 (the latter: "inner header component refresh
 * when columnDefs change innerHeaderComponent").
 */
import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { ColDef, IHeaderParams, Module } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';

import { AgGridAngular } from '../ag-grid-angular.component';
import type { IInnerHeaderAngularComp } from '../interfaces';

let angularRefreshedWith: string[] = [];
let jsRefreshedWith: string[] = [];

@Component({
    standalone: true,
    template: `<span class="ng-inner-header">{{ displayName }}</span>`,
})
class NgInnerHeader implements IInnerHeaderAngularComp {
    displayName = '';

    agInit(params: IHeaderParams): void {
        this.displayName = params.displayName;
    }

    refresh(params: IHeaderParams): boolean {
        angularRefreshedWith.push(params.displayName);
        this.displayName = params.displayName;
        return true;
    }
}

class JsInnerHeader {
    private eGui = document.createElement('span');

    init(params: IHeaderParams): void {
        this.eGui.className = 'js-inner-header';
        this.eGui.textContent = params.displayName;
    }

    getGui(): HTMLElement {
        return this.eGui;
    }

    refresh(params: IHeaderParams): boolean {
        jsRefreshedWith.push(params.displayName);
        this.eGui.textContent = params.displayName;
        return true;
    }
}

@Component({
    selector: 'app-grid-wrapper',
    imports: [AgGridAngular],
    template: `<ag-grid-angular [rowData]="rowData" [columnDefs]="columnDefs" [modules]="modules"></ag-grid-angular>`,
})
class TestHostComponent {
    modules: Module[] = [AllCommunityModule];
    rowData = [{ a: 1, b: 2 }];
    columnDefs: ColDef[] = columnDefs('A', 'B');
}

// The header template from the Column Headers docs. Without a string template the default header is
// recreated rather than refreshed, as its built-in template is a new object on every comparison.
const template = `<div class="ag-cell-label-container" role="presentation">
    <span data-ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
    <span data-ref="eFilterButton" class="ag-header-icon ag-header-cell-filter-button"></span>
    <div data-ref="eLabel" class="ag-header-cell-label" role="presentation">
        <span data-ref="eSortOrder" class="ag-header-icon ag-sort-order ag-hidden"></span>
        <span data-ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon ag-hidden"></span>
        <span data-ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon ag-hidden"></span>
        <span data-ref="eSortMixed" class="ag-header-icon ag-sort-mixed-icon ag-hidden"></span>
        <span data-ref="eSortNone" class="ag-header-icon ag-sort-none-icon ag-hidden"></span>
        <span data-ref="eText" class="ag-header-cell-text" role="columnheader"></span>
        <span data-ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
    </div>
</div>`;

function columnDefs(ngHeaderName: string, jsHeaderName: string): ColDef[] {
    return [
        {
            field: 'a',
            headerName: ngHeaderName,
            headerComponentParams: { innerHeaderComponent: NgInnerHeader, template },
        },
        {
            field: 'b',
            headerName: jsHeaderName,
            headerComponentParams: { innerHeaderComponent: JsInnerHeader, template },
        },
    ];
}

async function waitFor(fixture: ComponentFixture<unknown>, condition: () => boolean): Promise<void> {
    for (let i = 0; i < 50 && !condition(); i++) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        await fixture.whenStable();
    }
}

describe('innerHeaderComponent refresh', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    const text = (selector: string) => fixture.nativeElement.querySelector(selector)?.textContent;

    beforeEach(async () => {
        angularRefreshedWith = [];
        jsRefreshedWith = [];
        await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.autoDetectChanges();
        await waitFor(fixture, () => text('.ng-inner-header') === 'A' && text('.js-inner-header') === 'B');
    });

    it('calls refresh on an Angular inner header component when column definitions change', async () => {
        expect(text('.ng-inner-header')).toBe('A');

        fixture.componentInstance.columnDefs = columnDefs('A2', 'B');
        fixture.detectChanges();
        await waitFor(fixture, () => angularRefreshedWith.length > 0);

        expect(angularRefreshedWith).toEqual(['A2']);
        expect(text('.ng-inner-header')).toBe('A2');
    });

    it('control: calls refresh on a plain JavaScript inner header component', async () => {
        expect(text('.js-inner-header')).toBe('B');

        fixture.componentInstance.columnDefs = columnDefs('A', 'B2');
        fixture.detectChanges();
        await waitFor(fixture, () => jsRefreshedWith.length > 0);

        expect(jsRefreshedWith).toEqual(['B2']);
        expect(text('.js-inner-header')).toBe('B2');
    });
});
