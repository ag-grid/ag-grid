/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver, EventEmitter, Injector, OnDestroy, ResolvedReflectiveProvider, ViewContainerRef } from '@angular/core';
import { RouterOutletMap } from '../router_outlet_map';
import { ActivatedRoute } from '../router_state';
/**
 * @whatItDoes Acts as a placeholder that Angular dynamically fills based on the current router
 * state.
 *
 * @howToUse
 *
 * ```
 * <router-outlet></router-outlet>
 * <router-outlet name='left'></router-outlet>
 * <router-outlet name='right'></router-outlet>
 * ```
 *
 * A router outlet will emit an activate event any time a new component is being instantiated,
 * and a deactivate event when it is being destroyed.
 *
 * ```
 * <router-outlet
 *   (activate)='onActivate($event)'
 *   (deactivate)='onDeactivate($event)'></router-outlet>
 * ```
 * @selector 'a[routerLink]'
 * @ngModule RouterModule
 *
 * @stable
 */
export declare class RouterOutlet implements OnDestroy {
    private parentOutletMap;
    private location;
    private resolver;
    private name;
    private activated;
    private _activatedRoute;
    outletMap: RouterOutletMap;
    activateEvents: EventEmitter<any>;
    deactivateEvents: EventEmitter<any>;
    constructor(parentOutletMap: RouterOutletMap, location: ViewContainerRef, resolver: ComponentFactoryResolver, name: string);
    ngOnDestroy(): void;
    isActivated: boolean;
    component: Object;
    activatedRoute: ActivatedRoute;
    deactivate(): void;
    activate(activatedRoute: ActivatedRoute, loadedResolver: ComponentFactoryResolver, loadedInjector: Injector, providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void;
}
