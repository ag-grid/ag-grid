/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgZone } from '@angular/core';
import { EventManagerPlugin } from './event_manager';
/**
 * @experimental
 */
export declare class KeyEventsPlugin extends EventManagerPlugin {
    constructor();
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    static parseEventName(eventName: string): {
        [key: string]: string;
    };
    static getEventFullKey(event: KeyboardEvent): string;
    static eventCallback(element: HTMLElement, fullKey: any, handler: Function, zone: NgZone): Function;
}
