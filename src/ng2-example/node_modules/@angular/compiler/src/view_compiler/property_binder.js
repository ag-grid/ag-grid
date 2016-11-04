/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { createCheckBindingField, createCheckBindingStmt } from '../compiler_util/binding_util';
import { convertPropertyBinding } from '../compiler_util/expression_converter';
import { createEnumExpression } from '../compiler_util/identifier_util';
import { writeToRenderer } from '../compiler_util/render_util';
import { Identifiers, resolveIdentifier } from '../identifiers';
import * as o from '../output/output_ast';
import { EMPTY_STATE as EMPTY_ANIMATION_STATE, isDefaultChangeDetectionStrategy } from '../private_import_core';
import { PropertyBindingType } from '../template_parser/template_ast';
import { DetectChangesVars } from './constants';
export function bindRenderText(boundText, compileNode, view) {
    var valueField = createCheckBindingField(view);
    var evalResult = convertPropertyBinding(view, view, view.componentContext, boundText.value, valueField.bindingId);
    if (!evalResult) {
        return null;
    }
    view.detectChangesRenderPropertiesMethod.resetDebugInfo(compileNode.nodeIndex, boundText);
    view.detectChangesRenderPropertiesMethod.addStmts(createCheckBindingStmt(evalResult, valueField.expression, DetectChangesVars.throwOnChange, [o.THIS_EXPR.prop('renderer')
            .callMethod('setText', [compileNode.renderNode, evalResult.currValExpr])
            .toStmt()]));
}
function bindAndWriteToRenderer(boundProps, context, compileElement, isHostProp, eventListeners) {
    var view = compileElement.view;
    var renderNode = compileElement.renderNode;
    boundProps.forEach(function (boundProp) {
        var bindingField = createCheckBindingField(view);
        view.detectChangesRenderPropertiesMethod.resetDebugInfo(compileElement.nodeIndex, boundProp);
        var evalResult = convertPropertyBinding(view, isHostProp ? null : view, context, boundProp.value, bindingField.bindingId);
        var updateStmts = [];
        var compileMethod = view.detectChangesRenderPropertiesMethod;
        switch (boundProp.type) {
            case PropertyBindingType.Property:
            case PropertyBindingType.Attribute:
            case PropertyBindingType.Class:
            case PropertyBindingType.Style:
                updateStmts.push.apply(updateStmts, writeToRenderer(o.THIS_EXPR, boundProp, renderNode, evalResult.currValExpr, view.genConfig.logBindingUpdate));
                break;
            case PropertyBindingType.Animation:
                compileMethod = view.animationBindingsMethod;
                var detachStmts_1 = [];
                var animationName_1 = boundProp.name;
                var targetViewExpr = isHostProp ? compileElement.appElement.prop('componentView') : o.THIS_EXPR;
                var animationFnExpr = targetViewExpr.prop('componentType').prop('animations').key(o.literal(animationName_1));
                // it's important to normalize the void value as `void` explicitly
                // so that the styles data can be obtained from the stringmap
                var emptyStateValue = o.literal(EMPTY_ANIMATION_STATE);
                var unitializedValue = o.importExpr(resolveIdentifier(Identifiers.UNINITIALIZED));
                var animationTransitionVar_1 = o.variable('animationTransition_' + animationName_1);
                updateStmts.push(animationTransitionVar_1
                    .set(animationFnExpr.callFn([
                    o.THIS_EXPR, renderNode,
                    bindingField.expression.equals(unitializedValue)
                        .conditional(emptyStateValue, bindingField.expression),
                    evalResult.currValExpr.equals(unitializedValue)
                        .conditional(emptyStateValue, evalResult.currValExpr)
                ]))
                    .toDeclStmt());
                detachStmts_1.push(animationTransitionVar_1
                    .set(animationFnExpr.callFn([o.THIS_EXPR, renderNode, bindingField.expression, emptyStateValue]))
                    .toDeclStmt());
                eventListeners.forEach(function (listener) {
                    if (listener.isAnimation && listener.eventName === animationName_1) {
                        var animationStmt = listener.listenToAnimation(animationTransitionVar_1);
                        updateStmts.push(animationStmt);
                        detachStmts_1.push(animationStmt);
                    }
                });
                view.detachMethod.addStmts(detachStmts_1);
                break;
        }
        compileMethod.addStmts(createCheckBindingStmt(evalResult, bindingField.expression, DetectChangesVars.throwOnChange, updateStmts));
    });
}
export function bindRenderInputs(boundProps, compileElement, eventListeners) {
    bindAndWriteToRenderer(boundProps, compileElement.view.componentContext, compileElement, false, eventListeners);
}
export function bindDirectiveHostProps(directiveAst, directiveWrapperInstance, compileElement, eventListeners, elementName, schemaRegistry) {
    // host properties are change detected by the DirectiveWrappers,
    // except for the animation properties as they need close integration with animation events
    // and DirectiveWrappers don't support
    // event listeners right now.
    bindAndWriteToRenderer(directiveAst.hostProperties.filter(function (boundProp) { return boundProp.isAnimation; }), directiveWrapperInstance.prop('context'), compileElement, true, eventListeners);
    var methodArgs = [o.THIS_EXPR, compileElement.renderNode, DetectChangesVars.throwOnChange];
    // We need to provide the SecurityContext for properties that could need sanitization.
    directiveAst.hostProperties.filter(function (boundProp) { return boundProp.needsRuntimeSecurityContext; })
        .forEach(function (boundProp) {
        var ctx;
        switch (boundProp.type) {
            case PropertyBindingType.Property:
                ctx = schemaRegistry.securityContext(elementName, boundProp.name, false);
                break;
            case PropertyBindingType.Attribute:
                ctx = schemaRegistry.securityContext(elementName, boundProp.name, true);
                break;
            default:
                throw new Error("Illegal state: Only property / attribute bindings can have an unknown security context! Binding " + boundProp.name);
        }
        methodArgs.push(createEnumExpression(Identifiers.SecurityContext, ctx));
    });
    compileElement.view.detectChangesRenderPropertiesMethod.addStmt(directiveWrapperInstance.callMethod('detectChangesInHostProps', methodArgs).toStmt());
}
export function bindDirectiveInputs(directiveAst, directiveWrapperInstance, dirIndex, compileElement) {
    var view = compileElement.view;
    var detectChangesInInputsMethod = view.detectChangesInInputsMethod;
    detectChangesInInputsMethod.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
    directiveAst.inputs.forEach(function (input, inputIdx) {
        // Note: We can't use `fields.length` here, as we are not adding a field!
        var bindingId = compileElement.nodeIndex + "_" + dirIndex + "_" + inputIdx;
        detectChangesInInputsMethod.resetDebugInfo(compileElement.nodeIndex, input);
        var evalResult = convertPropertyBinding(view, view, view.componentContext, input.value, bindingId);
        if (!evalResult) {
            return;
        }
        detectChangesInInputsMethod.addStmts(evalResult.stmts);
        detectChangesInInputsMethod.addStmt(directiveWrapperInstance
            .callMethod("check_" + input.directiveName, [
            evalResult.currValExpr, DetectChangesVars.throwOnChange,
            evalResult.forceUpdate || o.literal(false)
        ])
            .toStmt());
    });
    var isOnPushComp = directiveAst.directive.isComponent &&
        !isDefaultChangeDetectionStrategy(directiveAst.directive.changeDetection);
    var directiveDetectChangesExpr = directiveWrapperInstance.callMethod('detectChangesInInputProps', [o.THIS_EXPR, compileElement.renderNode, DetectChangesVars.throwOnChange]);
    var directiveDetectChangesStmt = isOnPushComp ?
        new o.IfStmt(directiveDetectChangesExpr, [compileElement.appElement.prop('componentView')
                .callMethod('markAsCheckOnce', [])
                .toStmt()]) :
        directiveDetectChangesExpr.toStmt();
    detectChangesInInputsMethod.addStmt(directiveDetectChangesStmt);
}
//# sourceMappingURL=property_binder.js.map