/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPresent } from '../facade/lang';
import * as o from '../output/output_ast';
var _DebugState = (function () {
    function _DebugState(nodeIndex, sourceAst) {
        this.nodeIndex = nodeIndex;
        this.sourceAst = sourceAst;
    }
    return _DebugState;
}());
var NULL_DEBUG_STATE = new _DebugState(null, null);
export var CompileMethod = (function () {
    function CompileMethod(_view) {
        this._view = _view;
        this._newState = NULL_DEBUG_STATE;
        this._currState = NULL_DEBUG_STATE;
        this._bodyStatements = [];
        this._debugEnabled = this._view.genConfig.genDebugInfo;
    }
    CompileMethod.prototype._updateDebugContextIfNeeded = function () {
        if (this._newState.nodeIndex !== this._currState.nodeIndex ||
            this._newState.sourceAst !== this._currState.sourceAst) {
            var expr = this._updateDebugContext(this._newState);
            if (isPresent(expr)) {
                this._bodyStatements.push(expr.toStmt());
            }
        }
    };
    CompileMethod.prototype._updateDebugContext = function (newState) {
        this._currState = this._newState = newState;
        if (this._debugEnabled) {
            var sourceLocation = isPresent(newState.sourceAst) ? newState.sourceAst.sourceSpan.start : null;
            return o.THIS_EXPR.callMethod('debug', [
                o.literal(newState.nodeIndex),
                isPresent(sourceLocation) ? o.literal(sourceLocation.line) : o.NULL_EXPR,
                isPresent(sourceLocation) ? o.literal(sourceLocation.col) : o.NULL_EXPR
            ]);
        }
        else {
            return null;
        }
    };
    CompileMethod.prototype.resetDebugInfoExpr = function (nodeIndex, templateAst) {
        var res = this._updateDebugContext(new _DebugState(nodeIndex, templateAst));
        return res || o.NULL_EXPR;
    };
    CompileMethod.prototype.resetDebugInfo = function (nodeIndex, templateAst) {
        this._newState = new _DebugState(nodeIndex, templateAst);
    };
    CompileMethod.prototype.push = function () {
        var stmts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stmts[_i - 0] = arguments[_i];
        }
        this.addStmts(stmts);
    };
    CompileMethod.prototype.addStmt = function (stmt) {
        this._updateDebugContextIfNeeded();
        this._bodyStatements.push(stmt);
    };
    CompileMethod.prototype.addStmts = function (stmts) {
        this._updateDebugContextIfNeeded();
        (_a = this._bodyStatements).push.apply(_a, stmts);
        var _a;
    };
    CompileMethod.prototype.finish = function () { return this._bodyStatements; };
    CompileMethod.prototype.isEmpty = function () { return this._bodyStatements.length === 0; };
    return CompileMethod;
}());
//# sourceMappingURL=compile_method.js.map