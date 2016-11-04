/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Injector, THROW_IF_NOT_FOUND } from '../di/injector';
var _UNDEFINED = new Object();
export var ElementInjector = (function (_super) {
    __extends(ElementInjector, _super);
    function ElementInjector(_view, _nodeIndex) {
        _super.call(this);
        this._view = _view;
        this._nodeIndex = _nodeIndex;
    }
    ElementInjector.prototype.get = function (token, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = THROW_IF_NOT_FOUND; }
        var result = _UNDEFINED;
        if (result === _UNDEFINED) {
            result = this._view.injectorGet(token, this._nodeIndex, _UNDEFINED);
        }
        if (result === _UNDEFINED) {
            result = this._view.parentInjector.get(token, notFoundValue);
        }
        return result;
    };
    return ElementInjector;
}(Injector));
//# sourceMappingURL=element_injector.js.map