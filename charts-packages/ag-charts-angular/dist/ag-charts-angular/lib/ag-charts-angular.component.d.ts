import { AfterViewInit, ElementRef } from "@angular/core";
export interface AgLegendProps {
    enabled?: boolean;
    padding?: number;
    itemPaddingX?: number;
    itemPaddingY?: number;
    markerSize?: number;
    markerStrokeWidth?: number;
    labelColor?: string;
    labelFontFamily?: string;
}
export interface Series {
    type?: string;
    xKey: string;
    yKey: string;
}
export interface AgChartOptions {
    width?: number;
    height?: number;
    data?: any[];
    series: Series[];
    legend?: AgLegendProps;
}
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
