import { NgZone } from "@angular/core";
import { IFrameworkFactory } from "ag-grid-community";
export declare class Ng2FrameworkFactory implements IFrameworkFactory {
    private _ngZone;
    constructor(_ngZone: NgZone);
    setTimeout(action: any, timeout?: any): void;
}
