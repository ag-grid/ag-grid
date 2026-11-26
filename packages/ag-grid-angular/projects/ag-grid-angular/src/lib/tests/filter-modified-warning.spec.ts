import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColDef, Module } from 'ag-grid-community';
import { AllCommunityModule, _resetValidationLogging } from 'ag-grid-community';

import { AgGridAngular } from '../ag-grid-angular.component';

@Component({
    selector: 'app-filter-modified-output-host',
    imports: [AgGridAngular],
    template: `<ag-grid-angular
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [modules]="modules"
        (filterModified)="onFilterModified()"
    ></ag-grid-angular>`,
})
class FilterModifiedOutputHostComponent {
    public modules: Module[] = [AllCommunityModule];
    public columnDefs: ColDef[] = [{ field: 'name', filter: true }];
    public rowData = [{ name: 'Alice' }];

    public onFilterModified(): void {}
}

@Component({
    selector: 'app-no-filter-modified-output-host',
    imports: [AgGridAngular],
    template: `<ag-grid-angular [columnDefs]="columnDefs" [rowData]="rowData" [modules]="modules"></ag-grid-angular>`,
})
class NoFilterModifiedOutputHostComponent {
    public modules: Module[] = [AllCommunityModule];
    public columnDefs: ColDef[] = [{ field: 'name', filter: true }];
    public rowData = [{ name: 'Alice' }];
}

describe('filterModified output', () => {
    let warnSpy: jasmine.Spy;

    const hasWarned345 = () => warnSpy.calls.allArgs().some((args) => String(args[0]).includes('warning #345'));

    const createGrid = (
        host: typeof FilterModifiedOutputHostComponent | typeof NoFilterModifiedOutputHostComponent
    ) => {
        TestBed.configureTestingModule({ imports: [host] });
        const fixture = TestBed.createComponent(host);
        fixture.detectChanges();
        return fixture;
    };

    beforeEach(() => {
        _resetValidationLogging();
        warnSpy = spyOn(console, 'warn');
    });

    afterEach(() => {
        _resetValidationLogging();
    });

    it('warns about legacy filter mode when the output is bound', () => {
        const fixture = createGrid(FilterModifiedOutputHostComponent);

        expect(hasWarned345()).toBeTrue();
        fixture.destroy();
    });

    it('does not warn when the output is not bound', () => {
        const fixture = createGrid(NoFilterModifiedOutputHostComponent);

        expect(hasWarned345()).toBeFalse();
        fixture.destroy();
    });
});
