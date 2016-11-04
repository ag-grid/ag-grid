/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Location } from '@angular/common';
import { Compiler, Injector, NgModuleFactoryLoader, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Routes } from './config';
import { RouterOutletMap } from './router_outlet_map';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot } from './router_state';
import { Params } from './shared';
import { UrlSerializer, UrlTree } from './url_tree';
import { TreeNode } from './utils/tree';
/**
 * @whatItDoes Represents the extra options used during navigation.
 *
 * @stable
 */
export interface NavigationExtras {
    /**
    * Enables relative navigation from the current ActivatedRoute.
    *
    * Configuration:
    *
    * ```
    * [{
    *   path: 'parent',
    *   component: ParentComponent,
    *   children: [
    *     {
    *       path: 'list',
    *       component: ListComponent
    *     },
    *     {
    *       path: 'child',
    *       component: ChildComponent
    *     }
    *   ]
    * }]
    * ```
    *
    * Navigate to list route from child route:
    *
    * ```
    *  @Component({...})
    *  class ChildComponent {
    *    constructor(private router: Router, private route: ActivatedRoute) {}
    *
    *    go() {
    *      this.router.navigate(['../list'], { relativeTo: this.route });
    *    }
    *  }
    * ```
    */
    relativeTo?: ActivatedRoute;
    /**
    * Sets query parameters to the URL.
    *
    * ```
    * // Navigate to /results?page=1
    * this.router.navigate(['/results'], { queryParams: { page: 1 } });
    * ```
    */
    queryParams?: Params;
    /**
    * Sets the hash fragment for the URL.
    *
    * ```
    * // Navigate to /results#top
    * this.router.navigate(['/results'], { fragment: 'top' });
    * ```
    */
    fragment?: string;
    /**
    * Preserves the query parameters for the next navigation.
    *
    * ```
    * // Preserve query params from /results?page=1 to /view?page=1
    * this.router.navigate(['/view'], { preserveQueryParams: true });
    * ```
    */
    preserveQueryParams?: boolean;
    /**
    * Preserves the fragment for the next navigation
    *
    * ```
    * // Preserve fragment from /results#top to /view#top
    * this.router.navigate(['/view'], { preserveFragment: true });
    * ```
    */
    preserveFragment?: boolean;
    /**
    * Navigates without pushing a new state into history.
    *
    * ```
    * // Navigate silently to /view
    * this.router.navigate(['/view'], { skipLocationChange: true });
    * ```
    */
    skipLocationChange?: boolean;
    /**
    * Navigates while replacing the current state in history.
    *
    * ```
    * // Navigate to /view
    * this.router.navigate(['/view'], { replaceUrl: true });
    * ```
    */
    replaceUrl?: boolean;
}
/**
 * @whatItDoes Represents an event triggered when a navigation starts.
 *
 * @stable
 */
export declare class NavigationStart {
    /** @docsNotRequired */
    id: number;
    /** @docsNotRequired */
    url: string;
    constructor(
        /** @docsNotRequired */
        id: number, 
        /** @docsNotRequired */
        url: string);
    /** @docsNotRequired */
    toString(): string;
}
/**
 * @whatItDoes Represents an event triggered when a navigation ends successfully.
 *
 * @stable
 */
export declare class NavigationEnd {
    /** @docsNotRequired */
    id: number;
    /** @docsNotRequired */
    url: string;
    /** @docsNotRequired */
    urlAfterRedirects: string;
    constructor(
        /** @docsNotRequired */
        id: number, 
        /** @docsNotRequired */
        url: string, 
        /** @docsNotRequired */
        urlAfterRedirects: string);
    /** @docsNotRequired */
    toString(): string;
}
/**
 * @whatItDoes Represents an event triggered when a navigation is canceled.
 *
 * @stable
 */
export declare class NavigationCancel {
    /** @docsNotRequired */
    id: number;
    /** @docsNotRequired */
    url: string;
    /** @docsNotRequired */
    reason: string;
    constructor(
        /** @docsNotRequired */
        id: number, 
        /** @docsNotRequired */
        url: string, 
        /** @docsNotRequired */
        reason: string);
    /** @docsNotRequired */
    toString(): string;
}
/**
 * @whatItDoes Represents an event triggered when a navigation fails due to an unexpected error.
 *
 * @stable
 */
