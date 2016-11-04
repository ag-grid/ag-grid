/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Type } from '../type';
import { PlatformReflectionCapabilities } from './platform_reflection_capabilities';
import { ReflectorReader } from './reflector_reader';
import { GetterFn, MethodFn, SetterFn } from './types';
export { PlatformReflectionCapabilities } from './platform_reflection_capabilities';
export { GetterFn, MethodFn, SetterFn } from './types';
/**
 * Provides access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
export declare class Reflector extends ReflectorReader {
    reflectionCapabilities: PlatformReflectionCapabilities;
    constructor(reflectionCapabilities: PlatformReflectionCapabilities);
    updateCapabilities(caps: PlatformReflectionCapabilities): void;
    factory(type: Type<any>): Function;
    parameters(typeOrFunc: Type<any>): any[][];
    annotations(typeOrFunc: Type<any>): any[];
    propMetadata(typeOrFunc: Type<any>): {
        [key: string]: any[];
    };
    hasLifecycleHook(type: any, lcProperty: string): boolean;
    getter(name: string): GetterFn;
    setter(name: string): SetterFn;
    method(name: string): MethodFn;
    importUri(type: any): string;
    resolveIdentifier(name: string, moduleUrl: string, runtime: any): any;
    resolveEnum(identifier: any, name: string): any;
}
