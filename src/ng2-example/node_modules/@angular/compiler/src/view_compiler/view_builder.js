/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ViewEncapsulation } from '@angular/core';
import { CompileIdentifierMetadata } from '../compile_metadata';
import { createSharedBindingVariablesIfNeeded } from '../compiler_util/expression_converter';
import { createDiTokenExpression, createInlineArray } from '../compiler_util/identifier_util';
import { isPresent } from '../facade/lang';
import { Identifiers, identifierToken, resolveIdentifier } from '../identifiers';
import { createClassStmt } from '../output/class_builder';
import * as o from '../output/output_ast';
import { ChangeDetectorStatus, ViewType, isDefaultChangeDetectionStrategy } from '../private_import_core';
import { templateVisitAll } from '../template_parser/template_ast';
import { CompileElement, CompileNode } from './compile_element';
import { CompileView } from './compile_view';
import { ChangeDetectorStatusEnum, DetectChangesVars, InjectMethodVars, ViewConstructorVars, ViewEncapsulationEnum, ViewProperties, ViewTypeEnum } from './constants';
import { ViewFactoryDependency } from './deps';
import { createFlatArray, getViewFactoryName } from './util';
var IMPLICIT_TEMPLATE_VAR = '\$implicit';
var CLASS_ATTR = 'class';
var STYLE_ATTR = 'style';
var NG_CONTAINER_TAG = 'ng-container';
var parentRenderNodeVar = o.variable('parentRenderNode');
var rootSelectorVar = o.variable('rootSelector');
export function buildView(view, template, targetDependencies) {
    var builderVisitor = new ViewBuilderVisitor(view, targetDependencies);
    templateVisitAll(builderVisitor, template, view.declarationElement.isNull() ? view.declarationElement : view.declarationElement.parent);
    return builderVisitor.nestedViewCount;
}
export function finishView(view, targetStatements) {
    view.afterNodes();
    createViewTopLevelStmts(view, targetStatements);
    view.nodes.forEach(function (node) {
        if (node instanceof CompileElement && node.hasEmbeddedView) {
            finishView(node.embeddedView, targetStatements);
        }
    });
}
var ViewBuilderVisitor = (function () {
    function ViewBuilderVisitor(view, targetDependencies) {
        this.view = view;
        this.targetDependencies = targetDependencies;
        this.nestedViewCount = 0;
    }
    ViewBuilderVisitor.prototype._isRootNode = function (parent) { return parent.view !== this.view; };
    ViewBuilderVisitor.prototype._addRootNodeAndProject = function (node) {
        var projectedNode = _getOuterContainerOrSelf(node);
        var parent = projectedNode.parent;
        var ngContentIndex = projectedNode.sourceAst.ngContentIndex;
        var vcAppEl = (node instanceof CompileElement && node.hasViewContainer) ? node.appElement : null;
        if (this._isRootNode(parent)) {
            // store appElement as root node only for ViewContainers
            if (this.view.viewType !== ViewType.COMPONENT) {
                this.view.rootNodesOrAppElements.push(vcAppEl || node.renderNode);
            }
        }
        else if (isPresent(parent.component) && isPresent(ngContentIndex)) {
            parent.addContentNode(ngContentIndex, vcAppEl || node.renderNode);
        }
    };
    ViewBuilderVisitor.prototype._getParentRenderNode = function (parent) {
        parent = _getOuterContainerParentOrSelf(parent);
        if (this._isRootNode(parent)) {
            if (this.view.viewType === ViewType.COMPONENT) {
                return parentRenderNodeVar;
            }
            else {
                // root node of an embedded/host view
                return o.NULL_EXPR;
            }
        }
        else {
            return isPresent(parent.component) &&
                parent.component.template.encapsulation !== ViewEncapsulation.Native ?
                o.NULL_EXPR :
                parent.renderNode;
        }
    };
    ViewBuilderVisitor.prototype.visitBoundText = function (ast, parent) {
        return this._visitText(ast, '', parent);
    };
    ViewBuilderVisitor.prototype.visitText = function (ast, parent) {
        return this._visitText(ast, ast.value, parent);
    };
    ViewBuilderVisitor.prototype._visitText = function (ast, value, parent) {
        var fieldName = "_text_" + this.view.nodes.length;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderText)));
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var compileNode = new CompileNode(parent, this.view, this.view.nodes.length, renderNode, ast);
        var createRenderNode = o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod('createText', [
            this._getParentRenderNode(parent), o.literal(value),
            this.view.createMethod.resetDebugInfoExpr(this.view.nodes.length, ast)
        ]))
            .toStmt();
        this.view.nodes.push(compileNode);
        this.view.createMethod.addStmt(createRenderNode);
        this._addRootNodeAndProject(compileNode);
        return renderNode;
    };
    ViewBuilderVisitor.prototype.visitNgContent = function (ast, parent) {
        // the projected nodes originate from a different view, so we don't
        // have debug information for them...
        this.view.createMethod.resetDebugInfo(null, ast);
        var parentRenderNode = this._getParentRenderNode(parent);
        var nodesExpression = ViewProperties.projectableNodes.key(o.literal(ast.index), new o.ArrayType(o.importType(this.view.genConfig.renderTypes.renderNode)));
        if (parentRenderNode !== o.NULL_EXPR) {
            this.view.createMethod.addStmt(ViewProperties.renderer
                .callMethod('projectNodes', [
                parentRenderNode,
                o.importExpr(resolveIdentifier(Identifiers.flattenNestedViewRenderNodes))
                    .callFn([nodesExpression])
            ])
                .toStmt());
        }
        else if (this._isRootNode(parent)) {
            if (this.view.viewType !== ViewType.COMPONENT) {
                // store root nodes only for embedded/host views
                this.view.rootNodesOrAppElements.push(nodesExpression);
            }
        }
        else {
            if (isPresent(parent.component) && isPresent(ast.ngContentIndex)) {
                parent.addContentNode(ast.ngContentIndex, nodesExpression);
            }
        }
        return null;
    };
    ViewBuilderVisitor.prototype.visitElement = function (ast, parent) {
        var nodeIndex = this.view.nodes.length;
        var createRenderNodeExpr;
        var debugContextExpr = this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast);
        var directives = ast.directives.map(function (directiveAst) { return directiveAst.directive; });
        var component = directives.find(function (directive) { return directive.isComponent; });
        if (ast.name === NG_CONTAINER_TAG) {
            createRenderNodeExpr = ViewProperties.renderer.callMethod('createTemplateAnchor', [this._getParentRenderNode(parent), debugContextExpr]);
        }
        else {
            var htmlAttrs = _readHtmlAttrs(ast.attrs);
            var attrNameAndValues = createInlineArray(_mergeHtmlAndDirectiveAttrs(htmlAttrs, directives).map(function (v) { return o.literal(v); }));
            if (nodeIndex === 0 && this.view.viewType === ViewType.HOST) {
                createRenderNodeExpr =
                    o.importExpr(resolveIdentifier(Identifiers.selectOrCreateRenderHostElement)).callFn([
                        ViewProperties.renderer, o.literal(ast.name), attrNameAndValues, rootSelectorVar,
                        debugContextExpr
                    ]);
            }
            else {
                createRenderNodeExpr =
                    o.importExpr(resolveIdentifier(Identifiers.createRenderElement)).callFn([
                        ViewProperties.renderer, this._getParentRenderNode(parent), o.literal(ast.name),
                        attrNameAndValues, debugContextExpr
                    ]);
            }
        }
        var fieldName = "_el_" + nodeIndex;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderElement)));
        this.view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName).set(createRenderNodeExpr).toStmt());
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, component, directives, ast.providers, ast.hasViewContainer, false, ast.references, this.targetDependencies);
        this.view.nodes.push(compileElement);
        var compViewExpr = null;
        if (isPresent(component)) {
            var nestedComponentIdentifier = new CompileIdentifierMetadata({ name: getViewFactoryName(component, 0) });
            this.targetDependencies.push(new ViewFactoryDependency(component.type, nestedComponentIdentifier));
            compViewExpr = o.variable("compView_" + nodeIndex); // fix highlighting: `
            compileElement.setComponentView(compViewExpr);
            this.view.createMethod.addStmt(compViewExpr
                .set(o.importExpr(nestedComponentIdentifier).callFn([
                ViewProperties.viewUtils, compileElement.injector, compileElement.appElement
            ]))
                .toDeclStmt());
        }
        compileElement.beforeChildren();
        this._addRootNodeAndProject(compileElement);
        templateVisitAll(this, ast.children, compileElement);
        compileElement.afterChildren(this.view.nodes.length - nodeIndex - 1);
        if (isPresent(compViewExpr)) {
            var codeGenContentNodes;
            if (this.view.component.type.isHost) {
                codeGenContentNodes = ViewProperties.projectableNodes;
            }
            else {
                codeGenContentNodes = o.literalArr(compileElement.contentNodesByNgContentIndex.map(function (nodes) { return createFlatArray(nodes); }));
            }
            this.view.createMethod.addStmt(compViewExpr
                .callMethod('create', [compileElement.getComponent(), codeGenContentNodes, o.NULL_EXPR])
                .toStmt());
        }
        return null;
    };
    ViewBuilderVisitor.prototype.visitEmbeddedTemplate = function (ast, parent) {
        var nodeIndex = this.view.nodes.length;
        var fieldName = "_anchor_" + nodeIndex;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderComment)));
        this.view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod('createTemplateAnchor', [
            this._getParentRenderNode(parent),
            this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast)
        ]))
            .toStmt());
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var templateVariableBindings = ast.variables.map(function (varAst) { return [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]; });
        var directives = ast.directives.map(function (directiveAst) { return directiveAst.directive; });
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, null, directives, ast.providers, ast.hasViewContainer, true, ast.references, this.targetDependencies);
        this.view.nodes.push(compileElement);
        this.nestedViewCount++;
        var embeddedView = new CompileView(this.view.component, this.view.genConfig, this.view.pipeMetas, o.NULL_EXPR, this.view.animations, this.view.viewIndex + this.nestedViewCount, compileElement, templateVariableBindings);
        this.nestedViewCount += buildView(embeddedView, ast.children, this.targetDependencies);
        compileElement.beforeChildren();
        this._addRootNodeAndProject(compileElement);
        compileElement.afterChildren(0);
        return null;
    };
    ViewBuilderVisitor.prototype.visitAttr = function (ast, ctx) { return null; };
    ViewBuilderVisitor.prototype.visitDirective = function (ast, ctx) { return null; };
    ViewBuilderVisitor.prototype.visitEvent = function (ast, eventTargetAndNames) {
        return null;
    };
    ViewBuilderVisitor.prototype.visitReference = function (ast, ctx) { return null; };
    ViewBuilderVisitor.prototype.visitVariable = function (ast, ctx) { return null; };
    ViewBuilderVisitor.prototype.visitDirectiveProperty = function (ast, context) { return null; };
    ViewBuilderVisitor.prototype.visitElementProperty = function (ast, context) { return null; };
    return ViewBuilderVisitor;
}());
/**
 * Walks up the nodes while the direct parent is a container.
 *
 * Returns the outer container or the node itself when it is not a direct child of a container.
 *
 * @internal
 */
