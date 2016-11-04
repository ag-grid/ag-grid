/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ErrorHandler } from '../src/error_handler';
import { ApplicationInitStatus } from './application_init';
import { ChangeDetectorRef } from './change_detection/change_detector_ref';
import { Console } from './console';
import { Injector, Provider } from './di';
import { CompilerOptions } from './linker/compiler';
import { ComponentFactory, ComponentRef } from './linker/component_factory';
import { ComponentFactoryResolver } from './linker/component_factory_resolver';
import { NgModuleFactory, NgModuleRef } from './linker/ng_module_factory';
import { Testability, TestabilityRegistry } from './testability/testability';
import { Type } from './type';
import { NgZone } from './zone/ng_zone';
/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 *
 * @stable
 */
export declare function enableProdMode(): void;
/**
 * Returns whether Angular is in development mode. After called once,
 * the value is locked and won't change any more.
 *
 * By default, this is true, unless a user calls `enableProdMode` before calling this.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export declare function isDevMode(): boolean;
/**
 * Creates a platform.
 * Platforms have to be eagerly created via this function.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export declare function createPlatform(injector: Injector): PlatformRef;
/**
 * Creates a factory for a platform
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export declare function createPlatformFactory(parentPlaformFactory: (extraProviders?: Provider[]) => PlatformRef, name: string, providers?: Provider[]): (extraProviders?: Provider[]) => PlatformRef;
/**
 * Checks that there currently is a platform
 * which contains the given token as a provider.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export declare function assertPlatform(requiredToken: any): PlatformRef;
/**
 * Destroy the existing platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export declare function destroyPlatform(): void;
/**
 * Returns the current platform.
 *
 * @experimental APIs related to application bootstrap are currently under review.
 */
export declare function getPlatform(): PlatformRef;
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link createPlatform}().
 *
 * @stable
 */
export declare abstract class PlatformRef {
    /**
     * Creates an instance of an `@NgModule` for the given platform
     * for offline compilation.
     *
     * ## Simple Example
     *
     * ```typescript
     * my_module.ts:
     *
     * @NgModule({
     *   imports: [BrowserModule]
     * })
     * class MyModule {}
     *
     * main.ts:
     * import {MyModuleNgFactory} from './my_module.ngfactory';
     * import {platformBrowser} from '@angular/platform-browser';
     *
     * let moduleRef = platformBrowser().bootstrapModuleFactory(MyModuleNgFactory);
     * ```
     *
     * @experimental APIs related to application bootstrap are currently under review.
     */
    bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>>;
    /**
     * Creates an instance of an `@NgModule` for a given platform using the given runtime compiler.
     *
     * ## Simple Example
     *
     * ```typescript
     * @NgModule({
     *   imports: [BrowserModule]
     * })
     * class MyModule {}
     *
     * let moduleRef = platformBrowser().bootstrapModule(MyModule);
     * ```
     * @stable
     */
    bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: CompilerOptions | CompilerOptions[]): Promise<NgModuleRef<M>>;
    /**
     * Register a listener to be called when the platform is disposed.
     */
    abstract onDestroy(callback: () => void): void;
    /**
     * Retrieve the platform {@link Injector}, which is the parent injector for
     * every Angular application on the page and provides singleton providers.
     */
    injector: Injector;
    /**
     * Destroy the Angular platform and all Angular applications on the page.
     */
    abstract destroy(): void;
    destroyed: boolean;
}
export declare class PlatformRef_ extends PlatformRef {
    private _injector;
    private _modules;
    private _destroyListeners;
    private _destroyed;
    constructor(_injector: Injector);
    onDestroy(callback: () => void): void;
    injector: Injector;
    destroyed: boolean;
    destroy(): void;
    bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>): Promise<NgModuleRef<M>>;
    private _bootstrapModuleFactoryWithZone<M>(moduleFactory, ngZone);
    bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: CompilerOptions | CompilerOptions[]): Promise<NgModuleRef<M>>;
    private _bootstrapModuleWithZone<M>(moduleType, compilerOptions, ngZone, componentFactoryCallback?);
    private _moduleDoBootstrap(moduleRef);
}
/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for {@link bootstrap}.
 *
 * @stable
 */
export declare abstract class ApplicationRef {
    /**
     * Bootstrap a new component at the root level of the application.
     *
     * ### Bootstrap process
     *
     * When bootstrapping a new root component into an application, Angular mounts the
     * specified application component onto DOM elements identified by the [componentType]'s
     * selector and kicks off automatic change detection to finish initializing the component.
     *
     * ### Example
     * {@example core/ts/platform/platform.ts region='longform'}
     */
    abstract bootstrap<C>(componentFactory: ComponentFactory<C> | Type<C>): ComponentRef<C>;
    /**
     * Invoke this method to explicitly process change detection and its side-effects.
     *
     * In development mode, `tick()` also performs a second change detection cycle to ensure that no
     * further changes are detected. If additional changes are picked up during this second cycle,
     * bindings in the app have side-effects that cannot be resolved in a single change detection
     * pass.
     * In this case, Angular throws an error, since an Angular application can only have one change
     * detection pass during which all change detection must complete.
     */
    abstract tick(): void;
    /**
     * Get a list of component types registered to this application.
     * This list is populated even before the component is created.
     */
    componentTypes: Type<any>[];
    /**
     * Get a list of components registered to this application.
     */
    components: ComponentRef<any>[];
}
export declare class ApplicationRef_ extends ApplicationRef {
    private _zone;
    private _console;
    private _injector;
    private _exceptionHandler;
    private _componentFactoryResolver;
    private _initStatus;
    private _testabilityRegistry;
    private _testability;
    private _bootstrapListeners;
    private _rootComponents;
    private _rootComponentTypes;
    private _changeDetectorRefs;
    private _runningTick;
    private _enforceNoNewChanges;
    constructor(_zone: NgZone, _console: Console, _injector: Injector, _exceptionHandler: ErrorHandler, _componentFactoryResolver: ComponentFactoryResolver, _initStatus: ApplicationInitStatus, _testabilityRegistry: TestabilityRegistry, _testability: Testability);
    registerChangeDetector(changeDetector: ChangeDetectorRef): void;
    unregisterChangeDetector(changeDetector: ChangeDetectorRef): void;
    bootstrap<C>(componentOrFactory: ComponentFactory<C> | Type<C>): ComponentRef<C>;
    tick(): void;
    ngOnDestroy(): void;
    componentTypes: Type<any>[];
    components: ComponentRef<any>[];
}
