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
import { createDiTokenExpression } from '../compiler_util/identifier_util';
import { isPresent } from '../facade/lang';
import * as o from '../output/output_ast';
export function getPropertyInView(property, callingView, definedView) {
    if (callingView === definedView) {
        return property;
    }
    else {
        var viewProp = o.THIS_EXPR;
        var currView = callingView;
        while (currView !== definedView && isPresent(currView.declarationElement.view)) {
            currView = currView.declarationElement.view;
            viewProp = viewProp.prop('parent');
        }
        if (currView !== definedView) {
            throw new Error("Internal error: Could not calculate a property in a parent view: " + property);
        }
        return property.visitExpression(new _ReplaceViewTransformer(viewProp, definedView), null);
    }
}
var _ReplaceViewTransformer = (function (_super) {
    __extends(_ReplaceViewTransformer, _super);
    function _ReplaceViewTransformer(_viewExpr, _view) {
        _super.call(this);
        this._viewExpr = _viewExpr;
        this._view = _view;
    }
    _ReplaceViewTransformer.prototype._isThis = function (expr) {
        return expr instanceof o.ReadVarExpr && expr.builtin === o.BuiltinVar.This;
    };
    _ReplaceViewTransformer.prototype.visitReadVarExpr = function (ast, context) {
        return this._isThis(ast) ? this._viewExpr : ast;
    };
    _ReplaceViewTransformer.prototype.visitReadPropExpr = function (ast, context) {
        if (this._isThis(ast.receiver)) {
            // Note: Don't cast for members of the AppView base class...
            if (this._view.fields.some(function (field) { return field.name == ast.name; }) ||
                this._view.getters.some(function (field) { return field.name == ast.name; })) {
                return this._viewExpr.cast(this._view.classType).prop(ast.name);
            }
        }
        return _super.prototype.visitReadPropExpr.call(this, ast, context);
    };
    return _ReplaceViewTransformer;
}(o.ExpressionTransformer));
export function injectFromViewParentInjector(token, optional) {
    var args = [createDiTokenExpression(token)];
    if (optional) {
        args.push(o.NULL_EXPR);
    }
    return o.THIS_EXPR.prop('parentInjector').callMethod('get', args);
}
export function getViewFactoryName(component, embeddedTemplateIndex) {
    return "viewFactory_" + component.type.name + embeddedTemplateIndex;
}
export function createFlatArray(expressions) {
    var lastNonArrayExpressions = [];
    var result = o.literalArr([]);
    for (var i = 0; i < expressions.length; i++) {
        var expr = expressions[i];
        if (expr.type instanceof o.ArrayType) {
            if (lastNonArrayExpressions.length > 0) {
                result =
                    result.callMethod(o.BuiltinMethod.ConcatArray, [o.literalArr(lastNonArrayExpressions)]);
                lastNonArrayExpressions = [];
            }
            result = result.callMethod(o.BuiltinMethod.ConcatArray, [expr]);
        }
        else {
            lastNonArrayExpressions.push(expr);
        }
    }
    if (lastNonArrayExpressions.length > 0) {
        result =
            result.callMethod(o.BuiltinMethod.ConcatArray, [o.literalArr(lastNonArrayExpressions)]);
    }
    return result;
}
//# sourceMappingURL=util.js.map