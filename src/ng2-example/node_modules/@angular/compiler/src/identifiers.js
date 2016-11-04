/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ANALYZE_FOR_ENTRY_COMPONENTS, ChangeDetectionStrategy, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ElementRef, Injector, LOCALE_ID, NgModuleFactory, QueryList, RenderComponentType, Renderer, SecurityContext, SimpleChange, TRANSLATIONS_FORMAT, TemplateRef, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { CompileIdentifierMetadata, CompileTokenMetadata } from './compile_metadata';
import { AnimationGroupPlayer, AnimationKeyframe, AnimationSequencePlayer, AnimationStyles, AnimationTransition, AppElement, AppView, ChangeDetectorStatus, CodegenComponentFactoryResolver, DebugAppView, DebugContext, NgModuleInjector, NoOpAnimationPlayer, StaticNodeDebugInfo, TemplateRef_, UNINITIALIZED, ValueUnwrapper, ViewType, balanceAnimationKeyframes, clearStyles, collectAndResolveStyles, devModeEqual, prepareFinalAnimationStyles, reflector, registerModuleFactory, renderStyles, view_utils } from './private_import_core';
var APP_VIEW_MODULE_URL = assetUrl('core', 'linker/view');
var VIEW_UTILS_MODULE_URL = assetUrl('core', 'linker/view_utils');
var CD_MODULE_URL = assetUrl('core', 'change_detection/change_detection');
var ANIMATION_STYLE_UTIL_ASSET_URL = assetUrl('core', 'animation/animation_style_util');
export var Identifiers = (function () {
    function Identifiers() {
    }
    Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS = {
        name: 'ANALYZE_FOR_ENTRY_COMPONENTS',
        moduleUrl: assetUrl('core', 'metadata/di'),
        runtime: ANALYZE_FOR_ENTRY_COMPONENTS
    };
    Identifiers.ViewUtils = {
        name: 'ViewUtils',
        moduleUrl: assetUrl('core', 'linker/view_utils'),
        runtime: view_utils.ViewUtils
    };
    Identifiers.AppView = { name: 'AppView', moduleUrl: APP_VIEW_MODULE_URL, runtime: AppView };
    Identifiers.DebugAppView = {
        name: 'DebugAppView',
        moduleUrl: APP_VIEW_MODULE_URL,
        runtime: DebugAppView
    };
    Identifiers.AppElement = {
        name: 'AppElement',
        moduleUrl: assetUrl('core', 'linker/element'),
        runtime: AppElement
    };
    Identifiers.ElementRef = {
        name: 'ElementRef',
        moduleUrl: assetUrl('core', 'linker/element_ref'),
        runtime: ElementRef
    };
    Identifiers.ViewContainerRef = {
        name: 'ViewContainerRef',
        moduleUrl: assetUrl('core', 'linker/view_container_ref'),
        runtime: ViewContainerRef
    };
    Identifiers.ChangeDetectorRef = {
        name: 'ChangeDetectorRef',
        moduleUrl: assetUrl('core', 'change_detection/change_detector_ref'),
        runtime: ChangeDetectorRef
    };
    Identifiers.RenderComponentType = {
        name: 'RenderComponentType',
        moduleUrl: assetUrl('core', 'render/api'),
        runtime: RenderComponentType
    };
    Identifiers.QueryList = {
        name: 'QueryList',
        moduleUrl: assetUrl('core', 'linker/query_list'),
        runtime: QueryList
    };
    Identifiers.TemplateRef = {
        name: 'TemplateRef',
        moduleUrl: assetUrl('core', 'linker/template_ref'),
        runtime: TemplateRef
    };
    Identifiers.TemplateRef_ = {
        name: 'TemplateRef_',
        moduleUrl: assetUrl('core', 'linker/template_ref'),
        runtime: TemplateRef_
    };
    Identifiers.CodegenComponentFactoryResolver = {
        name: 'CodegenComponentFactoryResolver',
        moduleUrl: assetUrl('core', 'linker/component_factory_resolver'),
        runtime: CodegenComponentFactoryResolver
    };
    Identifiers.ComponentFactoryResolver = {
        name: 'ComponentFactoryResolver',
        moduleUrl: assetUrl('core', 'linker/component_factory_resolver'),
        runtime: ComponentFactoryResolver
    };
    Identifiers.ComponentFactory = {
        name: 'ComponentFactory',
        runtime: ComponentFactory,
        moduleUrl: assetUrl('core', 'linker/component_factory')
    };
    Identifiers.NgModuleFactory = {
        name: 'NgModuleFactory',
        runtime: NgModuleFactory,
        moduleUrl: assetUrl('core', 'linker/ng_module_factory')
    };
    Identifiers.NgModuleInjector = {
        name: 'NgModuleInjector',
        runtime: NgModuleInjector,
        moduleUrl: assetUrl('core', 'linker/ng_module_factory')
    };
    Identifiers.RegisterModuleFactoryFn = {
        name: 'registerModuleFactory',
        runtime: registerModuleFactory,
        moduleUrl: assetUrl('core', 'linker/ng_module_factory_loader')
    };
    Identifiers.ValueUnwrapper = { name: 'ValueUnwrapper', moduleUrl: CD_MODULE_URL, runtime: ValueUnwrapper };
    Identifiers.Injector = {
        name: 'Injector',
        moduleUrl: assetUrl('core', 'di/injector'),
        runtime: Injector
    };
    Identifiers.ViewEncapsulation = {
        name: 'ViewEncapsulation',
        moduleUrl: assetUrl('core', 'metadata/view'),
        runtime: ViewEncapsulation
    };
    Identifiers.ViewType = {
        name: 'ViewType',
        moduleUrl: assetUrl('core', 'linker/view_type'),
        runtime: ViewType
    };
    Identifiers.ChangeDetectionStrategy = {
        name: 'ChangeDetectionStrategy',
        moduleUrl: CD_MODULE_URL,
        runtime: ChangeDetectionStrategy
    };
    Identifiers.StaticNodeDebugInfo = {
        name: 'StaticNodeDebugInfo',
        moduleUrl: assetUrl('core', 'linker/debug_context'),
        runtime: StaticNodeDebugInfo
    };
    Identifiers.DebugContext = {
        name: 'DebugContext',
        moduleUrl: assetUrl('core', 'linker/debug_context'),
        runtime: DebugContext
    };
    Identifiers.Renderer = {
        name: 'Renderer',
        moduleUrl: assetUrl('core', 'render/api'),
        runtime: Renderer
    };
    Identifiers.SimpleChange = { name: 'SimpleChange', moduleUrl: CD_MODULE_URL, runtime: SimpleChange };
    Identifiers.UNINITIALIZED = { name: 'UNINITIALIZED', moduleUrl: CD_MODULE_URL, runtime: UNINITIALIZED };
    Identifiers.ChangeDetectorStatus = {
        name: 'ChangeDetectorStatus',
        moduleUrl: CD_MODULE_URL,
        runtime: ChangeDetectorStatus
    };
    Identifiers.checkBinding = {
        name: 'checkBinding',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.checkBinding
    };
    Identifiers.flattenNestedViewRenderNodes = {
        name: 'flattenNestedViewRenderNodes',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.flattenNestedViewRenderNodes
    };
    Identifiers.devModeEqual = { name: 'devModeEqual', moduleUrl: CD_MODULE_URL, runtime: devModeEqual };
    Identifiers.interpolate = {
        name: 'interpolate',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.interpolate
    };
    Identifiers.castByValue = {
        name: 'castByValue',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.castByValue
    };
    Identifiers.EMPTY_ARRAY = {
        name: 'EMPTY_ARRAY',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.EMPTY_ARRAY
    };
    Identifiers.EMPTY_MAP = {
        name: 'EMPTY_MAP',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.EMPTY_MAP
    };
    Identifiers.createRenderElement = {
        name: 'createRenderElement',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.createRenderElement
    };
    Identifiers.selectOrCreateRenderHostElement = {
        name: 'selectOrCreateRenderHostElement',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.selectOrCreateRenderHostElement
    };
    Identifiers.pureProxies = [
        null,
        { name: 'pureProxy1', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy1 },
        { name: 'pureProxy2', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy2 },
        { name: 'pureProxy3', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy3 },
        { name: 'pureProxy4', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy4 },
        { name: 'pureProxy5', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy5 },
        { name: 'pureProxy6', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy6 },
        { name: 'pureProxy7', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy7 },
        { name: 'pureProxy8', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy8 },
        { name: 'pureProxy9', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy9 },
        { name: 'pureProxy10', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.pureProxy10 },
    ];
    Identifiers.SecurityContext = {
        name: 'SecurityContext',
        moduleUrl: assetUrl('core', 'security'),
        runtime: SecurityContext,
    };
    Identifiers.AnimationKeyframe = {
        name: 'AnimationKeyframe',
        moduleUrl: assetUrl('core', 'animation/animation_keyframe'),
        runtime: AnimationKeyframe
    };
    Identifiers.AnimationStyles = {
        name: 'AnimationStyles',
        moduleUrl: assetUrl('core', 'animation/animation_styles'),
        runtime: AnimationStyles
    };
    Identifiers.NoOpAnimationPlayer = {
        name: 'NoOpAnimationPlayer',
        moduleUrl: assetUrl('core', 'animation/animation_player'),
        runtime: NoOpAnimationPlayer
    };
    Identifiers.AnimationGroupPlayer = {
        name: 'AnimationGroupPlayer',
        moduleUrl: assetUrl('core', 'animation/animation_group_player'),
        runtime: AnimationGroupPlayer
    };
    Identifiers.AnimationSequencePlayer = {
        name: 'AnimationSequencePlayer',
        moduleUrl: assetUrl('core', 'animation/animation_sequence_player'),
        runtime: AnimationSequencePlayer
    };
    Identifiers.prepareFinalAnimationStyles = {
        name: 'prepareFinalAnimationStyles',
        moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
        runtime: prepareFinalAnimationStyles
    };
    Identifiers.balanceAnimationKeyframes = {
        name: 'balanceAnimationKeyframes',
        moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
        runtime: balanceAnimationKeyframes
    };
    Identifiers.clearStyles = {
        name: 'clearStyles',
        moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
        runtime: clearStyles
    };
    Identifiers.renderStyles = {
        name: 'renderStyles',
        moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
        runtime: renderStyles
    };
    Identifiers.collectAndResolveStyles = {
        name: 'collectAndResolveStyles',
        moduleUrl: ANIMATION_STYLE_UTIL_ASSET_URL,
        runtime: collectAndResolveStyles
    };
    Identifiers.LOCALE_ID = {
        name: 'LOCALE_ID',
        moduleUrl: assetUrl('core', 'i18n/tokens'),
        runtime: LOCALE_ID
    };
    Identifiers.TRANSLATIONS_FORMAT = {
        name: 'TRANSLATIONS_FORMAT',
        moduleUrl: assetUrl('core', 'i18n/tokens'),
        runtime: TRANSLATIONS_FORMAT
    };
    Identifiers.setBindingDebugInfo = {
        name: 'setBindingDebugInfo',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.setBindingDebugInfo
    };
    Identifiers.setBindingDebugInfoForChanges = {
        name: 'setBindingDebugInfoForChanges',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.setBindingDebugInfoForChanges
    };
    Identifiers.AnimationTransition = {
        name: 'AnimationTransition',
        moduleUrl: assetUrl('core', 'animation/animation_transition'),
        runtime: AnimationTransition
    };
    // This is just the interface!
    Identifiers.InlineArray = { name: 'InlineArray', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: null };
    Identifiers.inlineArrays = [
        { name: 'InlineArray2', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.InlineArray2 },
        { name: 'InlineArray2', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.InlineArray2 },
        { name: 'InlineArray4', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.InlineArray4 },
        { name: 'InlineArray8', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.InlineArray8 },
        { name: 'InlineArray16', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils.InlineArray16 },
    ];
    Identifiers.EMPTY_INLINE_ARRAY = {
        name: 'EMPTY_INLINE_ARRAY',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.EMPTY_INLINE_ARRAY
    };
    Identifiers.InlineArrayDynamic = {
        name: 'InlineArrayDynamic',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: view_utils.InlineArrayDynamic
    };
    return Identifiers;
}());
export function assetUrl(pkg, path, type) {
    if (path === void 0) { path = null; }
    if (type === void 0) { type = 'src'; }
    if (path == null) {
        return "asset:@angular/lib/" + pkg + "/index";
    }
    else {
        return "asset:@angular/lib/" + pkg + "/src/" + path;
    }
}
export function resolveIdentifier(identifier) {
    return new CompileIdentifierMetadata({
        name: identifier.name,
        moduleUrl: identifier.moduleUrl,
        reference: reflector.resolveIdentifier(identifier.name, identifier.moduleUrl, identifier.runtime)
    });
}
export function identifierToken(identifier) {
    return new CompileTokenMetadata({ identifier: identifier });
}
export function resolveIdentifierToken(identifier) {
    return identifierToken(resolveIdentifier(identifier));
}
export function resolveEnumIdentifier(enumType, name) {
    var resolvedEnum = reflector.resolveEnum(enumType.reference, name);
    return new CompileIdentifierMetadata({ name: enumType.name + "." + name, moduleUrl: enumType.moduleUrl, reference: resolvedEnum });
}
//# sourceMappingURL=identifiers.js.map