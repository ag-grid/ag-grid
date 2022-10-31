import { AfterViewInit, ElementRef, OnChanges, OnDestroy } from "@angular/core";
import { AgChartOptions } from 'ag-charts-community';
import * as i0 from "@angular/core";
export declare class AgChartsAngular implements AfterViewInit, OnChanges, OnDestroy {
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
    static ɵfac: i0.ɵɵFactoryDeclaration<AgChartsAngular, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AgChartsAngular, "ag-charts-angular", never, { "options": "options"; }, {}, never, never>;
}
