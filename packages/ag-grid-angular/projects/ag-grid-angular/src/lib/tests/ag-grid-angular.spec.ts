import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions, GridReadyEvent, Module } from 'ag-grid-community';
import { Component, ViewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { AgGridAngular } from '../ag-grid-angular.component';

// NOTE: More tests can be found under the ag-grid-angular-cli-example example under /src/tests/
// https://github.com/ag-grid/ag-grid-angular-cli-example
@Component({
    selector: 'app-grid-wrapper',
    standalone: true,
    imports: [AgGridAngular],
    template: `<ag-grid-angular
        [gridOptions]="gridOptions"
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        [modules]="modules"
        (gridReady)="onGridReady($event)"
        [suppressBrowserResizeObserver]="suppressBrowserResizeObserver"
        (firstDataRendered)="onFirstDataRendered()"
    />`,
})
export class GridWrapperComponent {
    modules: Module[] = [ClientSideRowModelModule];
    rowData: any[] | null = null;
    columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

    gridOptions: GridOptions = {};
    gridApi: GridApi;

    suppressBrowserResizeObserver = false;

    @ViewChild(AgGridAngular) agGrid: AgGridAngular;

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        // this.gridApi.setGridOption('rowData', [{ make: 'Toyota', model: 'Celica', price: 35000 }]);
        this.rowData = [{ make: 'Toyota', model: 'Celica', price: 35000 }];
    }
    onFirstDataRendered() {}
}

describe('Grid OnReady', () => {
    let component: GridWrapperComponent;
    let fixture: ComponentFixture<GridWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GridWrapperComponent, AgGridAngular],
        }).compileComponents();

        fixture = TestBed.createComponent(GridWrapperComponent);
        component = fixture.componentInstance;
    });

    it('gridReady is completed by the time a timeout finishes', (done) => {
        fixture.detectChanges();
        setTimeout(() => {
            expect(component.gridApi).toBeDefined();
            done();
        }, 0);
    });

    const runGridReadyTest = async () => {
        spyOn(component, 'onGridReady').and.callThrough();
        spyOn(component, 'onFirstDataRendered').and.callThrough();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.gridApi).toBeDefined();

        fixture.detectChanges(); // force rowData binding to be applied
        await fixture.whenStable();

        // If calling the gridApi.setRowData we don't need to call the fixture.detectChanges()

        expect(component.onGridReady).toHaveBeenCalled();
        expect(component.onFirstDataRendered).toHaveBeenCalled();
    };

    it('Fixture goes stable and calls gridReady', async () => {
        await runGridReadyTest();
    });

    it('Fixture goes stable even with suppressBrowserResizeObserver= true', async () => {
        // Test with the fallback polling to mimic Jest not supporting ResizeObserver
        // We must have the polling run outside of the Angular zone
        component.suppressBrowserResizeObserver = true;

        await runGridReadyTest();
    });

    it('Grid Ready run Auto', async () => {
        spyOn(component, 'onGridReady').and.callThrough();
        spyOn(component, 'onFirstDataRendered').and.callThrough();
        fixture.autoDetectChanges();
        await fixture.whenStable();

        expect(component.gridApi).toBeDefined();

        expect(component.onGridReady).toHaveBeenCalled();
        expect(component.onFirstDataRendered).toHaveBeenCalled();
    });
});
