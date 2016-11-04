/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventManagerPlugin } from './event_manager';
export declare class HammerGesturesPluginCommon extends EventManagerPlugin {
    constructor();
    supports(eventName: string): boolean;
}
