import { SecurityContext } from '@angular/core';
import { isPresent } from '../facade/lang';
import { Identifiers, resolveIdentifier } from '../identifiers';
import * as o from '../output/output_ast';
import { PropertyBindingType } from '../template_parser/template_ast';
import { createEnumExpression } from './identifier_util';
export function writeToRenderer(view, boundProp, renderElement, renderValue, logBindingUpdate, securityContextExpression) {
    var updateStmts = [];
    var renderer = view.prop('renderer');
    renderValue = sanitizedValue(view, boundProp, renderValue, securityContextExpression);
    switch (boundProp.type) {
        case PropertyBindingType.Property:
            if (logBindingUpdate) {
                updateStmts.push(o.importExpr(resolveIdentifier(Identifiers.setBindingDebugInfo))
                    .callFn([renderer, renderElement, o.literal(boundProp.name), renderValue])
                    .toStmt());
            }
            updateStmts.push(renderer
                .callMethod('setElementProperty', [renderElement, o.literal(boundProp.name), renderValue])
                .toStmt());
            break;
        case PropertyBindingType.Attribute:
            renderValue =
                renderValue.isBlank().conditional(o.NULL_EXPR, renderValue.callMethod('toString', []));
            updateStmts.push(renderer
                .callMethod('setElementAttribute', [renderElement, o.literal(boundProp.name), renderValue])
                .toStmt());
            break;
        case PropertyBindingType.Class:
            updateStmts.push(renderer
                .callMethod('setElementClass', [renderElement, o.literal(boundProp.name), renderValue])
                .toStmt());
            break;
        case PropertyBindingType.Style:
            var strValue = renderValue.callMethod('toString', []);
            if (isPresent(boundProp.unit)) {
                strValue = strValue.plus(o.literal(boundProp.unit));
            }
            renderValue = renderValue.isBlank().conditional(o.NULL_EXPR, strValue);
            updateStmts.push(renderer
                .callMethod('setElementStyle', [renderElement, o.literal(boundProp.name), renderValue])
                .toStmt());
            break;
        case PropertyBindingType.Animation:
            throw new Error('Illegal state: Should not come here!');
    }
    return updateStmts;
}
function sanitizedValue(view, boundProp, renderValue, securityContextExpression) {
    if (boundProp.securityContext === SecurityContext.NONE) {
        return renderValue; // No sanitization needed.
    }
    if (!boundProp.needsRuntimeSecurityContext) {
        securityContextExpression =
            createEnumExpression(Identifiers.SecurityContext, boundProp.securityContext);
    }
    if (!securityContextExpression) {
        throw new Error("internal error, no SecurityContext given " + boundProp.name);
    }
    var ctx = view.prop('viewUtils').prop('sanitizer');
    var args = [securityContextExpression, renderValue];
    return ctx.callMethod('sanitize', args);
}
//# sourceMappingURL=render_util.js.map