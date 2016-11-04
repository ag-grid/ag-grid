/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Type } from '@angular/core';
import { ReflectorReader } from './private_import_core';
export declare class DirectiveResolver {
    private _reflector;
    constructor(_reflector?: ReflectorReader);
    /**
     * Return {@link Directive} for a given `Type`.
     */
    resolve(type: Type<any>, throwIfNotFound?: boolean): Directive;
    private _mergeWithPropertyMetadata(dm, propertyMetadata, directiveType);
    private _extractPublicName(def);
    private _merge(directive, inputs, outputs, host, queries, directiveType);
}
