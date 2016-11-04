/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, ChangeDetectorStatus } from '../change_detection/change_detection';
import { Injector } from '../di/injector';
import { RenderComponentType, Renderer } from '../render/api';
import { AnimationViewContext } from './animation_view_context';
import { DebugContext, StaticNodeDebugInfo } from './debug_context';
import { AppElement } from './element';
import { ViewRef_ } from './view_ref';
import { ViewType } from './view_type';
import { ViewUtils } from './view_utils';
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export declare abstract class AppView<T> {
    clazz: any;
    componentType: RenderComponentType;
    type: ViewType;
    viewUtils: ViewUtils;
    parentInjector: Injector;
    declarationAppElement: AppElement;
    cdMode: ChangeDetectorStatus;
    ref: ViewRef_<T>;
    rootNodesOrAppElements: any[];
    allNodes: any[];
    disposables: Function[];
    subscriptions: any[];
    contentChildren: AppView<any>[];
    viewChildren: AppView<any>[];
    viewContainerElement: AppElement;
    numberOfChecks: number;
    projectableNodes: Array<any | any[]>;
    renderer: Renderer;
    private _hasExternalHostElement;
    private _animationContext;
    context: T;
    constructor(clazz: any, componentType: RenderComponentType, type: ViewType, viewUtils: ViewUtils, parentInjector: Injector, declarationAppElement: AppElement, cdMode: ChangeDetectorStatus);
    animationContext: AnimationViewContext;
    destroyed: boolean;
    create(context: T, givenProjectableNodes: Array<any | any[]>, rootSelectorOrNode: string | any): AppElement;
    /**
     * Overwritten by implementations.
     * Returns the AppElement for the host element for ViewType.HOST.
     */
    createInternal(rootSelectorOrNode: string | any): AppElement;
    init(rootNodesOrAppElements: any[], allNodes: any[], disposables: Function[], subscriptions: any[]): void;
    injectorGet(token: any, nodeIndex: number, notFoundResult: any): any;
    /**
     * Overwritten by implementations
     */
    injectorGetInternal(token: any, nodeIndex: number, notFoundResult: any): any;
    injector(nodeIndex: number): Injector;
    destroy(): void;
    private _destroyRecurse();
    destroyLocal(): void;
    /**
     * Overwritten by implementations
     */
    destroyInternal(): void;
    /**
     * Overwritten by implementations
     */
    detachInternal(): void;
    detach(): void;
    changeDetectorRef: ChangeDetectorRef;
    parent: AppView<any>;
    flatRootNodes: any[];
    lastRootNode: any;
    /**
     * Overwritten by implementations
     */
    dirtyParentQueriesInternal(): void;
    detectChanges(throwOnChange: boolean): void;
    /**
     * Overwritten by implementations
     */
    detectChangesInternal(throwOnChange: boolean): void;
    detectContentChildrenChanges(throwOnChange: boolean): void;
    detectViewChildrenChanges(throwOnChange: boolean): void;
    markContentChildAsMoved(renderAppElement: AppElement): void;
    addToContentChildren(renderAppElement: AppElement): void;
    removeFromContentChildren(renderAppElement: AppElement): void;
    markAsCheckOnce(): void;
    markPathToRootAsCheckOnce(): void;
    eventHandler<E, R>(cb: (event?: E) => R): (event?: E) => R;
    throwDestroyedError(details: string): void;
}
export declare class DebugAppView<T> extends AppView<T> {
    staticNodeDebugInfos: StaticNodeDebugInfo[];
    private _currentDebugContext;
    constructor(clazz: any, componentType: RenderComponentType, type: ViewType, viewUtils: ViewUtils, parentInjector: Injector, declarationAppElement: AppElement, cdMode: ChangeDetectorStatus, staticNodeDebugInfos: StaticNodeDebugInfo[]);
    create(context: T, givenProjectableNodes: Array<any | any[]>, rootSelectorOrNode: string | any): AppElement;
    injectorGet(token: any, nodeIndex: number, notFoundResult: any): any;
    detach(): void;
    destroyLocal(): void;
    detectChanges(throwOnChange: boolean): void;
    private _resetDebug();
    debug(nodeIndex: number, rowNum: number, colNum: number): DebugContext;
    private _rethrowWithContext(e);
    eventHandler<E, R>(cb: (event?: E) => R): (event?: E) => R;
}
