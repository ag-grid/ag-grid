import { Component, NgZone, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridAngular } from './ag-grid-angular.component';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GetRowIdParams, GridApi, GridOptions, GridReadyEvent, Module } from '@ag-grid-community/core';

function updateCount(counts: Record<string, boolean>, key: string, isInAngularZone: boolean) {
    counts[key] = isInAngularZone;
}

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
            updateCount(this.zoneStatus, 'gridOptions -> callback', NgZone.isInAngularZone());
            return 'my-class';
        },
        onStateUpdated: () => {
            updateCount(this.zoneStatus, 'gridOptions -> event', NgZone.isInAngularZone());
        },
    };

    zoneStatus: any = {};

    // Method will be provided by test case
    setupListeners: (zone: NgZone, api: GridApi, zoneStatus: any) => void = () => {};

    @ViewChild(AgGridAngular) agGrid: AgGridAngular;

    constructor(private zone: NgZone) {}

    onGridReady(params: GridReadyEvent) {
        updateCount(this.zoneStatus, 'component -> event', NgZone.isInAngularZone());

        this.setupListeners(this.zone, params.api, this.zoneStatus);
    }

    getRowId = (params: GetRowIdParams) => {
        updateCount(this.zoneStatus, 'component -> callback', NgZone.isInAngularZone());
        return params.data.make;
    };
}

describe('GridWrapperComponent', () => {
    let component: GridWrapperComponent;
    let fixture: ComponentFixture<GridWrapperComponent>;

    beforeAll(() => {
        (window as any).AG_GRID_UNDER_TEST = false;
    });
    afterAll(() => {
        (window as any).AG_GRID_UNDER_TEST = undefined;
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GridWrapperComponent, AgGridAngular],
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(GridWrapperComponent);
        component = fixture.componentInstance;
        component.zoneStatus = {};
        fixture.detectChanges();
    });

    it('should run in / out Angular Zone', (done) => {
        // Access AG Grid API and check if the row data is updated
        const api = fixture.componentInstance.agGrid.api;
        expect(api).toBeDefined();
        expect(api.getDisplayedRowCount()).toEqual(1);

        fixture.componentInstance.setupListeners = (zone: NgZone, api: GridApi, zoneStatus: any) => {
            const globalListener = (event: any) => {
                updateCount(zoneStatus, 'api -> globalListener', NgZone.isInAngularZone());
            };

            const eventListener = (event: any) => {
                updateCount(zoneStatus, 'api -> eventListener', NgZone.isInAngularZone());
            };

            api.addGlobalListener(globalListener);
            api.addEventListener('newColumnsLoaded', eventListener);

            api.getRowNode('Toyota')?.addEventListener('dataChanged', (event: any) => {
                updateCount(zoneStatus, 'RowNode -> eventListener', NgZone.isInAngularZone());
            });

            api.getColumn('make')?.addEventListener('visibleChanged', (event: any) => {
                updateCount(zoneStatus, 'Column -> eventListener', NgZone.isInAngularZone());
            });

            api.getRowNode('Toyota')?.setData({ make: 'Toyota', model: 'Celica', price: 40000 });

            api.applyColumnState({
                state: [
                    {
                        colId: 'make',
                        hide: true,
                    },
                ],
            });
        };

        setTimeout(() => {
            api.updateGridOptions({ columnDefs: [{ field: 'make' }, { field: 'model' }] });
            fixture.detectChanges();

            setTimeout(() => {
                const results = Object.fromEntries(
                    Object.entries(component.zoneStatus).map(([key, value]) => {
                        const valueString = JSON.stringify(value);
                        return [key, valueString];
                    })
                );
                // results.sort();
                // console.log('\n', results.join('\n'));
                const expected: Record<string, boolean> = {
                    'Column -> eventListener': true,
                    'RowNode -> eventListener': true,
                    'api -> eventListener': true,
                    'api -> globalListener': true,
                    'component -> callback': false,
                    'component -> event': true,
                    'gridOptions -> callback': false,
                    'gridOptions -> event': true,
                };

                Object.keys(expected).forEach((key) => {
                    expect(`${key}: ${results[key]}`).toBe(`${key}: ${expected[key]}`);
                });

                done();
            }, 1500);
        }, 1500);
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

    it('should run in / out Angular Zone Setup Outside', (done) => {
        // Access AG Grid API and check if the row data is updated
        const api = fixture.componentInstance.agGrid.api;
        expect(api).toBeDefined();
        expect(api.getDisplayedRowCount()).toEqual(1);
        

        fixture.componentInstance.setupListeners = (zone: NgZone, api: GridApi, zoneStatus: any) => {
            // For testing purposes, we are going to add listeners to the grid outside of angular to mimic
            zone.runOutsideAngular(() => {
                const globalListener = (event: any) => {
                    updateCount(zoneStatus, 'api -> globalListener', NgZone.isInAngularZone());
                };

                const eventListener = (event: any) => {
                    updateCount(zoneStatus, 'api -> eventListener', NgZone.isInAngularZone());
                };

                api.addGlobalListener(globalListener);
                api.addEventListener('newColumnsLoaded', eventListener);

                api.getRowNode('Toyota')?.addEventListener('dataChanged', (event: any) => {
                    updateCount(zoneStatus, 'RowNode -> eventListener', NgZone.isInAngularZone());
                });

                api.getColumn('make')?.addEventListener('visibleChanged', (event: any) => {
                    updateCount(zoneStatus, 'Column -> eventListener', NgZone.isInAngularZone());
                });

                api.getRowNode('Toyota')?.setData({ make: 'Toyota', model: 'Celica', price: 40000 });

                api.applyColumnState({
                    state: [
                        {
                            colId: 'make',
                            hide: true,
                        },
                    ],
                });
            });
        };

        setTimeout(() => {
            api.updateGridOptions({ columnDefs: [{ field: 'make' }, { field: 'model' }] });
            fixture.detectChanges();

            setTimeout(() => {
                const results = Object.fromEntries(
                    Object.entries(component.zoneStatus).map(([key, value]) => {
                        const valueString = JSON.stringify(value);
                        return [key, valueString];
                    })
                );
                // results.sort();
                // console.log('\n', results.join('\n'));
                const expected: Record<string, boolean> = {
                    'Column -> eventListener': false, // Will stay outside
                    'RowNode -> eventListener': false, // Will stay outside
                    'api -> eventListener': false, // Will stay outside
                    'api -> globalListener': false, // Will stay outside
                    'component -> callback': false,
                    'component -> event': true,
                    'gridOptions -> callback': false,
                    'gridOptions -> event': true
                };

                Object.keys(expected).forEach((key) => {
                    expect(`${key}: ${results[key]}`).toBe(`${key}: ${expected[key]}`);
                });

                done();
            }, 1500);
        }, 1500);
    });
});
