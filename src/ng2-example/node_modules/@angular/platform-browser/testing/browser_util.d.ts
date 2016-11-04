/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgZone } from '@angular/core';
export declare class BrowserDetection {
    private _overrideUa;
    private _ua;
    static setup(): void;
    constructor(ua: string);
    isFirefox: boolean;
    isAndroid: boolean;
    isEdge: boolean;
    isIE: boolean;
    isWebkit: boolean;
    isIOS7: boolean;
    isSlow: boolean;
    supportsNativeIntlApi: boolean;
    isChromeDesktop: boolean;
    isOldChrome: boolean;
}
export declare function dispatchEvent(element: any, eventType: any): void;
export declare function el(html: string): HTMLElement;
export declare function normalizeCSS(css: string): string;
export declare function stringifyElement(el: any): string;
export declare var browserDetection: BrowserDetection;
export declare function createNgZone(): NgZone;
