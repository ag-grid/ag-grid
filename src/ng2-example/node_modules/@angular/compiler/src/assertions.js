/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isDevMode } from '@angular/core';
import { isBlank, isPresent } from '../src/facade/lang';
export function assertArrayOfStrings(identifier, value) {
    if (!isDevMode() || isBlank(value)) {
        return;
    }
    if (!Array.isArray(value)) {
        throw new Error("Expected '" + identifier + "' to be an array of strings.");
    }
    for (var i = 0; i < value.length; i += 1) {
        if (typeof value[i] !== 'string') {
            throw new Error("Expected '" + identifier + "' to be an array of strings.");
        }
    }
}
var INTERPOLATION_BLACKLIST_REGEXPS = [
    /^\s*$/,
    /[<>]/,
    /^[{}]$/,
    /&(#|[a-z])/i,
    /^\/\//,
];
export function assertInterpolationSymbols(identifier, value) {
    if (isPresent(value) && !(Array.isArray(value) && value.length == 2)) {
        throw new Error("Expected '" + identifier + "' to be an array, [start, end].");
    }
    else if (isDevMode() && !isBlank(value)) {
        var start_1 = value[0];
        var end_1 = value[1];
        // black list checking
        INTERPOLATION_BLACKLIST_REGEXPS.forEach(function (regexp) {
            if (regexp.test(start_1) || regexp.test(end_1)) {
                throw new Error("['" + start_1 + "', '" + end_1 + "'] contains unusable interpolation symbol.");
            }
        });
    }
}
//# sourceMappingURL=assertions.js.map