import { AfterViewInit, ElementRef } from "@angular/core";
import { AgChartOptions } from 'ag-charts-community';
export declare class AgChartsAngular implements AfterViewInit {
    private _nativeElement;
    private _initialised;
    private _destroyed;
    private _chart;
    options: AgChartOptions;
    constructor(elementDef: ElementRef);
    ngAfterViewInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    private applyContainerIfNotSet;
}
