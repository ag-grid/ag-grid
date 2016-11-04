/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { CompilerConfig } from '../config';
import { ElementSchemaRegistry } from '../schema/element_schema_registry';
import { CompileElement } from './compile_element';
import { CompileView } from './compile_view';
import { bindView } from './view_binder';
import { buildView, finishView } from './view_builder';
export { ComponentFactoryDependency, DirectiveWrapperDependency, ViewFactoryDependency } from './deps';
export var ViewCompileResult = (function () {
    function ViewCompileResult(statements, viewFactoryVar, dependencies) {
        this.statements = statements;
        this.viewFactoryVar = viewFactoryVar;
        this.dependencies = dependencies;
    }
    return ViewCompileResult;
}());
export var ViewCompiler = (function () {
    function ViewCompiler(_genConfig, _schemaRegistry) {
        this._genConfig = _genConfig;
        this._schemaRegistry = _schemaRegistry;
    }
    ViewCompiler.prototype.compileComponent = function (component, template, styles, pipes, compiledAnimations) {
        var dependencies = [];
        var view = new CompileView(component, this._genConfig, pipes, styles, compiledAnimations, 0, CompileElement.createNull(), []);
        var statements = [];
        buildView(view, template, dependencies);
        // Need to separate binding from creation to be able to refer to
        // variables that have been declared after usage.
        bindView(view, template, this._schemaRegistry);
        finishView(view, statements);
        return new ViewCompileResult(statements, view.viewFactory.name, dependencies);
    };
    ViewCompiler.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    ViewCompiler.ctorParameters = [
        { type: CompilerConfig, },
        { type: ElementSchemaRegistry, },
    ];
    return ViewCompiler;
}());
//# sourceMappingURL=view_compiler.js.map