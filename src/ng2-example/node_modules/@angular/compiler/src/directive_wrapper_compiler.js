/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { createCheckBindingField, createCheckBindingStmt } from './compiler_util/binding_util';
import { convertPropertyBinding } from './compiler_util/expression_converter';
import { writeToRenderer } from './compiler_util/render_util';
import { CompilerConfig } from './config';
import { Parser } from './expression_parser/parser';
import { Identifiers, resolveIdentifier } from './identifiers';
import { DEFAULT_INTERPOLATION_CONFIG } from './ml_parser/interpolation_config';
import { createClassStmt } from './output/class_builder';
import * as o from './output/output_ast';
import { ParseErrorLevel, ParseLocation, ParseSourceFile, ParseSourceSpan } from './parse_util';
import { Console, LifecycleHooks } from './private_import_core';
import { ElementSchemaRegistry } from './schema/element_schema_registry';
import { BindingParser } from './template_parser/binding_parser';
export var DirectiveWrapperCompileResult = (function () {
    function DirectiveWrapperCompileResult(statements, dirWrapperClassVar) {
        this.statements = statements;
        this.dirWrapperClassVar = dirWrapperClassVar;
    }
    return DirectiveWrapperCompileResult;
}());
var CONTEXT_FIELD_NAME = 'context';
var CHANGES_FIELD_NAME = 'changes';
var CHANGED_FIELD_NAME = 'changed';
var CURR_VALUE_VAR = o.variable('currValue');
var THROW_ON_CHANGE_VAR = o.variable('throwOnChange');
var FORCE_UPDATE_VAR = o.variable('forceUpdate');
var VIEW_VAR = o.variable('view');
var RENDER_EL_VAR = o.variable('el');
var RESET_CHANGES_STMT = o.THIS_EXPR.prop(CHANGES_FIELD_NAME).set(o.literalMap([])).toStmt();
/**
 * We generate directive wrappers to prevent code bloat when a directive is used.
 * A directive wrapper encapsulates
 * the dirty checking for `@Input`, the handling of `@HostListener` / `@HostBinding`
 * and calling the lifecyclehooks `ngOnInit`, `ngOnChanges`, `ngDoCheck`.
 *
 * So far, only `@Input` and the lifecycle hooks have been implemented.
 */
