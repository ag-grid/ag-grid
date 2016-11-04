/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventHandlerVars, convertActionBinding } from '../compiler_util/expression_converter';
import { isPresent } from '../facade/lang';
import { identifierToken } from '../identifiers';
import * as o from '../output/output_ast';
import { CompileMethod } from './compile_method';
import { ViewProperties } from './constants';
export var CompileEventListener = (function () {
    function CompileEventListener(compileElement, eventTarget, eventName, eventPhase, listenerIndex) {
        this.compileElement = compileElement;
        this.eventTarget = eventTarget;
        this.eventName = eventName;
        this.eventPhase = eventPhase;
        this._hasComponentHostListener = false;
        this._actionResultExprs = [];
        this._method = new CompileMethod(compileElement.view);
        this._methodName =
            "_handle_" + sanitizeEventName(eventName) + "_" + compileElement.nodeIndex + "_" + listenerIndex;
        this._eventParam = new o.FnParam(EventHandlerVars.event.name, o.importType(this.compileElement.view.genConfig.renderTypes.renderEvent));
    }
    CompileEventListener.getOrCreate = function (compileElement, eventTarget, eventName, eventPhase, targetEventListeners) {
        var listener = targetEventListeners.find(function (listener) { return listener.eventTarget == eventTarget && listener.eventName == eventName &&
            listener.eventPhase == eventPhase; });
        if (!listener) {
            listener = new CompileEventListener(compileElement, eventTarget, eventName, eventPhase, targetEventListeners.length);
            targetEventListeners.push(listener);
        }
        return listener;
    };
    Object.defineProperty(CompileEventListener.prototype, "methodName", {
        get: function () { return this._methodName; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CompileEventListener.prototype, "isAnimation", {
        get: function () { return !!this.eventPhase; },
        enumerable: true,
        configurable: true
    });
    CompileEventListener.prototype.addAction = function (hostEvent, directive, directiveInstance) {
        if (isPresent(directive) && directive.isComponent) {
            this._hasComponentHostListener = true;
        }
        this._method.resetDebugInfo(this.compileElement.nodeIndex, hostEvent);
        var context = directiveInstance || this.compileElement.view.componentContext;
        var view = this.compileElement.view;
        var evalResult = convertActionBinding(view, directive ? null : view, context, hostEvent.handler, this.compileElement.nodeIndex + "_" + this._actionResultExprs.length);
        if (evalResult.preventDefault) {
            this._actionResultExprs.push(evalResult.preventDefault);
        }
        this._method.addStmts(evalResult.stmts);
    };
    CompileEventListener.prototype.finishMethod = function () {
        var markPathToRootStart = this._hasComponentHostListener ?
            this.compileElement.appElement.prop('componentView') :
            o.THIS_EXPR;
        var resultExpr = o.literal(true);
        this._actionResultExprs.forEach(function (expr) { resultExpr = resultExpr.and(expr); });
        var stmts = [markPathToRootStart.callMethod('markPathToRootAsCheckOnce', []).toStmt()]
            .concat(this._method.finish())
            .concat([new o.ReturnStatement(resultExpr)]);
        // private is fine here as no child view will reference the event handler...
        this.compileElement.view.methods.push(new o.ClassMethod(this._methodName, [this._eventParam], stmts, o.BOOL_TYPE, [o.StmtModifier.Private]));
    };
    CompileEventListener.prototype.listenToRenderer = function () {
        var listenExpr;
        var eventListener = o.THIS_EXPR.callMethod('eventHandler', [o.THIS_EXPR.prop(this._methodName).callMethod(o.BuiltinMethod.Bind, [o.THIS_EXPR])]);
        if (isPresent(this.eventTarget)) {
            listenExpr = ViewProperties.renderer.callMethod('listenGlobal', [o.literal(this.eventTarget), o.literal(this.eventName), eventListener]);
        }
        else {
            listenExpr = ViewProperties.renderer.callMethod('listen', [this.compileElement.renderNode, o.literal(this.eventName), eventListener]);
        }
        var disposable = o.variable("disposable_" + this.compileElement.view.disposables.length);
        this.compileElement.view.disposables.push(disposable);
        // private is fine here as no child view will reference the event handler...
        this.compileElement.view.createMethod.addStmt(disposable.set(listenExpr).toDeclStmt(o.FUNCTION_TYPE, [o.StmtModifier.Private]));
    };
    CompileEventListener.prototype.listenToAnimation = function (animationTransitionVar) {
        var callbackMethod = this.eventPhase == 'start' ? 'onStart' : 'onDone';
        return animationTransitionVar
            .callMethod(callbackMethod, [o.THIS_EXPR.prop(this.methodName).callMethod(o.BuiltinMethod.Bind, [o.THIS_EXPR])])
            .toStmt();
    };
    CompileEventListener.prototype.listenToDirective = function (directiveInstance, observablePropName) {
        var subscription = o.variable("subscription_" + this.compileElement.view.subscriptions.length);
        this.compileElement.view.subscriptions.push(subscription);
        var eventListener = o.THIS_EXPR.callMethod('eventHandler', [o.THIS_EXPR.prop(this._methodName).callMethod(o.BuiltinMethod.Bind, [o.THIS_EXPR])]);
        this.compileElement.view.createMethod.addStmt(subscription
            .set(directiveInstance.prop(observablePropName)
            .callMethod(o.BuiltinMethod.SubscribeObservable, [eventListener]))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    };
    return CompileEventListener;
}());
export function collectEventListeners(hostEvents, dirs, compileElement) {
    var eventListeners = [];
    hostEvents.forEach(function (hostEvent) {
        var listener = CompileEventListener.getOrCreate(compileElement, hostEvent.target, hostEvent.name, hostEvent.phase, eventListeners);
        listener.addAction(hostEvent, null, null);
    });
    dirs.forEach(function (directiveAst) {
        var directiveInstance = compileElement.instances.get(identifierToken(directiveAst.directive.type).reference);
        directiveAst.hostEvents.forEach(function (hostEvent) {
            var listener = CompileEventListener.getOrCreate(compileElement, hostEvent.target, hostEvent.name, hostEvent.phase, eventListeners);
            listener.addAction(hostEvent, directiveAst.directive, directiveInstance);
        });
    });
    eventListeners.forEach(function (listener) { return listener.finishMethod(); });
    return eventListeners;
}
export function bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners) {
    Object.keys(directiveAst.directive.outputs).forEach(function (observablePropName) {
        var eventName = directiveAst.directive.outputs[observablePropName];
        eventListeners.filter(function (listener) { return listener.eventName == eventName; }).forEach(function (listener) {
            listener.listenToDirective(directiveInstance, observablePropName);
        });
    });
}
export function bindRenderOutputs(eventListeners) {
    eventListeners.forEach(function (listener) {
        // the animation listeners are handled within property_binder.ts to
        // allow them to be placed next to the animation factory statements
        if (!listener.isAnimation) {
            listener.listenToRenderer();
        }
    });
}
function convertStmtIntoExpression(stmt) {
    if (stmt instanceof o.ExpressionStatement) {
        return stmt.expr;
    }
    else if (stmt instanceof o.ReturnStatement) {
        return stmt.value;
    }
    return null;
}
function sanitizeEventName(name) {
    return name.replace(/[^a-zA-Z_]/g, '_');
}
//# sourceMappingURL=event_binder.js.map