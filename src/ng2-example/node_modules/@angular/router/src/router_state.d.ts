/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Data, Route } from './config';
import { Params } from './shared';
import { UrlSegment, UrlTree } from './url_tree';
import { Tree } from './utils/tree';
/**
 * @whatItDoes Represents the state of the router.
 *
 * @howToUse
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state: RouterState = router.routerState;
 *     const root: ActivatedRoute = state.root;
 *     const child = root.firstChild;
 *     const id: Observable<string> = child.params.map(p => p.id);
 *     //...
 *   }
 * }
 * ```
 *
 * @description
 * RouterState is a tree of activated routes. Every node in this tree knows about the "consumed" URL
 * segments,
 * the extracted parameters, and the resolved data.
 *
 * See {@link ActivatedRoute} for more information.
 *
 * @stable
 */
export declare class RouterState extends Tree<ActivatedRoute> {
    /**
     * The current snapshot of the router state.
     */
    snapshot: RouterStateSnapshot;
    toString(): string;
}
export declare function createEmptyState(urlTree: UrlTree, rootComponent: Type<any>): RouterState;
export declare function createEmptyStateSnapshot(urlTree: UrlTree, rootComponent: Type<any>): RouterStateSnapshot;
/**
 * @whatItDoes Contains the information about a route associated with a component loaded in an
 * outlet.
 * ActivatedRoute can also be used to traverse the router state tree.
 *
 * @howToUse
 *
 * ```
 * @Component({templateUrl:'./my-component.html'})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: Observable<string> = route.params.map(p => p.id);
 *     const url: Observable<string> = route.url.map(s => s.join(''));
 *     const user = route.data.map(d => d.user); //includes `data` and `resolve`
 *   }
 * }
 * ```
 *
 * @stable
 */
export declare class ActivatedRoute {
    /**
     *  The URL segments matched by this route. The observable will emit a new value when
     *  the array of segments changes.
     */
    url: Observable<UrlSegment[]>;
    /**
     * The matrix parameters scoped to this route. The observable will emit a new value when
     * the set of the parameters changes.
     */
    params: Observable<Params>;
    /**
     * The query parameters shared by all the routes. The observable will emit a new value when
     * the set of the parameters changes.
     */
    queryParams: Observable<Params>;
    /**
     * The URL fragment shared by all the routes. The observable will emit a new value when
     * the URL fragment changes.
     */
    fragment: Observable<string>;
    /**
     * The static and resolved data of this route. The observable will emit a new value when
     * any of the resolvers returns a new object.
     */
    data: Observable<Data>;
    /**
     * The outlet name of the route. It's a constant.
     */
    outlet: string;
    /**
     * The component of the route. It's a constant.
     */
    component: Type<any> | string;
    /**
     * The current snapshot of this route.
     */
    snapshot: ActivatedRouteSnapshot;
    /**
     * The configuration used to match this route.
     */
    routeConfig: Route;
    /**
     * The root of the router state.
     */
    root: ActivatedRoute;
    /**
     * The parent of this route in the router state tree.
     */
    parent: ActivatedRoute;
    /**
     * The first child of this route in the router state tree.
     */
    firstChild: ActivatedRoute;
    /**
     * The children of this route in the router state tree.
     */
    children: ActivatedRoute[];
    /**
     * The path from the root of the router state tree to this route.
     */
    pathFromRoot: ActivatedRoute[];
    /**
     * @docsNotRequired
     */
    toString(): string;
}
/**
 * @whatItDoes Contains the information about a route associated with a component loaded in an
 * outlet
 * at a particular moment in time. ActivatedRouteSnapshot can also be used to traverse the router
 * state tree.
 *
 * @howToUse
 *
 * ```
 * @Component({templateUrl:'./my-component.html'})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: string = route.snapshot.params.id;
 *     const url: string = route.snapshot.url.join('');
 *     const user = route.snapshot.data.user;
 *   }
 * }
 * ```
 *
 * @stable
 */
export declare class ActivatedRouteSnapshot {
    /**
     *  The URL segments matched by this route.
     */
    url: UrlSegment[];
    /**
     * The matrix parameters scoped to this route.
     */
    params: Params;
    /**
     * The query parameters shared by all the routes.
     */
    queryParams: Params;
    /**
     * The URL fragment shared by all the routes.
     */
    fragment: string;
    /**
     * The static and resolved data of this route.
     */
    data: Data;
    /**
     * The outlet name of the route.
     */
    outlet: string;
    /**
     * The component of the route.
     */
    component: Type<any> | string;
    /**
     * The configuration used to match this route.
     */
    routeConfig: Route;
    /**
     * The root of the router state.
     */
    root: ActivatedRouteSnapshot;
    /**
     * The parent of this route in the router state tree.
     */
    parent: ActivatedRouteSnapshot;
    /**
     * The first child of this route in the router state tree.
     */
    firstChild: ActivatedRouteSnapshot;
    /**
     * The children of this route in the router state tree.
     */
    children: ActivatedRouteSnapshot[];
    /**
     * The path from the root of the router state tree to this route.
     */
    pathFromRoot: ActivatedRouteSnapshot[];
    /**
     * @docsNotRequired
     */
    toString(): string;
}
/**
 * @whatItDoes Represents the state of the router at a moment in time.
 *
 * @howToUse
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state: RouterState = router.routerState;
 *     const snapshot: RouterStateSnapshot = state.snapshot;
 *     const root: ActivatedRouteSnapshot = snapshot.root;
 *     const child = root.firstChild;
 *     const id: Observable<string> = child.params.map(p => p.id);
 *     //...
 *   }
 * }
 * ```
 *
 * @description
 * RouterStateSnapshot is a tree of activated route snapshots. Every node in this tree knows about
 * the "consumed" URL segments, the extracted parameters, and the resolved data.
 *
 * @stable
 */
export declare class RouterStateSnapshot extends Tree<ActivatedRouteSnapshot> {
    /** The url from which this snapshot was created */
    url: string;
    toString(): string;
}
/**
 * The expectation is that the activate route is created with the right set of parameters.
 * So we push new values into the observables only when they are not the initial values.
 * And we detect that by checking if the snapshot field is set.
 */
export declare function advanceActivatedRoute(route: ActivatedRoute): void;
