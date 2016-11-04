/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileIdentifierMetadata } from '../compile_metadata';
import { visitValue } from '../util';
import * as o from './output_ast';
export function convertValueToOutputAst(value, type) {
    if (type === void 0) { type = null; }
    return visitValue(value, new _ValueOutputAstTransformer(), type);
}
var _ValueOutputAstTransformer = (function () {
    function _ValueOutputAstTransformer() {
    }
    _ValueOutputAstTransformer.prototype.visitArray = function (arr, type) {
        var _this = this;
        return o.literalArr(arr.map(function (value) { return visitValue(value, _this, null); }), type);
    };
    _ValueOutputAstTransformer.prototype.visitStringMap = function (map, type) {
        var _this = this;
        var entries = [];
        Object.keys(map).forEach(function (key) { entries.push([key, visitValue(map[key], _this, null)]); });
        return o.literalMap(entries, type);
    };
    _ValueOutputAstTransformer.prototype.visitPrimitive = function (value, type) { return o.literal(value, type); };
    _ValueOutputAstTransformer.prototype.visitOther = function (value, type) {
        if (value instanceof CompileIdentifierMetadata) {
            return o.importExpr(value);
        }
        else if (value instanceof o.Expression) {
            return value;
        }
        else {
            throw new Error("Illegal state: Don't now how to compile value " + value);
        }
    };
    return _ValueOutputAstTransformer;
}());
//# sourceMappingURL=value_util.js.map