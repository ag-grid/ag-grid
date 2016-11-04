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
import { CompileDiDependencyMetadata, CompileIdentifierMetadata, CompileProviderMetadata, CompileTokenMetadata } from '../compile_metadata';
import { createDiTokenExpression } from '../compiler_util/identifier_util';
import { DirectiveWrapperCompiler } from '../directive_wrapper_compiler';
import { MapWrapper } from '../facade/collection';
import { isPresent } from '../facade/lang';
import { Identifiers, identifierToken, resolveIdentifier, resolveIdentifierToken } from '../identifiers';
import * as o from '../output/output_ast';
import { convertValueToOutputAst } from '../output/value_util';
import { ProviderAst, ProviderAstType } from '../template_parser/template_ast';
import { CompileMethod } from './compile_method';
import { CompileQuery, addQueryToTokenMap, createQueryList } from './compile_query';
import { InjectMethodVars } from './constants';
import { ComponentFactoryDependency, DirectiveWrapperDependency } from './deps';
import { getPropertyInView, injectFromViewParentInjector } from './util';
export var CompileNode = (function () {
    function CompileNode(parent, view, nodeIndex, renderNode, sourceAst) {
        this.parent = parent;
        this.view = view;
        this.nodeIndex = nodeIndex;
        this.renderNode = renderNode;
        this.sourceAst = sourceAst;
    }
    CompileNode.prototype.isNull = function () { return !this.renderNode; };
    CompileNode.prototype.isRootElement = function () { return this.view != this.parent.view; };
    return CompileNode;
}());
export var CompileElement = (function (_super) {
    __extends(CompileElement, _super);
    function CompileElement(parent, view, nodeIndex, renderNode, sourceAst, component, _directives, _resolvedProvidersArray, hasViewContainer, hasEmbeddedView, references, _targetDependencies) {
        var _this = this;
        _super.call(this, parent, view, nodeIndex, renderNode, sourceAst);
        this.component = component;
        this._directives = _directives;
        this._resolvedProvidersArray = _resolvedProvidersArray;
        this.hasViewContainer = hasViewContainer;
        this.hasEmbeddedView = hasEmbeddedView;
        this._targetDependencies = _targetDependencies;
        this._compViewExpr = null;
        this.instances = new Map();
        this.directiveWrapperInstance = new Map();
        this._queryCount = 0;
        this._queries = new Map();
        this._componentConstructorViewQueryLists = [];
        this.contentNodesByNgContentIndex = null;
        this.referenceTokens = {};
        references.forEach(function (ref) { return _this.referenceTokens[ref.name] = ref.value; });
        this.elementRef =
            o.importExpr(resolveIdentifier(Identifiers.ElementRef)).instantiate([this.renderNode]);
        this.instances.set(resolveIdentifierToken(Identifiers.ElementRef).reference, this.elementRef);
        this.injector = o.THIS_EXPR.callMethod('injector', [o.literal(this.nodeIndex)]);
        this.instances.set(resolveIdentifierToken(Identifiers.Injector).reference, this.injector);
        this.instances.set(resolveIdentifierToken(Identifiers.Renderer).reference, o.THIS_EXPR.prop('renderer'));
        if (this.hasViewContainer || this.hasEmbeddedView || isPresent(this.component)) {
            this._createAppElement();
        }
        if (this.component) {
            this._createComponentFactoryResolver();
        }
    }
    CompileElement.createNull = function () {
        return new CompileElement(null, null, null, null, null, null, [], [], false, false, [], []);
    };
    CompileElement.prototype._createAppElement = function () {
        var fieldName = "_appEl_" + this.nodeIndex;
        var parentNodeIndex = this.isRootElement() ? null : this.parent.nodeIndex;
        // private is fine here as no child view will reference an AppElement
        this.view.fields.push(new o.ClassField(fieldName, o.importType(resolveIdentifier(Identifiers.AppElement)), [o.StmtModifier.Private]));
        var statement = o.THIS_EXPR.prop(fieldName)
            .set(o.importExpr(resolveIdentifier(Identifiers.AppElement)).instantiate([
            o.literal(this.nodeIndex), o.literal(parentNodeIndex), o.THIS_EXPR, this.renderNode
        ]))
            .toStmt();
        this.view.createMethod.addStmt(statement);
        this.appElement = o.THIS_EXPR.prop(fieldName);
        this.instances.set(resolveIdentifierToken(Identifiers.AppElement).reference, this.appElement);
    };
    CompileElement.prototype._createComponentFactoryResolver = function () {
        var _this = this;
        var entryComponents = this.component.entryComponents.map(function (entryComponent) {
            var id = new CompileIdentifierMetadata({ name: entryComponent.name });
            _this._targetDependencies.push(new ComponentFactoryDependency(entryComponent, id));
            return id;
        });
        if (!entryComponents || entryComponents.length === 0) {
            return;
        }
        var createComponentFactoryResolverExpr = o.importExpr(resolveIdentifier(Identifiers.CodegenComponentFactoryResolver)).instantiate([
            o.literalArr(entryComponents.map(function (entryComponent) { return o.importExpr(entryComponent); })),
            injectFromViewParentInjector(resolveIdentifierToken(Identifiers.ComponentFactoryResolver), false)
        ]);
        var provider = new CompileProviderMetadata({
            token: resolveIdentifierToken(Identifiers.ComponentFactoryResolver),
            useValue: createComponentFactoryResolverExpr
        });
        // Add ComponentFactoryResolver as first provider as it does not have deps on other providers
        // ProviderAstType.PrivateService as only the component and its view can see it,
        // but nobody else
        this._resolvedProvidersArray.unshift(new ProviderAst(provider.token, false, true, [provider], ProviderAstType.PrivateService, [], this.sourceAst.sourceSpan));
    };
    CompileElement.prototype.setComponentView = function (compViewExpr) {
        this._compViewExpr = compViewExpr;
        this.contentNodesByNgContentIndex =
            new Array(this.component.template.ngContentSelectors.length);
        for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
            this.contentNodesByNgContentIndex[i] = [];
        }
    };
    CompileElement.prototype.setEmbeddedView = function (embeddedView) {
        this.embeddedView = embeddedView;
        if (isPresent(embeddedView)) {
            var createTemplateRefExpr = o.importExpr(resolveIdentifier(Identifiers.TemplateRef_)).instantiate([
                this.appElement, this.embeddedView.viewFactory
            ]);
            var provider = new CompileProviderMetadata({
                token: resolveIdentifierToken(Identifiers.TemplateRef),
                useValue: createTemplateRefExpr
            });
            // Add TemplateRef as first provider as it does not have deps on other providers
            this._resolvedProvidersArray.unshift(new ProviderAst(provider.token, false, true, [provider], ProviderAstType.Builtin, [], this.sourceAst.sourceSpan));
        }
    };
    CompileElement.prototype.beforeChildren = function () {
        var _this = this;
        if (this.hasViewContainer) {
            this.instances.set(resolveIdentifierToken(Identifiers.ViewContainerRef).reference, this.appElement.prop('vcRef'));
        }
        this._resolvedProviders = new Map();
        this._resolvedProvidersArray.forEach(function (provider) { return _this._resolvedProviders.set(provider.token.reference, provider); });
        // create all the provider instances, some in the view constructor,
        // some as getters. We rely on the fact that they are already sorted topologically.
        MapWrapper.values(this._resolvedProviders).forEach(function (resolvedProvider) {
            var isDirectiveWrapper = resolvedProvider.providerType === ProviderAstType.Component ||
                resolvedProvider.providerType === ProviderAstType.Directive;
            var providerValueExpressions = resolvedProvider.providers.map(function (provider) {
                if (isPresent(provider.useExisting)) {
                    return _this._getDependency(resolvedProvider.providerType, new CompileDiDependencyMetadata({ token: provider.useExisting }));
                }
                else if (isPresent(provider.useFactory)) {
                    var deps = provider.deps || provider.useFactory.diDeps;
                    var depsExpr = deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep); });
                    return o.importExpr(provider.useFactory).callFn(depsExpr);
                }
                else if (isPresent(provider.useClass)) {
                    var deps = provider.deps || provider.useClass.diDeps;
                    var depsExpr = deps.map(function (dep) { return _this._getDependency(resolvedProvider.providerType, dep); });
                    if (isDirectiveWrapper) {
                        var directiveWrapperIdentifier = new CompileIdentifierMetadata({ name: DirectiveWrapperCompiler.dirWrapperClassName(provider.useClass) });
                        _this._targetDependencies.push(new DirectiveWrapperDependency(provider.useClass, directiveWrapperIdentifier));
                        return o.importExpr(directiveWrapperIdentifier)
                            .instantiate(depsExpr, o.importType(directiveWrapperIdentifier));
                    }
                    else {
                        return o.importExpr(provider.useClass)
                            .instantiate(depsExpr, o.importType(provider.useClass));
                    }
                }
                else {
                    return convertValueToOutputAst(provider.useValue);
                }
            });
            var propName = "_" + resolvedProvider.token.name + "_" + _this.nodeIndex + "_" + _this.instances.size;
            var instance = createProviderProperty(propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider, resolvedProvider.eager, _this);
            if (isDirectiveWrapper) {
                _this.directiveWrapperInstance.set(resolvedProvider.token.reference, instance);
                _this.instances.set(resolvedProvider.token.reference, instance.prop('context'));
            }
            else {
                _this.instances.set(resolvedProvider.token.reference, instance);
            }
        });
        for (var i = 0; i < this._directives.length; i++) {
            var directive = this._directives[i];
            var directiveInstance = this.instances.get(identifierToken(directive.type).reference);
            directive.queries.forEach(function (queryMeta) { _this._addQuery(queryMeta, directiveInstance); });
        }
        var queriesWithReads = [];
        MapWrapper.values(this._resolvedProviders).forEach(function (resolvedProvider) {
            var queriesForProvider = _this._getQueriesFor(resolvedProvider.token);
            queriesWithReads.push.apply(queriesWithReads, queriesForProvider.map(function (query) { return new _QueryWithRead(query, resolvedProvider.token); }));
        });
        Object.keys(this.referenceTokens).forEach(function (varName) {
            var token = _this.referenceTokens[varName];
            var varValue;
            if (isPresent(token)) {
                varValue = _this.instances.get(token.reference);
            }
            else {
                varValue = _this.renderNode;
            }
            _this.view.locals.set(varName, varValue);
            var varToken = new CompileTokenMetadata({ value: varName });
            queriesWithReads.push.apply(queriesWithReads, _this._getQueriesFor(varToken).map(function (query) { return new _QueryWithRead(query, varToken); }));
        });
        queriesWithReads.forEach(function (queryWithRead) {
            var value;
            if (isPresent(queryWithRead.read.identifier)) {
                // query for an identifier
                value = _this.instances.get(queryWithRead.read.reference);
            }
            else {
                // query for a reference
                var token = _this.referenceTokens[queryWithRead.read.value];
                if (isPresent(token)) {
                    value = _this.instances.get(token.reference);
                }
                else {
                    value = _this.elementRef;
                }
            }
            if (isPresent(value)) {
                queryWithRead.query.addValue(value, _this.view);
            }
        });
        if (isPresent(this.component)) {
            var componentConstructorViewQueryList = isPresent(this.component) ?
                o.literalArr(this._componentConstructorViewQueryLists) :
                o.NULL_EXPR;
            var compExpr = isPresent(this.getComponent()) ? this.getComponent() : o.NULL_EXPR;
            this.view.createMethod.addStmt(this.appElement
                .callMethod('initComponent', [compExpr, componentConstructorViewQueryList, this._compViewExpr])
                .toStmt());
        }
    };
    CompileElement.prototype.afterChildren = function (childNodeCount) {
        var _this = this;
        MapWrapper.values(this._resolvedProviders).forEach(function (resolvedProvider) {
            // Note: afterChildren is called after recursing into children.
            // This is good so that an injector match in an element that is closer to a requesting element
            // matches first.
            var providerExpr = _this.instances.get(resolvedProvider.token.reference);
            // Note: view providers are only visible on the injector of that element.
            // This is not fully correct as the rules during codegen don't allow a directive
            // to get hold of a view provdier on the same element. We still do this semantic
            // as it simplifies our model to having only one runtime injector per element.
            var providerChildNodeCount = resolvedProvider.providerType === ProviderAstType.PrivateService ? 0 : childNodeCount;
            _this.view.injectorGetMethod.addStmt(createInjectInternalCondition(_this.nodeIndex, providerChildNodeCount, resolvedProvider, providerExpr));
        });
        MapWrapper.values(this._queries)
            .forEach(function (queries) { return queries.forEach(function (query) { return query.afterChildren(_this.view.createMethod, _this.view.updateContentQueriesMethod); }); });
    };
    CompileElement.prototype.addContentNode = function (ngContentIndex, nodeExpr) {
        this.contentNodesByNgContentIndex[ngContentIndex].push(nodeExpr);
    };
    CompileElement.prototype.getComponent = function () {
        return isPresent(this.component) ?
            this.instances.get(identifierToken(this.component.type).reference) :
            null;
    };
    CompileElement.prototype.getProviderTokens = function () {
        return MapWrapper.values(this._resolvedProviders)
            .map(function (resolvedProvider) { return createDiTokenExpression(resolvedProvider.token); });
    };
    CompileElement.prototype._getQueriesFor = function (token) {
        var result = [];
        var currentEl = this;
        var distance = 0;
        var queries;
        while (!currentEl.isNull()) {
            queries = currentEl._queries.get(token.reference);
            if (isPresent(queries)) {
                result.push.apply(result, queries.filter(function (query) { return query.meta.descendants || distance <= 1; }));
            }
            if (currentEl._directives.length > 0) {
                distance++;
            }
            currentEl = currentEl.parent;
        }
        queries = this.view.componentView.viewQueries.get(token.reference);
        if (isPresent(queries)) {
            result.push.apply(result, queries);
        }
        return result;
    };
    CompileElement.prototype._addQuery = function (queryMeta, directiveInstance) {
        var propName = "_query_" + queryMeta.selectors[0].name + "_" + this.nodeIndex + "_" + this._queryCount++;
        var queryList = createQueryList(queryMeta, directiveInstance, propName, this.view);
        var query = new CompileQuery(queryMeta, queryList, directiveInstance, this.view);
        addQueryToTokenMap(this._queries, query);
        return query;
    };
    CompileElement.prototype._getLocalDependency = function (requestingProviderType, dep) {
        var result = null;
        // constructor content query
        if (!result && isPresent(dep.query)) {
            result = this._addQuery(dep.query, null).queryList;
        }
        // constructor view query
        if (!result && isPresent(dep.viewQuery)) {
            result = createQueryList(dep.viewQuery, null, "_viewQuery_" + dep.viewQuery.selectors[0].name + "_" + this.nodeIndex + "_" + this._componentConstructorViewQueryLists.length, this.view);
            this._componentConstructorViewQueryLists.push(result);
        }
        if (isPresent(dep.token)) {
            // access builtins with special visibility
            if (!result) {
                if (dep.token.reference ===
                    resolveIdentifierToken(Identifiers.ChangeDetectorRef).reference) {
                    if (requestingProviderType === ProviderAstType.Component) {
                        return this._compViewExpr.prop('ref');
                    }
                    else {
                        return getPropertyInView(o.THIS_EXPR.prop('ref'), this.view, this.view.componentView);
                    }
                }
            }
            // access regular providers on the element
            if (!result) {
                var resolvedProvider = this._resolvedProviders.get(dep.token.reference);
                // don't allow directives / public services to access private services.
                // only components and private services can access private services.
                if (resolvedProvider && (requestingProviderType === ProviderAstType.Directive ||
                    requestingProviderType === ProviderAstType.PublicService) &&
                    resolvedProvider.providerType === ProviderAstType.PrivateService) {
                    return null;
                }
                result = this.instances.get(dep.token.reference);
            }
        }
        return result;
    };
    CompileElement.prototype._getDependency = function (requestingProviderType, dep) {
        var currElement = this;
        var result = null;
        if (dep.isValue) {
            result = o.literal(dep.value);
        }
        if (!result && !dep.isSkipSelf) {
            result = this._getLocalDependency(requestingProviderType, dep);
        }
        // check parent elements
        while (!result && !currElement.parent.isNull()) {
            currElement = currElement.parent;
            result = currElement._getLocalDependency(ProviderAstType.PublicService, new CompileDiDependencyMetadata({ token: dep.token }));
        }
        if (!result) {
            result = injectFromViewParentInjector(dep.token, dep.isOptional);
        }
        if (!result) {
            result = o.NULL_EXPR;
        }
        return getPropertyInView(result, this.view, currElement.view);
    };
    return CompileElement;
}(CompileNode));
function createInjectInternalCondition(nodeIndex, childNodeCount, provider, providerExpr) {
    var indexCondition;
    if (childNodeCount > 0) {
        indexCondition = o.literal(nodeIndex)
            .lowerEquals(InjectMethodVars.requestNodeIndex)
            .and(InjectMethodVars.requestNodeIndex.lowerEquals(o.literal(nodeIndex + childNodeCount)));
    }
    else {
        indexCondition = o.literal(nodeIndex).identical(InjectMethodVars.requestNodeIndex);
    }
    return new o.IfStmt(InjectMethodVars.token.identical(createDiTokenExpression(provider.token)).and(indexCondition), [new o.ReturnStatement(providerExpr)]);
}
function createProviderProperty(propName, provider, providerValueExpressions, isMulti, isEager, compileElement) {
    var view = compileElement.view;
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
        view.fields.push(new o.ClassField(propName, type));
        view.createMethod.addStmt(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
    }
    else {
        var internalField = "_" + propName;
        view.fields.push(new o.ClassField(internalField, type));
        var getter = new CompileMethod(view);
        getter.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
        // Note: Equals is important for JS so that it also checks the undefined case!
        getter.addStmt(new o.IfStmt(o.THIS_EXPR.prop(internalField).isBlank(), [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]));
        getter.addStmt(new o.ReturnStatement(o.THIS_EXPR.prop(internalField)));
        view.getters.push(new o.ClassGetter(propName, getter.finish(), type));
    }
    return o.THIS_EXPR.prop(propName);
}
var _QueryWithRead = (function () {
    function _QueryWithRead(query, match) {
        this.query = query;
        this.read = query.meta.read || match;
    }
    return _QueryWithRead;
}());
//# sourceMappingURL=compile_element.js.map