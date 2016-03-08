// ag-grid-ng2 v4.0.0
/// <reference path="../node_modules/angular2/typings/browser.d.ts" />
import { ElementRef } from 'angular2/core';
export declare class AgGridNg2 {
    private elementDef;
    private _initialised;
    private gridOptions;
    private api;
    private columnApi;
    constructor(elementDef: ElementRef);
    ngOnInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    private globalEventListener(eventType, event);
}
