/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DebugNode, Provider } from '@angular/core';
/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export declare function inspectNativeElement(element: any): DebugNode;
/**
 * @experimental
 */
export declare class NgProbeToken {
    private name;
    private token;
    constructor(name: string, token: any);
}
export declare function _createConditionalRootRenderer(rootRenderer: any, extraTokens: NgProbeToken[]): any;
/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
export declare const ELEMENT_PROBE_PROVIDERS: Provider[];
export declare const ELEMENT_PROBE_PROVIDERS_PROD_MODE: any[];
