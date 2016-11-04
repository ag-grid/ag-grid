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
import { BaseError } from '../facade/errors';
import { stringify } from '../facade/lang';
export var InvalidPipeArgumentError = (function (_super) {
    __extends(InvalidPipeArgumentError, _super);
    function InvalidPipeArgumentError(type, value) {
        _super.call(this, "Invalid argument '" + value + "' for pipe '" + stringify(type) + "'");
    }
    return InvalidPipeArgumentError;
}(BaseError));
//# sourceMappingURL=invalid_pipe_argument_error.js.map