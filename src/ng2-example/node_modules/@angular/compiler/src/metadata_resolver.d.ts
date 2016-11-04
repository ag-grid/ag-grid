/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationEntryMetadata, AnimationMetadata, AnimationStateMetadata, AnimationStyleMetadata, Provider, Query, Type } from '@angular/core';
import * as cpl from './compile_metadata';
import { DirectiveResolver } from './directive_resolver';
import { NgModuleResolver } from './ng_module_resolver';
import { PipeResolver } from './pipe_resolver';
import { ReflectorReader } from './private_import_core';
import { ElementSchemaRegistry } from './schema/element_schema_registry';
export declare class CompileMetadataResolver {
    private _ngModuleResolver;
    private _directiveResolver;
    private _pipeResolver;
    private _schemaRegistry;
    private _reflector;
    private _directiveCache;
    private _pipeCache;
    private _ngModuleCache;
    private _ngModuleOfTypes;
    private _anonymousTypes;
    private _anonymousTypeIndex;
    constructor(_ngModuleResolver: NgModuleResolver, _directiveResolver: DirectiveResolver, _pipeResolver: PipeResolver, _schemaRegistry: ElementSchemaRegistry, _reflector?: ReflectorReader);
    private sanitizeTokenName(token);
    clearCacheFor(type: Type<any>): void;
    clearCache(): void;
    getAnimationEntryMetadata(entry: AnimationEntryMetadata): cpl.CompileAnimationEntryMetadata;
    getAnimationStateMetadata(value: AnimationStateMetadata): cpl.CompileAnimationStateMetadata;
    getAnimationStyleMetadata(value: AnimationStyleMetadata): cpl.CompileAnimationStyleMetadata;
    getAnimationMetadata(value: AnimationMetadata): cpl.CompileAnimationMetadata;
    getDirectiveMetadata(directiveType: any, throwIfNotFound?: boolean): cpl.CompileDirectiveMetadata;
    getNgModuleMetadata(moduleType: any, throwIfNotFound?: boolean): cpl.CompileNgModuleMetadata;
    private _verifyModule(moduleMeta);
    private _getTypeDescriptor(type);
    private _addTypeToModule(type, moduleType);
    private _getTransitiveNgModuleMetadata(importedModules, exportedModules);
    private _addDirectiveToModule(dirMeta, moduleType, transitiveModule, declaredDirectives, force?);
    private _addPipeToModule(pipeMeta, moduleType, transitiveModule, declaredPipes, force?);
    getTypeMetadata(type: Type<any>, moduleUrl: string, dependencies?: any[]): cpl.CompileTypeMetadata;
    getFactoryMetadata(factory: Function, moduleUrl: string, dependencies?: any[]): cpl.CompileFactoryMetadata;
    getPipeMetadata(pipeType: Type<any>, throwIfNotFound?: boolean): cpl.CompilePipeMetadata;
    getDependenciesMetadata(typeOrFunc: Type<any> | Function, dependencies: any[]): cpl.CompileDiDependencyMetadata[];
    getTokenMetadata(token: any): cpl.CompileTokenMetadata;
    getProvidersMetadata(providers: Provider[], targetEntryComponents: cpl.CompileTypeMetadata[], debugInfo?: string): Array<cpl.CompileProviderMetadata | cpl.CompileTypeMetadata | any[]>;
    private _getEntryComponentsFromProvider(provider);
    getProviderMetadata(provider: cpl.ProviderMeta): cpl.CompileProviderMetadata;
    getQueriesMetadata(queries: {
        [key: string]: Query;
    }, isViewQuery: boolean, directiveType: Type<any>): cpl.CompileQueryMetadata[];
    private _queryVarBindings(selector);
    getQueryMetadata(q: Query, propertyName: string, typeOrFunc: Type<any> | Function): cpl.CompileQueryMetadata;
}
