import { LocationStrategy } from './location_strategy';
import { LocationChangeListener, PlatformLocation } from './platform_location';
/**
 * `HashLocationStrategy` is a {@link LocationStrategy} used to configure the
 * {@link Location} service to represent its state in the
 * [hash fragment](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax)
 * of the browser's URL.
 *
 * For instance, if you call `location.go('/foo')`, the browser's URL will become
 * `example.com#/foo`.
 *
 * ### Example
 *
 * ```
 * import {Component, NgModule} from '@angular/core';
 * import {
 *   LocationStrategy,
 *   HashLocationStrategy
 * } from '@angular/common';
 *
 * @NgModule({
 *   providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}]
 * })
 * class AppModule {}
 * ```
 *
 * @stable
 */
export declare class HashLocationStrategy extends LocationStrategy {
    private _platformLocation;
    private _baseHref;
    constructor(_platformLocation: PlatformLocation, _baseHref?: string);
    onPopState(fn: LocationChangeListener): void;
    getBaseHref(): string;
    path(includeHash?: boolean): string;
    prepareExternalUrl(internal: string): string;
    pushState(state: any, title: string, path: string, queryParams: string): void;
    replaceState(state: any, title: string, path: string, queryParams: string): void;
    forward(): void;
    back(): void;
}
