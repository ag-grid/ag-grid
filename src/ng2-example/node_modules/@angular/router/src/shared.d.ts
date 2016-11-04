
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @whatItDoes Name of the primary outlet.
 *
 * @stable
 */
export declare const PRIMARY_OUTLET: string;
/**
 * A collection of parameters.
 *
 * @stable
 */
export declare type Params = {
    [key: string]: any;
};
export declare class NavigationCancelingError extends Error {
    message: string;
    stack: any;
    constructor(message: string);
    toString(): string;
}
