/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe, Type } from '@angular/core';
import { ReflectorReader } from './private_import_core';
/**
 * Resolve a `Type` for {@link Pipe}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export declare class PipeResolver {
    private _reflector;
    constructor(_reflector?: ReflectorReader);
    /**
     * Return {@link Pipe} for a given `Type`.
     */
    resolve(type: Type<any>, throwIfNotFound?: boolean): Pipe;
}
