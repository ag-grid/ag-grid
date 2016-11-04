/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { RouterOutlet } from './directives/router_outlet';
/**
 * @whatItDoes Contains all the router outlets created in a component.
 *
 * @stable
 */
export declare class RouterOutletMap {
    /**
     * Adds an outlet to this map.
     */
    registerOutlet(name: string, outlet: RouterOutlet): void;
    /**
     * Removes an outlet from this map.
     */
    removeOutlet(name: string): void;
}
