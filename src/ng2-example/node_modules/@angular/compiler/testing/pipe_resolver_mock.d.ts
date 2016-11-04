/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PipeResolver } from '@angular/compiler';
import { Injector, Pipe, Type } from '@angular/core';
export declare class MockPipeResolver extends PipeResolver {
    private _injector;
    private _pipes;
    constructor(_injector: Injector);
    private _compiler;
    private _clearCacheFor(pipe);
    /**
     * Overrides the {@link Pipe} for a pipe.
     */
    setPipe(type: Type<any>, metadata: Pipe): void;
    /**
     * Returns the {@link Pipe} for a pipe:
     * - Set the {@link Pipe} to the overridden view when it exists or fallback to the
     * default
     * `PipeResolver`, see `setPipe`.
     */
    resolve(type: Type<any>, throwIfNotFound?: boolean): Pipe;
}
