import { AfterViewInit, ElementRef, EventEmitter } from "@angular/core";
import { AgChartInstance, AgChartOptions } from 'ag-charts-community';
export declare class AgChartsAngular implements AfterViewInit {
    private _nativeElement;
    private _initialised;
    chart?: AgChartInstance;
    options: AgChartOptions;
    onChartReady: EventEmitter<AgChartInstance>;
    constructor(elementDef: ElementRef);
    ngAfterViewInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    private applyContainerIfNotSet;
}
