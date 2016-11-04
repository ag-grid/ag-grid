/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementSchemaRegistry } from '@angular/compiler';
import { SchemaMetadata, SecurityContext } from '@angular/core';
export declare class MockSchemaRegistry implements ElementSchemaRegistry {
    existingProperties: {
        [key: string]: boolean;
    };
    attrPropMapping: {
        [key: string]: string;
    };
    existingElements: {
        [key: string]: boolean;
    };
    invalidProperties: Array<string>;
    invalidAttributes: Array<string>;
    constructor(existingProperties: {
        [key: string]: boolean;
    }, attrPropMapping: {
        [key: string]: string;
    }, existingElements: {
        [key: string]: boolean;
    }, invalidProperties: Array<string>, invalidAttributes: Array<string>);
    hasProperty(tagName: string, property: string, schemas: SchemaMetadata[]): boolean;
    hasElement(tagName: string, schemaMetas: SchemaMetadata[]): boolean;
    allKnownElementNames(): string[];
    securityContext(selector: string, property: string, isAttribute: boolean): SecurityContext;
    getMappedPropName(attrName: string): string;
    getDefaultComponentElementName(): string;
    validateProperty(name: string): {
        error: boolean;
        msg?: string;
    };
    validateAttribute(name: string): {
        error: boolean;
        msg?: string;
    };
}
