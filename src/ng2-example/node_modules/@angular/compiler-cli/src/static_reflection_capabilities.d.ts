/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { GetterFn, MethodFn, SetterFn } from './private_import_core';
import { StaticReflector } from './static_reflector';
export declare class StaticAndDynamicReflectionCapabilities {
    private staticDelegate;
    static install(staticDelegate: StaticReflector): void;
    private dynamicDelegate;
    constructor(staticDelegate: StaticReflector);
    isReflectionEnabled(): boolean;
    factory(type: any): Function;
    interfaces(type: any): any[];
    hasLifecycleHook(type: any, lcInterface: any, lcProperty: string): boolean;
    parameters(type: any): any[][];
    annotations(type: any): any[];
    propMetadata(typeOrFunc: any): {
        [key: string]: any[];
    };
    getter(name: string): GetterFn;
    setter(name: string): SetterFn;
    method(name: string): MethodFn;
    importUri(type: any): string;
    resolveIdentifier(name: string, moduleUrl: string, runtime: any): any;
    resolveEnum(enumIdentifier: any, name: string): any;
}
