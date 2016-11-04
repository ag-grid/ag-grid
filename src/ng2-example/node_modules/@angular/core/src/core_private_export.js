/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ANY_STATE as ANY_STATE_, DEFAULT_STATE as DEFAULT_STATE_, EMPTY_STATE as EMPTY_STATE_, FILL_STYLE_FLAG as FILL_STYLE_FLAG_ } from './animation/animation_constants';
import { AnimationGroupPlayer as AnimationGroupPlayer_ } from './animation/animation_group_player';
import { AnimationKeyframe as AnimationKeyframe_ } from './animation/animation_keyframe';
import { AnimationPlayer as AnimationPlayer_, NoOpAnimationPlayer as NoOpAnimationPlayer_ } from './animation/animation_player';
import { AnimationSequencePlayer as AnimationSequencePlayer_ } from './animation/animation_sequence_player';
import * as animationUtils from './animation/animation_style_util';
import { AnimationStyles as AnimationStyles_ } from './animation/animation_styles';
import { AnimationTransition } from './animation/animation_transition';
import * as change_detection_util from './change_detection/change_detection_util';
import * as constants from './change_detection/constants';
import * as console from './console';
import * as debug from './debug/debug_renderer';
import * as reflective_provider from './di/reflective_provider';
import { ComponentStillLoadingError } from './linker/compiler';
import * as component_factory_resolver from './linker/component_factory_resolver';
import * as debug_context from './linker/debug_context';
import * as element from './linker/element';
import * as ng_module_factory from './linker/ng_module_factory';
import * as ng_module_factory_loader from './linker/ng_module_factory_loader';
import * as template_ref from './linker/template_ref';
import * as view from './linker/view';
import * as view_type from './linker/view_type';
import * as view_utils from './linker/view_utils';
import * as lifecycle_hooks from './metadata/lifecycle_hooks';
import * as metadata_view from './metadata/view';
import * as reflection from './reflection/reflection';
import * as reflection_capabilities from './reflection/reflection_capabilities';
import * as reflector_reader from './reflection/reflector_reader';
import * as api from './render/api';
import * as decorators from './util/decorators';
import { isPromise } from './util/lang';
export var __core_private__ = {
    isDefaultChangeDetectionStrategy: constants.isDefaultChangeDetectionStrategy,
    ChangeDetectorStatus: constants.ChangeDetectorStatus,
    constructDependencies: reflective_provider.constructDependencies,
    LifecycleHooks: lifecycle_hooks.LifecycleHooks,
    LIFECYCLE_HOOKS_VALUES: lifecycle_hooks.LIFECYCLE_HOOKS_VALUES,
    ReflectorReader: reflector_reader.ReflectorReader,
    CodegenComponentFactoryResolver: component_factory_resolver.CodegenComponentFactoryResolver,
    AppElement: element.AppElement,
    AppView: view.AppView,
    DebugAppView: view.DebugAppView,
    NgModuleInjector: ng_module_factory.NgModuleInjector,
    registerModuleFactory: ng_module_factory_loader.registerModuleFactory,
    ViewType: view_type.ViewType,
    view_utils: view_utils,
    ViewMetadata: metadata_view.ViewMetadata,
    DebugContext: debug_context.DebugContext,
    StaticNodeDebugInfo: debug_context.StaticNodeDebugInfo,
    devModeEqual: change_detection_util.devModeEqual,
    UNINITIALIZED: change_detection_util.UNINITIALIZED,
    ValueUnwrapper: change_detection_util.ValueUnwrapper,
    RenderDebugInfo: api.RenderDebugInfo,
    TemplateRef_: template_ref.TemplateRef_,
    ReflectionCapabilities: reflection_capabilities.ReflectionCapabilities,
    makeDecorator: decorators.makeDecorator,
    DebugDomRootRenderer: debug.DebugDomRootRenderer,
    Console: console.Console,
    reflector: reflection.reflector,
    Reflector: reflection.Reflector,
    NoOpAnimationPlayer: NoOpAnimationPlayer_,
    AnimationPlayer: AnimationPlayer_,
    AnimationSequencePlayer: AnimationSequencePlayer_,
    AnimationGroupPlayer: AnimationGroupPlayer_,
    AnimationKeyframe: AnimationKeyframe_,
    prepareFinalAnimationStyles: animationUtils.prepareFinalAnimationStyles,
    balanceAnimationKeyframes: animationUtils.balanceAnimationKeyframes,
    flattenStyles: animationUtils.flattenStyles,
    clearStyles: animationUtils.clearStyles,
    renderStyles: animationUtils.renderStyles,
    collectAndResolveStyles: animationUtils.collectAndResolveStyles,
    AnimationStyles: AnimationStyles_,
    ANY_STATE: ANY_STATE_,
    DEFAULT_STATE: DEFAULT_STATE_,
    EMPTY_STATE: EMPTY_STATE_,
    FILL_STYLE_FLAG: FILL_STYLE_FLAG_,
    ComponentStillLoadingError: ComponentStillLoadingError,
    isPromise: isPromise,
    AnimationTransition: AnimationTransition
};
//# sourceMappingURL=core_private_export.js.map