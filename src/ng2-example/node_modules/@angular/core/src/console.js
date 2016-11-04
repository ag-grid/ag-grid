/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from './di';
import { print, warn } from './facade/lang';
export var Console = (function () {
    function Console() {
    }
    Console.prototype.log = function (message) { print(message); };
    // Note: for reporting errors use `DOM.logError()` as it is platform specific
    Console.prototype.warn = function (message) { warn(message); };
    Console.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    Console.ctorParameters = [];
    return Console;
}());
//# sourceMappingURL=console.js.map