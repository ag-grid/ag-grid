var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { DirectiveResolver } from '@angular/compiler';
import { Compiler, Component, Directive, Injectable, Injector, resolveForwardRef } from '@angular/core';
import { isPresent } from './facade/lang';
/**
 * An implementation of {@link DirectiveResolver} that allows overriding
 * various properties of directives.
 */
export var MockDirectiveResolver = (function (_super) {
    __extends(MockDirectiveResolver, _super);
    function MockDirectiveResolver(_injector) {
        _super.call(this);
        this._injector = _injector;
        this._directives = new Map();
        this._providerOverrides = new Map();
        this._viewProviderOverrides = new Map();
        this._views = new Map();
        this._inlineTemplates = new Map();
        this._animations = new Map();
    }
    Object.defineProperty(MockDirectiveResolver.prototype, "_compiler", {
        get: function () { return this._injector.get(Compiler); },
        enumerable: true,
        configurable: true
    });
    MockDirectiveResolver.prototype._clearCacheFor = function (component) { this._compiler.clearCacheFor(component); };
    MockDirectiveResolver.prototype.resolve = function (type, throwIfNotFound) {
        if (throwIfNotFound === void 0) { throwIfNotFound = true; }
        var metadata = this._directives.get(type);
        if (!metadata) {
            metadata = _super.prototype.resolve.call(this, type, throwIfNotFound);
        }
        if (!metadata) {
            return null;
        }
        var providerOverrides = this._providerOverrides.get(type);
        var viewProviderOverrides = this._viewProviderOverrides.get(type);
        var providers = metadata.providers;
        if (isPresent(providerOverrides)) {
            var originalViewProviders = metadata.providers || [];
            providers = originalViewProviders.concat(providerOverrides);
        }
        if (metadata instanceof Component) {
            var viewProviders = metadata.viewProviders;
            if (isPresent(viewProviderOverrides)) {
                var originalViewProviders = metadata.viewProviders || [];
                viewProviders = originalViewProviders.concat(viewProviderOverrides);
            }
            var view = this._views.get(type);
            if (!view) {
                view = metadata;
            }
            var animations = view.animations;
            var templateUrl = view.templateUrl;
            var inlineAnimations = this._animations.get(type);
            if (isPresent(inlineAnimations)) {
                animations = inlineAnimations;
            }
            var inlineTemplate = this._inlineTemplates.get(type);
            if (isPresent(inlineTemplate)) {
                templateUrl = null;
            }
            else {
                inlineTemplate = view.template;
            }
            return new Component({
                selector: metadata.selector,
                inputs: metadata.inputs,
                outputs: metadata.outputs,
                host: metadata.host,
                exportAs: metadata.exportAs,
                moduleId: metadata.moduleId,
                queries: metadata.queries,
                changeDetection: metadata.changeDetection,
                providers: providers,
                viewProviders: viewProviders,
                entryComponents: metadata.entryComponents,
                template: inlineTemplate,
                templateUrl: templateUrl,
                animations: animations,
                styles: view.styles,
                styleUrls: view.styleUrls,
                encapsulation: view.encapsulation,
                interpolation: view.interpolation
            });
        }
        return new Directive({
            selector: metadata.selector,
            inputs: metadata.inputs,
            outputs: metadata.outputs,
            host: metadata.host,
            providers: providers,
            exportAs: metadata.exportAs,
            queries: metadata.queries
        });
    };
    /**
     * Overrides the {@link Directive} for a directive.
     */
    MockDirectiveResolver.prototype.setDirective = function (type, metadata) {
        this._directives.set(type, metadata);
        this._clearCacheFor(type);
    };
    MockDirectiveResolver.prototype.setProvidersOverride = function (type, providers) {
        this._providerOverrides.set(type, providers);
        this._clearCacheFor(type);
    };
    MockDirectiveResolver.prototype.setViewProvidersOverride = function (type, viewProviders) {
        this._viewProviderOverrides.set(type, viewProviders);
        this._clearCacheFor(type);
    };
    /**
     * Overrides the {@link ViewMetadata} for a component.
     */
    MockDirectiveResolver.prototype.setView = function (component, view) {
        this._views.set(component, view);
        this._clearCacheFor(component);
    };
    /**
     * Overrides the inline template for a component - other configuration remains unchanged.
     */
    MockDirectiveResolver.prototype.setInlineTemplate = function (component, template) {
        this._inlineTemplates.set(component, template);
        this._clearCacheFor(component);
    };
    MockDirectiveResolver.prototype.setAnimations = function (component, animations) {
        this._animations.set(component, animations);
        this._clearCacheFor(component);
    };
    MockDirectiveResolver.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MockDirectiveResolver.ctorParameters = [
        { type: Injector, },
    ];
    return MockDirectiveResolver;
}(DirectiveResolver));
function flattenArray(tree, out) {
    if (!isPresent(tree))
        return;
    for (var i = 0; i < tree.length; i++) {
        var item = resolveForwardRef(tree[i]);
        if (Array.isArray(item)) {
            flattenArray(item, out);
        }
        else {
            out.push(item);
        }
    }
}
//# sourceMappingURL=directive_resolver_mock.js.map