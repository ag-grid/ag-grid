/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Type } from '@angular/core';
import * as angular from './angular_js';
export declare class UpgradeNg1ComponentAdapterBuilder {
    name: string;
    type: Type<any>;
    inputs: string[];
    inputsRename: string[];
    outputs: string[];
    outputsRename: string[];
    propertyOutputs: string[];
    checkProperties: string[];
    propertyMap: {
        [name: string]: string;
    };
    linkFn: angular.ILinkFn;
    directive: angular.IDirective;
    $controller: angular.IControllerService;
    constructor(name: string);
    extractDirective(injector: angular.IInjectorService): angular.IDirective;
    private notSupported(feature);
    extractBindings(): void;
    compileTemplate(compile: angular.ICompileService, templateCache: angular.ITemplateCacheService, httpBackend: angular.IHttpBackendService): Promise<angular.ILinkFn>;
    /**
     * Upgrade ng1 components into Angular 2.
     */
    static resolve(exportedComponents: {
        [name: string]: UpgradeNg1ComponentAdapterBuilder;
    }, injector: angular.IInjectorService): Promise<angular.ILinkFn[]>;
}
