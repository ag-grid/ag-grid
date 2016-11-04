/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DirectiveResolver } from '@angular/compiler';
import { AnimationEntryMetadata, Directive, Injector, Provider, Type } from '@angular/core';
import { ViewMetadata } from './private_import_core';
/**
 * An implementation of {@link DirectiveResolver} that allows overriding
 * various properties of directives.
 */
export declare class MockDirectiveResolver extends DirectiveResolver {
    private _injector;
    private _directives;
    private _providerOverrides;
    private _viewProviderOverrides;
    private _views;
    private _inlineTemplates;
    private _animations;
    constructor(_injector: Injector);
    private _compiler;
    private _clearCacheFor(component);
    resolve(type: Type<any>, throwIfNotFound?: boolean): Directive;
    /**
     * Overrides the {@link Directive} for a directive.
     */
    setDirective(type: Type<any>, metadata: Directive): void;
    setProvidersOverride(type: Type<any>, providers: Provider[]): void;
    setViewProvidersOverride(type: Type<any>, viewProviders: Provider[]): void;
    /**
     * Overrides the {@link ViewMetadata} for a component.
     */
    setView(component: Type<any>, view: ViewMetadata): void;
    /**
     * Overrides the inline template for a component - other configuration remains unchanged.
     */
    setInlineTemplate(component: Type<any>, template: string): void;
    setAnimations(component: Type<any>, animations: AnimationEntryMetadata[]): void;
}