function _getOuterContainerOrSelf(node) {
    var view = node.view;
    while (_isNgContainer(node.parent, view)) {
        node = node.parent;
    }
    return node;
}
/**
 * Walks up the nodes while they are container and returns the first parent which is not.
 *
 * Returns the parent of the outer container or the node itself when it is not a container.
 *
 * @internal
 */
function _getOuterContainerParentOrSelf(el) {
    var view = el.view;
    while (_isNgContainer(el, view)) {
        el = el.parent;
    }
    return el;
}
function _isNgContainer(node, view) {
    return !node.isNull() && node.sourceAst.name === NG_CONTAINER_TAG &&
        node.view === view;
}
function _mergeHtmlAndDirectiveAttrs(declaredHtmlAttrs, directives) {
    var mapResult = {};
    Object.keys(declaredHtmlAttrs).forEach(function (key) { mapResult[key] = declaredHtmlAttrs[key]; });
    directives.forEach(function (directiveMeta) {
        Object.keys(directiveMeta.hostAttributes).forEach(function (name) {
            var value = directiveMeta.hostAttributes[name];
            var prevValue = mapResult[name];
            mapResult[name] = isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
        });
    });
    var arrResult = [];
    // Note: We need to sort to get a defined output order
    // for tests and for caching generated artifacts...
    Object.keys(mapResult).sort().forEach(function (attrName) { arrResult.push(attrName, mapResult[attrName]); });
    return arrResult;
}
function _readHtmlAttrs(attrs) {
    var htmlAttrs = {};
    attrs.forEach(function (ast) { htmlAttrs[ast.name] = ast.value; });
    return htmlAttrs;
}
function mergeAttributeValue(attrName, attrValue1, attrValue2) {
    if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
        return attrValue1 + " " + attrValue2;
    }
    else {
        return attrValue2;
    }
}
function createViewTopLevelStmts(view, targetStatements) {
    var nodeDebugInfosVar = o.NULL_EXPR;
    if (view.genConfig.genDebugInfo) {
        nodeDebugInfosVar = o.variable("nodeDebugInfos_" + view.component.type.name + view.viewIndex); // fix highlighting: `
        targetStatements.push(nodeDebugInfosVar
            .set(o.literalArr(view.nodes.map(createStaticNodeDebugInfo), new o.ArrayType(new o.ExternalType(resolveIdentifier(Identifiers.StaticNodeDebugInfo)), [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    }
    var renderCompTypeVar = o.variable("renderType_" + view.component.type.name); // fix highlighting: `
    if (view.viewIndex === 0) {
        targetStatements.push(renderCompTypeVar.set(o.NULL_EXPR)
            .toDeclStmt(o.importType(resolveIdentifier(Identifiers.RenderComponentType))));
    }
    var viewClass = createViewClass(view, renderCompTypeVar, nodeDebugInfosVar);
    targetStatements.push(viewClass);
    targetStatements.push(createViewFactory(view, viewClass, renderCompTypeVar));
}
function createStaticNodeDebugInfo(node) {
    var compileElement = node instanceof CompileElement ? node : null;
    var providerTokens = [];
    var componentToken = o.NULL_EXPR;
    var varTokenEntries = [];
    if (isPresent(compileElement)) {
        providerTokens = compileElement.getProviderTokens();
        if (isPresent(compileElement.component)) {
            componentToken = createDiTokenExpression(identifierToken(compileElement.component.type));
        }
        Object.keys(compileElement.referenceTokens).forEach(function (varName) {
            var token = compileElement.referenceTokens[varName];
            varTokenEntries.push([varName, isPresent(token) ? createDiTokenExpression(token) : o.NULL_EXPR]);
        });
    }
    return o.importExpr(resolveIdentifier(Identifiers.StaticNodeDebugInfo))
        .instantiate([
        o.literalArr(providerTokens, new o.ArrayType(o.DYNAMIC_TYPE, [o.TypeModifier.Const])),
        componentToken,
        o.literalMap(varTokenEntries, new o.MapType(o.DYNAMIC_TYPE, [o.TypeModifier.Const]))
    ], o.importType(resolveIdentifier(Identifiers.StaticNodeDebugInfo), null, [o.TypeModifier.Const]));
}
function createViewClass(view, renderCompTypeVar, nodeDebugInfosVar) {
    var viewConstructorArgs = [
        new o.FnParam(ViewConstructorVars.viewUtils.name, o.importType(resolveIdentifier(Identifiers.ViewUtils))),
        new o.FnParam(ViewConstructorVars.parentInjector.name, o.importType(resolveIdentifier(Identifiers.Injector))),
        new o.FnParam(ViewConstructorVars.declarationEl.name, o.importType(resolveIdentifier(Identifiers.AppElement)))
    ];
    var superConstructorArgs = [
        o.variable(view.className), renderCompTypeVar, ViewTypeEnum.fromValue(view.viewType),
        ViewConstructorVars.viewUtils, ViewConstructorVars.parentInjector,
        ViewConstructorVars.declarationEl,
        ChangeDetectorStatusEnum.fromValue(getChangeDetectionMode(view))
    ];
    if (view.genConfig.genDebugInfo) {
        superConstructorArgs.push(nodeDebugInfosVar);
    }
    var viewMethods = [
        new o.ClassMethod('createInternal', [new o.FnParam(rootSelectorVar.name, o.STRING_TYPE)], generateCreateMethod(view), o.importType(resolveIdentifier(Identifiers.AppElement))),
        new o.ClassMethod('injectorGetInternal', [
            new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
            // Note: Can't use o.INT_TYPE here as the method in AppView uses number
            new o.FnParam(InjectMethodVars.requestNodeIndex.name, o.NUMBER_TYPE),
            new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
        ], addReturnValuefNotEmpty(view.injectorGetMethod.finish(), InjectMethodVars.notFoundResult), o.DYNAMIC_TYPE),
        new o.ClassMethod('detectChangesInternal', [new o.FnParam(DetectChangesVars.throwOnChange.name, o.BOOL_TYPE)], generateDetectChangesMethod(view)),
        new o.ClassMethod('dirtyParentQueriesInternal', [], view.dirtyParentQueriesMethod.finish()),
        new o.ClassMethod('destroyInternal', [], view.destroyMethod.finish()),
        new o.ClassMethod('detachInternal', [], view.detachMethod.finish())
    ].filter(function (method) { return method.body.length > 0; });
    var superClass = view.genConfig.genDebugInfo ? Identifiers.DebugAppView : Identifiers.AppView;
    var viewClass = createClassStmt({
        name: view.className,
        parent: o.importExpr(resolveIdentifier(superClass), [getContextType(view)]),
        parentArgs: superConstructorArgs,
        ctorParams: viewConstructorArgs,
        builders: [{ methods: viewMethods }, view]
    });
    return viewClass;
}
function createViewFactory(view, viewClass, renderCompTypeVar) {
    var viewFactoryArgs = [
        new o.FnParam(ViewConstructorVars.viewUtils.name, o.importType(resolveIdentifier(Identifiers.ViewUtils))),
        new o.FnParam(ViewConstructorVars.parentInjector.name, o.importType(resolveIdentifier(Identifiers.Injector))),
        new o.FnParam(ViewConstructorVars.declarationEl.name, o.importType(resolveIdentifier(Identifiers.AppElement)))
    ];
    var initRenderCompTypeStmts = [];
    var templateUrlInfo;
    if (view.component.template.templateUrl == view.component.type.moduleUrl) {
        templateUrlInfo =
            view.component.type.moduleUrl + " class " + view.component.type.name + " - inline template";
    }
    else {
        templateUrlInfo = view.component.template.templateUrl;
    }
    if (view.viewIndex === 0) {
        var animationsExpr = o.literalMap(view.animations.map(function (entry) { return [entry.name, entry.fnExp]; }));
        initRenderCompTypeStmts = [
            new o.IfStmt(renderCompTypeVar.identical(o.NULL_EXPR), [
                renderCompTypeVar
                    .set(ViewConstructorVars.viewUtils.callMethod('createRenderComponentType', [
                    view.genConfig.genDebugInfo ? o.literal(templateUrlInfo) : o.literal(''),
                    o.literal(view.component.template.ngContentSelectors.length),
                    ViewEncapsulationEnum.fromValue(view.component.template.encapsulation),
                    view.styles,
                    animationsExpr,
                ]))
                    .toStmt(),
            ]),
        ];
    }
    return o
        .fn(viewFactoryArgs, initRenderCompTypeStmts.concat([
        new o.ReturnStatement(o.variable(viewClass.name)
            .instantiate(viewClass.constructorMethod.params.map(function (param) { return o.variable(param.name); }))),
    ]), o.importType(resolveIdentifier(Identifiers.AppView), [getContextType(view)]))
        .toDeclStmt(view.viewFactory.name, [o.StmtModifier.Final]);
}
function generateCreateMethod(view) {
    var parentRenderNodeExpr = o.NULL_EXPR;
    var parentRenderNodeStmts = [];
    if (view.viewType === ViewType.COMPONENT) {
        parentRenderNodeExpr = ViewProperties.renderer.callMethod('createViewRoot', [o.THIS_EXPR.prop('declarationAppElement').prop('nativeElement')]);
        parentRenderNodeStmts =
            [parentRenderNodeVar.set(parentRenderNodeExpr)
                    .toDeclStmt(o.importType(view.genConfig.renderTypes.renderNode), [o.StmtModifier.Final])];
    }
    var resultExpr;
    if (view.viewType === ViewType.HOST) {
        resultExpr = view.nodes[0].appElement;
    }
    else {
        resultExpr = o.NULL_EXPR;
    }
    return parentRenderNodeStmts.concat(view.createMethod.finish(), [
        o.THIS_EXPR
            .callMethod('init', [
            createFlatArray(view.rootNodesOrAppElements),
            o.literalArr(view.nodes.map(function (node) { return node.renderNode; })), o.literalArr(view.disposables),
            o.literalArr(view.subscriptions)
        ])
            .toStmt(),
        new o.ReturnStatement(resultExpr)
    ]);
}
function generateDetectChangesMethod(view) {
    var stmts = [];
    if (view.animationBindingsMethod.isEmpty() && view.detectChangesInInputsMethod.isEmpty() &&
        view.updateContentQueriesMethod.isEmpty() &&
        view.afterContentLifecycleCallbacksMethod.isEmpty() &&
        view.detectChangesRenderPropertiesMethod.isEmpty() &&
        view.updateViewQueriesMethod.isEmpty() && view.afterViewLifecycleCallbacksMethod.isEmpty()) {
        return stmts;
    }
    stmts.push.apply(stmts, view.animationBindingsMethod.finish());
    stmts.push.apply(stmts, view.detectChangesInInputsMethod.finish());
    stmts.push(o.THIS_EXPR.callMethod('detectContentChildrenChanges', [DetectChangesVars.throwOnChange])
        .toStmt());
    var afterContentStmts = view.updateContentQueriesMethod.finish().concat(view.afterContentLifecycleCallbacksMethod.finish());
    if (afterContentStmts.length > 0) {
        stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterContentStmts));
    }
    stmts.push.apply(stmts, view.detectChangesRenderPropertiesMethod.finish());
    stmts.push(o.THIS_EXPR.callMethod('detectViewChildrenChanges', [DetectChangesVars.throwOnChange])
        .toStmt());
    var afterViewStmts = view.updateViewQueriesMethod.finish().concat(view.afterViewLifecycleCallbacksMethod.finish());
    if (afterViewStmts.length > 0) {
        stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterViewStmts));
    }
    var varStmts = [];
    var readVars = o.findReadVarNames(stmts);
    if (readVars.has(DetectChangesVars.changed.name)) {
        varStmts.push(DetectChangesVars.changed.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE));
    }
    if (readVars.has(DetectChangesVars.changes.name)) {
        varStmts.push(DetectChangesVars.changes.set(o.NULL_EXPR)
            .toDeclStmt(new o.MapType(o.importType(resolveIdentifier(Identifiers.SimpleChange)))));
    }
    varStmts.push.apply(varStmts, createSharedBindingVariablesIfNeeded(stmts));
    return varStmts.concat(stmts);
}
function addReturnValuefNotEmpty(statements, value) {
    if (statements.length > 0) {
        return statements.concat([new o.ReturnStatement(value)]);
    }
    else {
        return statements;
    }
}
function getContextType(view) {
    if (view.viewType === ViewType.COMPONENT) {
        return o.importType(view.component.type);
    }
    return o.DYNAMIC_TYPE;
}
function getChangeDetectionMode(view) {
    var mode;
    if (view.viewType === ViewType.COMPONENT) {
        mode = isDefaultChangeDetectionStrategy(view.component.changeDetection) ?
            ChangeDetectorStatus.CheckAlways :
            ChangeDetectorStatus.CheckOnce;
    }
    else {
        mode = ChangeDetectorStatus.CheckAlways;
    }
    return mode;
}
//# sourceMappingURL=view_builder.js.map