export declare class NavigationError {
    /** @docsNotRequired */
    id: number;
    /** @docsNotRequired */
    url: string;
    /** @docsNotRequired */
    error: any;
    constructor(
        /** @docsNotRequired */
        id: number, 
        /** @docsNotRequired */
        url: string, 
        /** @docsNotRequired */
        error: any);
    /** @docsNotRequired */
    toString(): string;
}
/**
 * @whatItDoes Represents an event triggered when routes are recognized.
 *
 * @stable
 */
export declare class RoutesRecognized {
    /** @docsNotRequired */
    id: number;
    /** @docsNotRequired */
    url: string;
    /** @docsNotRequired */
    urlAfterRedirects: string;
    /** @docsNotRequired */
    state: RouterStateSnapshot;
    constructor(
        /** @docsNotRequired */
        id: number, 
        /** @docsNotRequired */
        url: string, 
        /** @docsNotRequired */
        urlAfterRedirects: string, 
        /** @docsNotRequired */
        state: RouterStateSnapshot);
    /** @docsNotRequired */
    toString(): string;
}
/**
 * @whatItDoes Represents a router event.
 *
 * Please see {@link NavigationStart}, {@link NavigationEnd}, {@link NavigationCancel}, {@link
 * NavigationError},
 * {@link RoutesRecognized} for more information.
 *
 * @stable
 */
export declare type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized;
/**
 * @whatItDoes Error handler that is invoked when a navigation errors.
 *
 * @description
 * If the handler returns a value, the navigation promise will be resolved with this value.
 * If the handler throws an exception, the navigation promise will be rejected with
 * the exception.
 *
 * @stable
 */
export declare type ErrorHandler = (error: any) => any;
/**
 * @whatItDoes Provides the navigation and url manipulation capabilities.
 *
 * See {@link Routes} for more details and examples.
 *
 * @ngModule RouterModule
 *
 * @stable
 */
