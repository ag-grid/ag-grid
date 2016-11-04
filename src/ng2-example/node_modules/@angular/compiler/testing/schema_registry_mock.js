/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SecurityContext } from '@angular/core';
export var MockSchemaRegistry = (function () {
    function MockSchemaRegistry(existingProperties, attrPropMapping, existingElements, invalidProperties, invalidAttributes) {
        this.existingProperties = existingProperties;
        this.attrPropMapping = attrPropMapping;
        this.existingElements = existingElements;
        this.invalidProperties = invalidProperties;
        this.invalidAttributes = invalidAttributes;
    }
    MockSchemaRegistry.prototype.hasProperty = function (tagName, property, schemas) {
        var value = this.existingProperties[property];
        return value === void 0 ? true : value;
    };
    MockSchemaRegistry.prototype.hasElement = function (tagName, schemaMetas) {
        var value = this.existingElements[tagName.toLowerCase()];
        return value === void 0 ? true : value;
    };
    MockSchemaRegistry.prototype.allKnownElementNames = function () { return Object.keys(this.existingElements); };
    MockSchemaRegistry.prototype.securityContext = function (selector, property, isAttribute) {
        return SecurityContext.NONE;
    };
    MockSchemaRegistry.prototype.getMappedPropName = function (attrName) { return this.attrPropMapping[attrName] || attrName; };
    MockSchemaRegistry.prototype.getDefaultComponentElementName = function () { return 'ng-component'; };
    MockSchemaRegistry.prototype.validateProperty = function (name) {
        if (this.invalidProperties.indexOf(name) > -1) {
            return { error: true, msg: "Binding to property '" + name + "' is disallowed for security reasons" };
        }
        else {
            return { error: false };
        }
    };
    MockSchemaRegistry.prototype.validateAttribute = function (name) {
        if (this.invalidAttributes.indexOf(name) > -1) {
            return {
                error: true,
                msg: "Binding to attribute '" + name + "' is disallowed for security reasons"
            };
        }
        else {
            return { error: false };
        }
    };
    return MockSchemaRegistry;
}());
//# sourceMappingURL=schema_registry_mock.js.map