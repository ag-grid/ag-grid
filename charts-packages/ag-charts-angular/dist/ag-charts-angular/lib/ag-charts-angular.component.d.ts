import { AfterViewInit, ElementRef } from "@angular/core";
export declare class AgChartsAngular implements AfterViewInit {
    private _nativeElement;
    private _initialised;
    private _destroyed;
    private _chart;
    options: any;
    constructor(elementDef: ElementRef);
    ngAfterViewInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    private applyContainerIfNotSet;
}
