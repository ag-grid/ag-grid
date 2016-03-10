// ag-grid-ng2 v4.0.2
import { ElementRef } from 'angular2/core';
export declare class AgGridNg2 {
    private elementDef;
    private _initialised;
    private _destroyed;
    private gridOptions;
    private api;
    private columnApi;
    constructor(elementDef: ElementRef);
    ngOnInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    private globalEventListener(eventType, event);
}
