/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isBlank, isPrimitive, isStrictStringMap } from './facade/lang';
export var MODULE_SUFFIX = '';
var CAMEL_CASE_REGEXP = /([A-Z])/g;
export function camelCaseToDashCase(input) {
    return input.replace(CAMEL_CASE_REGEXP, function () {
        var m = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            m[_i - 0] = arguments[_i];
        }
        return '-' + m[1].toLowerCase();
    });
}
export function splitAtColon(input, defaultValues) {
    return _splitAt(input, ':', defaultValues);
}
export function splitAtPeriod(input, defaultValues) {
    return _splitAt(input, '.', defaultValues);
}
function _splitAt(input, character, defaultValues) {
    var characterIndex = input.indexOf(character);
    if (characterIndex == -1)
        return defaultValues;
    return [input.slice(0, characterIndex).trim(), input.slice(characterIndex + 1).trim()];
}
export function sanitizeIdentifier(name) {
    return name.replace(/\W/g, '_');
}
export function visitValue(value, visitor, context) {
    if (Array.isArray(value)) {
        return visitor.visitArray(value, context);
    }
    if (isStrictStringMap(value)) {
        return visitor.visitStringMap(value, context);
    }
    if (isBlank(value) || isPrimitive(value)) {
        return visitor.visitPrimitive(value, context);
    }
    return visitor.visitOther(value, context);
}
export var ValueTransformer = (function () {
    function ValueTransformer() {
    }
    ValueTransformer.prototype.visitArray = function (arr, context) {
        var _this = this;
        return arr.map(function (value) { return visitValue(value, _this, context); });
    };
    ValueTransformer.prototype.visitStringMap = function (map, context) {
        var _this = this;
        var result = {};
        Object.keys(map).forEach(function (key) { result[key] = visitValue(map[key], _this, context); });
        return result;
    };
    ValueTransformer.prototype.visitPrimitive = function (value, context) { return value; };
    ValueTransformer.prototype.visitOther = function (value, context) { return value; };
    return ValueTransformer;
}());
export var SyncAsyncResult = (function () {
    function SyncAsyncResult(syncResult, asyncResult) {
        if (asyncResult === void 0) { asyncResult = null; }
        this.syncResult = syncResult;
        this.asyncResult = asyncResult;
        if (!asyncResult) {
            this.asyncResult = Promise.resolve(syncResult);
        }
    }
    return SyncAsyncResult;
}());
//# sourceMappingURL=util.js.map