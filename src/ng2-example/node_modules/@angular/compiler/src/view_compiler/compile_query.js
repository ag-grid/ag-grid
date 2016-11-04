/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ListWrapper } from '../facade/collection';
import { isPresent } from '../facade/lang';
import { Identifiers, resolveIdentifier } from '../identifiers';
import * as o from '../output/output_ast';
import { getPropertyInView } from './util';
var ViewQueryValues = (function () {
    function ViewQueryValues(view, values) {
        this.view = view;
        this.values = values;
    }
    return ViewQueryValues;
}());
export var CompileQuery = (function () {
    function CompileQuery(meta, queryList, ownerDirectiveExpression, view) {
        this.meta = meta;
        this.queryList = queryList;
        this.ownerDirectiveExpression = ownerDirectiveExpression;
        this.view = view;
        this._values = new ViewQueryValues(view, []);
    }
    CompileQuery.prototype.addValue = function (value, view) {
        var currentView = view;
        var elPath = [];
        while (isPresent(currentView) && currentView !== this.view) {
            var parentEl = currentView.declarationElement;
            elPath.unshift(parentEl);
            currentView = parentEl.view;
        }
        var queryListForDirtyExpr = getPropertyInView(this.queryList, view, this.view);
        var viewValues = this._values;
        elPath.forEach(function (el) {
            var last = viewValues.values.length > 0 ? viewValues.values[viewValues.values.length - 1] : null;
            if (last instanceof ViewQueryValues && last.view === el.embeddedView) {
                viewValues = last;
            }
            else {
                var newViewValues = new ViewQueryValues(el.embeddedView, []);
                viewValues.values.push(newViewValues);
                viewValues = newViewValues;
            }
        });
        viewValues.values.push(value);
        if (elPath.length > 0) {
            view.dirtyParentQueriesMethod.addStmt(queryListForDirtyExpr.callMethod('setDirty', []).toStmt());
        }
    };
    CompileQuery.prototype._isStatic = function () {
        return !this._values.values.some(function (value) { return value instanceof ViewQueryValues; });
    };
    CompileQuery.prototype.afterChildren = function (targetStaticMethod, targetDynamicMethod) {
        var values = createQueryValues(this._values);
        var updateStmts = [this.queryList.callMethod('reset', [o.literalArr(values)]).toStmt()];
        if (isPresent(this.ownerDirectiveExpression)) {
            var valueExpr = this.meta.first ? this.queryList.prop('first') : this.queryList;
            updateStmts.push(this.ownerDirectiveExpression.prop(this.meta.propertyName).set(valueExpr).toStmt());
        }
        if (!this.meta.first) {
            updateStmts.push(this.queryList.callMethod('notifyOnChanges', []).toStmt());
        }
        if (this.meta.first && this._isStatic()) {
            // for queries that don't change and the user asked for a single element,
            // set it immediately. That is e.g. needed for querying for ViewContainerRefs, ...
            // we don't do this for QueryLists for now as this would break the timing when
            // we call QueryList listeners...
            targetStaticMethod.addStmts(updateStmts);
        }
        else {
            targetDynamicMethod.addStmt(new o.IfStmt(this.queryList.prop('dirty'), updateStmts));
        }
    };
    return CompileQuery;
}());
function createQueryValues(viewValues) {
    return ListWrapper.flatten(viewValues.values.map(function (entry) {
        if (entry instanceof ViewQueryValues) {
            return mapNestedViews(entry.view.declarationElement.appElement, entry.view, createQueryValues(entry));
        }
        else {
            return entry;
        }
    }));
}
function mapNestedViews(declarationAppElement, view, expressions) {
    var adjustedExpressions = expressions.map(function (expr) { return o.replaceVarInExpression(o.THIS_EXPR.name, o.variable('nestedView'), expr); });
    return declarationAppElement.callMethod('mapNestedViews', [
        o.variable(view.className),
        o.fn([new o.FnParam('nestedView', view.classType)], [new o.ReturnStatement(o.literalArr(adjustedExpressions))], o.DYNAMIC_TYPE)
    ]);
}
export function createQueryList(query, directiveInstance, propertyName, compileView) {
    compileView.fields.push(new o.ClassField(propertyName, o.importType(resolveIdentifier(Identifiers.QueryList), [o.DYNAMIC_TYPE])));
    var expr = o.THIS_EXPR.prop(propertyName);
    compileView.createMethod.addStmt(o.THIS_EXPR.prop(propertyName)
        .set(o.importExpr(resolveIdentifier(Identifiers.QueryList), [o.DYNAMIC_TYPE])
        .instantiate([]))
        .toStmt());
    return expr;
}
export function addQueryToTokenMap(map, query) {
    query.meta.selectors.forEach(function (selector) {
        var entry = map.get(selector.reference);
        if (!entry) {
            entry = [];
            map.set(selector.reference, entry);
        }
        entry.push(query);
    });
}
//# sourceMappingURL=compile_query.js.map