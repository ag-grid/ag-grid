import { Component, NgZone, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridAngular } from './ag-grid-angular.component';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GetRowIdParams, GridOptions, GridReadyEvent, Module } from 'ag-grid-community';
import * as exp from 'constants';

@Component({
    selector: 'app-grid-wrapper',
    standalone: true,
    imports: [AgGridAngular],
    template:
        '<ag-grid-angular [gridOptions]="gridOptions" [getRowId]="getRowId" [rowData]="rowData" [columnDefs]="columnDefs" [modules]="modules" (gridReady)="onGridReady($event)" ></ag-grid-angular>',
})
export class GridWrapperComponent {
    modules: Module[] = [ClientSideRowModelModule];
    rowData: any[] = [{ make: 'Toyota', model: 'Celica', price: 35000 }];
    columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

    gridOptions: GridOptions = {
        getRowClass: (params) => {
            this.zoneStatus['gridOptions -> callback'] = NgZone.isInAngularZone();
            return 'my-class';
        },
        onStateUpdated: () => {
            this.zoneStatus['gridOptions -> event'] = NgZone.isInAngularZone();
        },
    };

    zoneStatus: { [key: string]: boolean } = {};

    @ViewChild(AgGridAngular) agGrid: AgGridAngular;

    constructor(private zone: NgZone) {}

    onGridReady(params: GridReadyEvent) {
        this.zoneStatus['component -> event'] = NgZone.isInAngularZone();

        // For testing purposes, we are going to add listeners to the grid outside of angular to mimic
        // these events being fired from the grid itself which is running outside of angular.
        this.zone.runOutsideAngular(() => {
            const globalListener = (event: any) => {
                this.zoneStatus['api -> globalListener'] = NgZone.isInAngularZone();
            };

            const eventListener = (event: any) => {
                this.zoneStatus['api -> eventListener'] = NgZone.isInAngularZone();
            };

            params.api.addGlobalListener(globalListener);
            params.api.addEventListener('newColumnsLoaded', eventListener);

            params.api.getRowNode('Toyota')?.addEventListener('dataChanged', (event: any) => {
                this.zoneStatus['RowNode -> eventListener'] = NgZone.isInAngularZone();
            });

            params.api.getColumn('make')?.addEventListener('visibleChanged', (event: any) => {
                this.zoneStatus['Column -> eventListener'] = NgZone.isInAngularZone();
            });

            params.api.getRowNode('Toyota')?.setData({ make: 'Toyota', model: 'Celica', price: 40000 });

            params.api.applyColumnState({
                state: [
                    {
                        colId: 'make',
                        hide: true,
                    },
                ],
            });
        });
    }

    getRowId = (params: GetRowIdParams) => {
        this.zoneStatus['component -> callback'] = NgZone.isInAngularZone();
        return params.data.make;
    };
}

describe('GridWrapperComponent', () => {
    let component: GridWrapperComponent;
    let fixture: ComponentFixture<GridWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GridWrapperComponent, AgGridAngular],
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(GridWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should run in / out Angular Zone', (done) => {
        // Access AG Grid API and check if the row data is updated
        const api = fixture.componentInstance.agGrid.api;
        expect(api).toBeDefined();
        expect(api.getDisplayedRowCount()).toEqual(1);

        setTimeout(() => {
            api.updateGridOptions({ columnDefs: [{ field: 'make' }, { field: 'model' }] });
            fixture.detectChanges();

            setTimeout(() => {
                // const results = Object.keys(component.zoneStatus).map(
                //     (key: any) => `${key} ${component.zoneStatus[key]}`
                // );
                // results.sort();
                // console.log('\n', results.join('\n'));
                const expected: Record<string, boolean> = {
                    'Column -> eventListener': false,
                    'RowNode -> eventListener': false,
                    'api -> eventListener': true,
                    'api -> globalListener': true,
                    'component -> callback': false,
                    'component -> event': true,
                    'gridOptions -> callback': false,
                };

                Object.keys(expected).forEach((key) => {
                    expect(component.zoneStatus[key]).toBe(expected[key]);
                });

                done();
            }, 1000);
        }, 1000);
    });

    it('should remove event listeners', (done) => {
        // Access AG Grid API and check if the row data is updated
        const api = fixture.componentInstance.agGrid.api;
        expect(api).toBeDefined();

        const listeners = {
            eventListener: (event: any) => {},
            globalEventListener: (event: any) => {},
            rowEventListener: (event: any) => {},
            columnEventListener: (event: any) => {},
        };

        const eventListenerSpy = spyOn(listeners, 'eventListener');
        const globalEventListenerSpy = spyOn(listeners, 'globalEventListener');
        const rowEventListenerSpy = spyOn(listeners, 'rowEventListener');
        const columnEventListenerSpy = spyOn(listeners, 'columnEventListener');

        // Test add and remove works
        api.addEventListener('newColumnsLoaded', listeners.eventListener);
        api.removeEventListener('newColumnsLoaded', listeners.eventListener);

        api.addGlobalListener(listeners.globalEventListener);
        api.removeGlobalListener(listeners.globalEventListener);

        api.getRowNode('Toyota')?.addEventListener('dataChanged', listeners.rowEventListener);
        api.getRowNode('Toyota')?.removeEventListener('dataChanged', listeners.rowEventListener);

        api.getColumn('make')?.addEventListener('visibleChanged', listeners.columnEventListener);
        api.getColumn('make')?.removeEventListener('visibleChanged', listeners.columnEventListener);

        api.getRowNode('Toyota')?.setData({ make: 'Toyota', model: 'Celica', price: 40000 });

        api.applyColumnState({
            state: [
                {
                    colId: 'make',
                    hide: true,
                },
            ],
        });

        setTimeout(() => {
            api.updateGridOptions({ columnDefs: [{ field: 'make' }, { field: 'model' }] });
            fixture.detectChanges();

            expect(eventListenerSpy).toHaveBeenCalledTimes(0);
            expect(globalEventListenerSpy).toHaveBeenCalledTimes(0);
            expect(rowEventListenerSpy).toHaveBeenCalledTimes(0);
            expect(columnEventListenerSpy).toHaveBeenCalledTimes(0);

            done();
        }, 100);
    });
});
