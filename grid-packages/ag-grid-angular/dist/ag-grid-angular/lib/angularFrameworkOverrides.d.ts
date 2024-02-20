import { NgZone } from "@angular/core";
import { VanillaFrameworkOverrides, FrameworkOverridesIncomingSource } from "ag-grid-community";
import * as i0 from "@angular/core";
export declare class AngularFrameworkOverrides extends VanillaFrameworkOverrides {
    private _ngZone;
    private isRunningWithinTestZone;
    private runOutside;
    constructor(_ngZone: NgZone);
    wrapIncoming: <T>(callback: () => T, source?: FrameworkOverridesIncomingSource) => T;
    get shouldWrapOutgoing(): boolean;
    /**
     * Make sure that any code that is executed outside of AG Grid is running within the Angular zone.
     * This means users can update templates and use binding without having to do anything extra.
     */
    wrapOutgoing: <T>(callback: () => T) => T;
    isFrameworkComponent(comp: any): boolean;
    runInsideAngular<T>(callback: () => T): T;
    runOutsideAngular<T>(callback: () => T, source?: FrameworkOverridesIncomingSource): T;
    static ɵfac: i0.ɵɵFactoryDeclaration<AngularFrameworkOverrides, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AngularFrameworkOverrides>;
}
