/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OpaqueToken } from './di';
/**
 * A DI Token representing a unique string id assigned to the application by Angular and used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated} is being used.
 *
 * If you need to avoid randomly generated value to be used as an application id, you can provide
 * a custom value via a DI provider <!-- TODO: provider --> configuring the root {@link Injector}
 * using this token.
 * @experimental
 */
export declare const APP_ID: any;
export declare function _appIdRandomProviderFactory(): string;
/**
 * Providers that will generate a random APP_ID_TOKEN.
 * @experimental
 */
export declare const APP_ID_RANDOM_PROVIDER: {
    provide: any;
    useFactory: () => string;
    deps: any[];
};
/**
 * A function that will be executed when a platform is initialized.
 * @experimental
 */
export declare const PLATFORM_INITIALIZER: any;
/**
 * All callbacks provided via this token will be called for every component that is bootstrapped.
 * Signature of the callback:
 *
 * `(componentRef: ComponentRef) => void`.
 *
 * @experimental
 */
export declare const APP_BOOTSTRAP_LISTENER: OpaqueToken;
/**
 * A token which indicates the root directory of the application
 * @experimental
 */
export declare const PACKAGE_ROOT_URL: any;
