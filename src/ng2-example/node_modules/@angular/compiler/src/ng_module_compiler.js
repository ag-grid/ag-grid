/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { CompileDiDependencyMetadata, CompileIdentifierMetadata } from './compile_metadata';
import { createDiTokenExpression } from './compiler_util/identifier_util';
import { isPresent } from './facade/lang';
import { Identifiers, resolveIdentifier, resolveIdentifierToken } from './identifiers';
import { createClassStmt } from './output/class_builder';
import * as o from './output/output_ast';
import { convertValueToOutputAst } from './output/value_util';
import { ParseLocation, ParseSourceFile, ParseSourceSpan } from './parse_util';
import { LifecycleHooks } from './private_import_core';
import { NgModuleProviderAnalyzer } from './provider_analyzer';
export var ComponentFactoryDependency = (function () {
    function ComponentFactoryDependency(comp, placeholder) {
        this.comp = comp;
        this.placeholder = placeholder;
    }
    return ComponentFactoryDependency;
}());
export var NgModuleCompileResult = (function () {
    function NgModuleCompileResult(statements, ngModuleFactoryVar, dependencies) {
        this.statements = statements;
        this.ngModuleFactoryVar = ngModuleFactoryVar;
        this.dependencies = dependencies;
    }
    return NgModuleCompileResult;
}());
export var NgModuleCompiler = (function () {
    function NgModuleCompiler() {
    }
    NgModuleCompiler.prototype.compile = function (ngModuleMeta, extraProviders) {
        var sourceFileName = isPresent(ngModuleMeta.type.moduleUrl) ?
            "in NgModule " + ngModuleMeta.type.name + " in " + ngModuleMeta.type.moduleUrl :
            "in NgModule " + ngModuleMeta.type.name;
        var sourceFile = new ParseSourceFile('', sourceFileName);
        var sourceSpan = new ParseSourceSpan(new ParseLocation(sourceFile, null, null, null), new ParseLocation(sourceFile, null, null, null));
        var deps = [];
        var bootstrapComponentFactories = [];
        var entryComponentFactories = ngModuleMeta.transitiveModule.entryComponents.map(function (entryComponent) {
            var id = new CompileIdentifierMetadata({ name: entryComponent.name });
            if (ngModuleMeta.bootstrapComponents.indexOf(entryComponent) > -1) {
                bootstrapComponentFactories.push(id);
            }
            deps.push(new ComponentFactoryDependency(entryComponent, id));
            return id;
        });
        var builder = new _InjectorBuilder(ngModuleMeta, entryComponentFactories, bootstrapComponentFactories, sourceSpan);
        var providerParser = new NgModuleProviderAnalyzer(ngModuleMeta, extraProviders, sourceSpan);
        providerParser.parse().forEach(function (provider) { return builder.addProvider(provider); });
        var injectorClass = builder.build();
        var ngModuleFactoryVar = ngModuleMeta.type.name + "NgFactory";
        var ngModuleFactoryStmt = o.variable(ngModuleFactoryVar)
            .set(o.importExpr(resolveIdentifier(Identifiers.NgModuleFactory))
            .instantiate([o.variable(injectorClass.name), o.importExpr(ngModuleMeta.type)], o.importType(resolveIdentifier(Identifiers.NgModuleFactory), [o.importType(ngModuleMeta.type)], [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]);
        var stmts = [injectorClass, ngModuleFactoryStmt];
        if (ngModuleMeta.id) {
            var registerFactoryStmt = o.importExpr(resolveIdentifier(Identifiers.RegisterModuleFactoryFn))
                .callFn([o.literal(ngModuleMeta.id), o.variable(ngModuleFactoryVar)])
                .toStmt();
            stmts.push(registerFactoryStmt);
        }
        return new NgModuleCompileResult(stmts, ngModuleFactoryVar, deps);
    };
    NgModuleCompiler.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    NgModuleCompiler.ctorParameters = [];
    return NgModuleCompiler;
}());
var _InjectorBuilder = (function () {
    function _InjectorBuilder(_ngModuleMeta, _entryComponentFactories, _bootstrapComponentFactories, _sourceSpan) {
        this._ngModuleMeta = _ngModuleMeta;
        this._entryComponentFactories = _entryComponentFactories;
        this._bootstrapComponentFactories = _bootstrapComponentFactories;
        this._sourceSpan = _sourceSpan;
        this.fields = [];
        this.getters = [];
        this.methods = [];
        this.ctorStmts = [];
        this._tokens = [];
        this._instances = new Map();
        this._createStmts = [];
        this._destroyStmts = [];
    }
    _InjectorBuilder.prototype.addProvider = function (resolvedProvider) {
        var _this = this;
        var providerValueExpressions = resolvedProvider.providers.map(function (provider) { return _this._getProviderValue(provider); });
        var propName = "_" + resolvedProvider.token.name + "_" + this._instances.size;
        var instance = this._createProviderProperty(propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider, resolvedProvider.eager);
        if (resolvedProvider.lifecycleHooks.indexOf(LifecycleHooks.OnDestroy) !== -1) {
            this._destroyStmts.push(instance.callMethod('ngOnDestroy', []).toStmt());
        }
        this._tokens.push(resolvedProvider.token);
        this._instances.set(resolvedProvider.token.reference, instance);
    };
    _InjectorBuilder.prototype.build = function () {
        var _this = this;
        var getMethodStmts = this._tokens.map(function (token) {
            var providerExpr = _this._instances.get(token.reference);
            return new o.IfStmt(InjectMethodVars.token.identical(createDiTokenExpression(token)), [new o.ReturnStatement(providerExpr)]);
        });
        var methods = [
            new o.ClassMethod('createInternal', [], this._createStmts.concat(new o.ReturnStatement(this._instances.get(this._ngModuleMeta.type.reference))), o.importType(this._ngModuleMeta.type)),
            new o.ClassMethod('getInternal', [
                new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
                new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
            ], getMethodStmts.concat([new o.ReturnStatement(InjectMethodVars.notFoundResult)]), o.DYNAMIC_TYPE),
            new o.ClassMethod('destroyInternal', [], this._destroyStmts),
        ];
        var parentArgs = [
            o.variable(InjectorProps.parent.name),
            o.literalArr(this._entryComponentFactories.map(function (componentFactory) { return o.importExpr(componentFactory); })),
            o.literalArr(this._bootstrapComponentFactories.map(function (componentFactory) { return o.importExpr(componentFactory); }))
        ];
        var injClassName = this._ngModuleMeta.type.name + "Injector";
        return createClassStmt({
            name: injClassName,
            ctorParams: [new o.FnParam(InjectorProps.parent.name, o.importType(resolveIdentifier(Identifiers.Injector)))],
            parent: o.importExpr(resolveIdentifier(Identifiers.NgModuleInjector), [o.importType(this._ngModuleMeta.type)]),
            parentArgs: parentArgs,
            builders: [{ methods: methods }, this]
        });
    };
    _InjectorBuilder.prototype._getProviderValue = function (provider) {
        var _this = this;
        var result;
        if (isPresent(provider.useExisting)) {
            result = this._getDependency(new CompileDiDependencyMetadata({ token: provider.useExisting }));
        }
        else if (isPresent(provider.useFactory)) {
            var deps = provider.deps || provider.useFactory.diDeps;
            var depsExpr = deps.map(function (dep) { return _this._getDependency(dep); });
            result = o.importExpr(provider.useFactory).callFn(depsExpr);
        }
        else if (isPresent(provider.useClass)) {
            var deps = provider.deps || provider.useClass.diDeps;
            var depsExpr = deps.map(function (dep) { return _this._getDependency(dep); });
            result =
                o.importExpr(provider.useClass).instantiate(depsExpr, o.importType(provider.useClass));
        }
        else {
            result = convertValueToOutputAst(provider.useValue);
        }
        return result;
    };
    _InjectorBuilder.prototype._createProviderProperty = function (propName, provider, providerValueExpressions, isMulti, isEager) {
        var resolvedProviderValueExpr;
        var type;
        if (isMulti) {
            resolvedProviderValueExpr = o.literalArr(providerValueExpressions);
            type = new o.ArrayType(o.DYNAMIC_TYPE);
        }
        else {
            resolvedProviderValueExpr = providerValueExpressions[0];
            type = providerValueExpressions[0].type;
        }
        if (!type) {
            type = o.DYNAMIC_TYPE;
        }
        if (isEager) {
            this.fields.push(new o.ClassField(propName, type));
            this._createStmts.push(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
        }
        else {
            var internalField = "_" + propName;
            this.fields.push(new o.ClassField(internalField, type));
            // Note: Equals is important for JS so that it also checks the undefined case!
            var getterStmts = [
                new o.IfStmt(o.THIS_EXPR.prop(internalField).isBlank(), [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]),
                new o.ReturnStatement(o.THIS_EXPR.prop(internalField))
            ];
            this.getters.push(new o.ClassGetter(propName, getterStmts, type));
        }
        return o.THIS_EXPR.prop(propName);
    };
    _InjectorBuilder.prototype._getDependency = function (dep) {
        var result = null;
        if (dep.isValue) {
            result = o.literal(dep.value);
        }
        if (!dep.isSkipSelf) {
            if (dep.token &&
                (dep.token.reference === resolveIdentifierToken(Identifiers.Injector).reference ||
                    dep.token.reference ===
                        resolveIdentifierToken(Identifiers.ComponentFactoryResolver).reference)) {
                result = o.THIS_EXPR;
            }
            if (!result) {
                result = this._instances.get(dep.token.reference);
            }
        }
        if (!result) {
            var args = [createDiTokenExpression(dep.token)];
            if (dep.isOptional) {
                args.push(o.NULL_EXPR);
            }
            result = InjectorProps.parent.callMethod('get', args);
        }
        return result;
    };
    return _InjectorBuilder;
}());
var InjectorProps = (function () {
    function InjectorProps() {
    }
    InjectorProps.parent = o.THIS_EXPR.prop('parent');
    return InjectorProps;
}());
var InjectMethodVars = (function () {
    function InjectMethodVars() {
    }
    InjectMethodVars.token = o.variable('token');
    InjectMethodVars.notFoundResult = o.variable('notFoundResult');
    return InjectMethodVars;
}());
//# sourceMappingURL=ng_module_compiler.js.map