export var DirectiveWrapperCompiler = (function () {
    function DirectiveWrapperCompiler(compilerConfig, _exprParser, _schemaRegistry, _console) {
        this.compilerConfig = compilerConfig;
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._console = _console;
    }
    DirectiveWrapperCompiler.dirWrapperClassName = function (id) { return "Wrapper_" + id.name; };
    DirectiveWrapperCompiler.prototype.compile = function (dirMeta) {
        var builder = new DirectiveWrapperBuilder(this.compilerConfig, dirMeta);
        Object.keys(dirMeta.inputs).forEach(function (inputFieldName) {
            addCheckInputMethod(inputFieldName, builder);
        });
        addDetectChangesInInputPropsMethod(builder);
        var hostParseResult = parseHostBindings(dirMeta, this._exprParser, this._schemaRegistry);
        reportParseErrors(hostParseResult.errors, this._console);
        // host properties are change detected by the DirectiveWrappers,
        // except for the animation properties as they need close integration with animation events
        // and DirectiveWrappers don't support
        // event listeners right now.
        addDetectChangesInHostPropsMethod(hostParseResult.hostProps.filter(function (hostProp) { return !hostProp.isAnimation; }), builder);
        // TODO(tbosch): implement hostListeners via DirectiveWrapper as well!
        var classStmt = builder.build();
        return new DirectiveWrapperCompileResult([classStmt], classStmt.name);
    };
    DirectiveWrapperCompiler.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    DirectiveWrapperCompiler.ctorParameters = [
        { type: CompilerConfig, },
        { type: Parser, },
        { type: ElementSchemaRegistry, },
        { type: Console, },
    ];
    return DirectiveWrapperCompiler;
}());
var DirectiveWrapperBuilder = (function () {
    function DirectiveWrapperBuilder(compilerConfig, dirMeta) {
        this.compilerConfig = compilerConfig;
        this.dirMeta = dirMeta;
        this.fields = [];
        this.getters = [];
        this.methods = [];
        this.ctorStmts = [];
        var dirLifecycleHooks = dirMeta.type.lifecycleHooks;
        this.genChanges = dirLifecycleHooks.indexOf(LifecycleHooks.OnChanges) !== -1 ||
            this.compilerConfig.logBindingUpdate;
        this.ngOnChanges = dirLifecycleHooks.indexOf(LifecycleHooks.OnChanges) !== -1;
        this.ngOnInit = dirLifecycleHooks.indexOf(LifecycleHooks.OnInit) !== -1;
        this.ngDoCheck = dirLifecycleHooks.indexOf(LifecycleHooks.DoCheck) !== -1;
    }
    DirectiveWrapperBuilder.prototype.build = function () {
        var dirDepParamNames = [];
        for (var i = 0; i < this.dirMeta.type.diDeps.length; i++) {
            dirDepParamNames.push("p" + i);
        }
        var fields = [
            new o.ClassField(CONTEXT_FIELD_NAME, o.importType(this.dirMeta.type)),
            new o.ClassField(CHANGED_FIELD_NAME, o.BOOL_TYPE),
        ];
        var ctorStmts = [o.THIS_EXPR.prop(CHANGED_FIELD_NAME).set(o.literal(false)).toStmt()];
        if (this.genChanges) {
            fields.push(new o.ClassField(CHANGES_FIELD_NAME, new o.MapType(o.DYNAMIC_TYPE)));
            ctorStmts.push(RESET_CHANGES_STMT);
        }
        ctorStmts.push(o.THIS_EXPR.prop(CONTEXT_FIELD_NAME)
            .set(o.importExpr(this.dirMeta.type)
            .instantiate(dirDepParamNames.map(function (paramName) { return o.variable(paramName); })))
            .toStmt());
        return createClassStmt({
            name: DirectiveWrapperCompiler.dirWrapperClassName(this.dirMeta.type),
            ctorParams: dirDepParamNames.map(function (paramName) { return new o.FnParam(paramName, o.DYNAMIC_TYPE); }),
            builders: [{ fields: fields, ctorStmts: ctorStmts }, this]
        });
    };
    return DirectiveWrapperBuilder;
}());
function addDetectChangesInInputPropsMethod(builder) {
    var changedVar = o.variable('changed');
    var stmts = [
        changedVar.set(o.THIS_EXPR.prop(CHANGED_FIELD_NAME)).toDeclStmt(),
        o.THIS_EXPR.prop(CHANGED_FIELD_NAME).set(o.literal(false)).toStmt(),
    ];
    var lifecycleStmts = [];
    if (builder.genChanges) {
        var onChangesStmts = [];
        if (builder.ngOnChanges) {
            onChangesStmts.push(o.THIS_EXPR.prop(CONTEXT_FIELD_NAME)
                .callMethod('ngOnChanges', [o.THIS_EXPR.prop(CHANGES_FIELD_NAME)])
                .toStmt());
        }
        if (builder.compilerConfig.logBindingUpdate) {
            onChangesStmts.push(o.importExpr(resolveIdentifier(Identifiers.setBindingDebugInfoForChanges))
                .callFn([VIEW_VAR.prop('renderer'), RENDER_EL_VAR, o.THIS_EXPR.prop(CHANGES_FIELD_NAME)])
                .toStmt());
        }
        onChangesStmts.push(RESET_CHANGES_STMT);
        lifecycleStmts.push(new o.IfStmt(changedVar, onChangesStmts));
    }
    if (builder.ngOnInit) {
        lifecycleStmts.push(new o.IfStmt(VIEW_VAR.prop('numberOfChecks').identical(new o.LiteralExpr(0)), [o.THIS_EXPR.prop(CONTEXT_FIELD_NAME).callMethod('ngOnInit', []).toStmt()]));
    }
    if (builder.ngDoCheck) {
        lifecycleStmts.push(o.THIS_EXPR.prop(CONTEXT_FIELD_NAME).callMethod('ngDoCheck', []).toStmt());
    }
    if (lifecycleStmts.length > 0) {
        stmts.push(new o.IfStmt(o.not(THROW_ON_CHANGE_VAR), lifecycleStmts));
    }
    stmts.push(new o.ReturnStatement(changedVar));
    builder.methods.push(new o.ClassMethod('detectChangesInInputProps', [
        new o.FnParam(VIEW_VAR.name, o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
        new o.FnParam(RENDER_EL_VAR.name, o.DYNAMIC_TYPE),
        new o.FnParam(THROW_ON_CHANGE_VAR.name, o.BOOL_TYPE),
    ], stmts, o.BOOL_TYPE));
}
function addCheckInputMethod(input, builder) {
    var field = createCheckBindingField(builder);
    var onChangeStatements = [
        o.THIS_EXPR.prop(CHANGED_FIELD_NAME).set(o.literal(true)).toStmt(),
        o.THIS_EXPR.prop(CONTEXT_FIELD_NAME).prop(input).set(CURR_VALUE_VAR).toStmt(),
    ];
    if (builder.genChanges) {
        onChangeStatements.push(o.THIS_EXPR.prop(CHANGES_FIELD_NAME)
            .key(o.literal(input))
            .set(o.importExpr(resolveIdentifier(Identifiers.SimpleChange))
            .instantiate([field.expression, CURR_VALUE_VAR]))
            .toStmt());
    }
    var methodBody = createCheckBindingStmt({ currValExpr: CURR_VALUE_VAR, forceUpdate: FORCE_UPDATE_VAR, stmts: [] }, field.expression, THROW_ON_CHANGE_VAR, onChangeStatements);
    builder.methods.push(new o.ClassMethod("check_" + input, [
        new o.FnParam(CURR_VALUE_VAR.name, o.DYNAMIC_TYPE),
        new o.FnParam(THROW_ON_CHANGE_VAR.name, o.BOOL_TYPE),
        new o.FnParam(FORCE_UPDATE_VAR.name, o.BOOL_TYPE),
    ], methodBody));
}
function addDetectChangesInHostPropsMethod(hostProps, builder) {
    var stmts = [];
    var methodParams = [
        new o.FnParam(VIEW_VAR.name, o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
        new o.FnParam(RENDER_EL_VAR.name, o.DYNAMIC_TYPE),
        new o.FnParam(THROW_ON_CHANGE_VAR.name, o.BOOL_TYPE),
    ];
    hostProps.forEach(function (hostProp) {
        var field = createCheckBindingField(builder);
        var evalResult = convertPropertyBinding(builder, null, o.THIS_EXPR.prop(CONTEXT_FIELD_NAME), hostProp.value, field.bindingId);
        if (!evalResult) {
            return;
        }
        var securityContextExpr;
        if (hostProp.needsRuntimeSecurityContext) {
            securityContextExpr = o.variable("secCtx_" + methodParams.length);
            methodParams.push(new o.FnParam(securityContextExpr.name, o.importType(resolveIdentifier(Identifiers.SecurityContext))));
        }
        stmts.push.apply(stmts, createCheckBindingStmt(evalResult, field.expression, THROW_ON_CHANGE_VAR, writeToRenderer(VIEW_VAR, hostProp, RENDER_EL_VAR, evalResult.currValExpr, builder.compilerConfig.logBindingUpdate, securityContextExpr)));
    });
    builder.methods.push(new o.ClassMethod('detectChangesInHostProps', methodParams, stmts));
}
var ParseResult = (function () {
    function ParseResult(hostProps, hostListeners, errors) {
        this.hostProps = hostProps;
        this.hostListeners = hostListeners;
        this.errors = errors;
    }
    return ParseResult;
}());
function parseHostBindings(dirMeta, exprParser, schemaRegistry) {
    var errors = [];
    var parser = new BindingParser(exprParser, DEFAULT_INTERPOLATION_CONFIG, schemaRegistry, [], errors);
    var sourceFileName = dirMeta.type.moduleUrl ?
        "in Directive " + dirMeta.type.name + " in " + dirMeta.type.moduleUrl :
        "in Directive " + dirMeta.type.name;
    var sourceFile = new ParseSourceFile('', sourceFileName);
    var sourceSpan = new ParseSourceSpan(new ParseLocation(sourceFile, null, null, null), new ParseLocation(sourceFile, null, null, null));
    var parsedHostProps = parser.createDirectiveHostPropertyAsts(dirMeta, sourceSpan);
    var parsedHostListeners = parser.createDirectiveHostEventAsts(dirMeta, sourceSpan);
    return new ParseResult(parsedHostProps, parsedHostListeners, errors);
}
function reportParseErrors(parseErrors, console) {
    var warnings = parseErrors.filter(function (error) { return error.level === ParseErrorLevel.WARNING; });
    var errors = parseErrors.filter(function (error) { return error.level === ParseErrorLevel.FATAL; });
    if (warnings.length > 0) {
        this._console.warn("Directive parse warnings:\n" + warnings.join('\n'));
    }
    if (errors.length > 0) {
        throw new Error("Directive parse errors:\n" + errors.join('\n'));
    }
}
//# sourceMappingURL=directive_wrapper_compiler.js.map