export declare class Router {
    private rootComponentType;
    private urlSerializer;
    private outletMap;
    private location;
    private injector;
    config: Routes;
    private currentUrlTree;
    private currentRouterState;
    private locationSubscription;
    private routerEvents;
    private navigationId;
    private configLoader;
    /**
     * Error handler that is invoked when a navigation errors.
     *
     * See {@link ErrorHandler} for more information.
     */
    errorHandler: ErrorHandler;
    /**
     * Indicates if at least one navigation happened.
     */
    navigated: boolean;
    /**
     * Creates the router service.
     */
    constructor(rootComponentType: Type<any>, urlSerializer: UrlSerializer, outletMap: RouterOutletMap, location: Location, injector: Injector, loader: NgModuleFactoryLoader, compiler: Compiler, config: Routes);
    /**
     * Sets up the location change listener and performs the initial navigation.
     */
    initialNavigation(): void;
    /**
     * Sets up the location change listener.
     */
    setUpLocationChangeListener(): void;
    /**
     * Returns the current route state.
     */
    routerState: RouterState;
    /**
     * Returns the current url.
     */
    url: string;
    /**
     * Returns an observable of route events
     */
    events: Observable<Event>;
    /**
     * Resets the configuration used for navigation and generating links.
     *
     * ### Usage
     *
     * ```
     * router.resetConfig([
     *  { path: 'team/:id', component: TeamCmp, children: [
     *    { path: 'simple', component: SimpleCmp },
     *    { path: 'user/:name', component: UserCmp }
     *  ] }
     * ]);
     * ```
     */
    resetConfig(config: Routes): void;
    /**
     * @docsNotRequired
     */
    ngOnDestroy(): void;
    /**
     * Disposes of the router.
     */
    dispose(): void;
    /**
     * Applies an array of commands to the current url tree and creates a new url tree.
     *
     * When given an activate route, applies the given commands starting from the route.
     * When not given a route, applies the given command starting from the root.
     *
     * ### Usage
     *
     * ```
     * // create /team/33/user/11
     * router.createUrlTree(['/team', 33, 'user', 11]);
     *
     * // create /team/33;expand=true/user/11
     * router.createUrlTree(['/team', 33, {expand: true}, 'user', 11]);
     *
     * // you can collapse static segments like this (this works only with the first passed-in value):
     * router.createUrlTree(['/team/33/user', userId]);
     *
     * // If the first segment can contain slashes, and you do not want the router to split it, you
     * // can do the following:
     *
     * router.createUrlTree([{segmentPath: '/one/two'}]);
     *
     * // create /team/33/(user/11//right:chat)
     * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: 'chat'}}]);
     *
     * // remove the right secondary node
     * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: null}}]);
     *
     * // assuming the current url is `/team/33/user/11` and the route points to `user/11`
     *
     * // navigate to /team/33/user/11/details
     * router.createUrlTree(['details'], {relativeTo: route});
     *
     * // navigate to /team/33/user/22
     * router.createUrlTree(['../22'], {relativeTo: route});
     *
     * // navigate to /team/44/user/22
     * router.createUrlTree(['../../team/44/user/22'], {relativeTo: route});
     * ```
     */
    createUrlTree(commands: any[], {relativeTo, queryParams, fragment, preserveQueryParams, preserveFragment}?: NavigationExtras): UrlTree;
    /**
     * Navigate based on the provided url. This navigation is always absolute.
     *
     * Returns a promise that:
     * - is resolved with 'true' when navigation succeeds
     * - is resolved with 'false' when navigation fails
     * - is rejected when an error happens
     *
     * ### Usage
     *
     * ```
     * router.navigateByUrl("/team/33/user/11");
     *
     * // Navigate without updating the URL
     * router.navigateByUrl("/team/33/user/11", { skipLocationChange: true });
     * ```
     *
     * In opposite to `navigate`, `navigateByUrl` takes a whole URL
     * and does not apply any delta to the current one.
     */
    navigateByUrl(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean>;
    /**
     * Navigate based on the provided array of commands and a starting point.
     * If no starting route is provided, the navigation is absolute.
     *
     * Returns a promise that:
     * - is resolved with 'true' when navigation succeeds
     * - is resolved with 'false' when navigation fails
     * - is rejected when an error happens
     *
     * ### Usage
     *
     * ```
     * router.navigate(['team', 33, 'user', 11], {relativeTo: route});
     *
     * // Navigate without updating the URL
     * router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true });
     * ```
     *
     * In opposite to `navigateByUrl`, `navigate` always takes a delta
     * that is applied to the current URL.
     */
    navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;
    /**
     * Serializes a {@link UrlTree} into a string.
     */
    serializeUrl(url: UrlTree): string;
    /**
     * Parses a string into a {@link UrlTree}.
     */
    parseUrl(url: string): UrlTree;
    /**
     * Returns if the url is activated or not.
     */
    isActive(url: string | UrlTree, exact: boolean): boolean;
    private scheduleNavigation(url, extras);
    private runNavigate(url, shouldPreventPushState, shouldReplaceUrl, id);
}
export declare class PreActivation {
    private future;
    private curr;
    private injector;
    private checks;
    constructor(future: RouterStateSnapshot, curr: RouterStateSnapshot, injector: Injector);
    traverse(parentOutletMap: RouterOutletMap): void;
    checkGuards(): Observable<boolean>;
    resolveData(): Observable<any>;
    private traverseChildRoutes(futureNode, currNode, outletMap, futurePath);
    traverseRoutes(futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>, parentOutletMap: RouterOutletMap, futurePath: ActivatedRouteSnapshot[]): void;
    private deactivateOutletAndItChildren(route, outlet);
    private deactivateOutletMap(outletMap);
    private runCanActivate(future);
    private runCanActivateChild(path);
    private extractCanActivateChild(p);
    private runCanDeactivate(component, curr);
    private runResolve(future);
    private resolveNode(resolve, future);
    private getToken(token, snapshot);
}
