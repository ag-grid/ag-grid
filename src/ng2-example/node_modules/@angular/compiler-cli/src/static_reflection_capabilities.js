/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var private_import_core_1 = require('./private_import_core');
var StaticAndDynamicReflectionCapabilities = (function () {
    function StaticAndDynamicReflectionCapabilities(staticDelegate) {
        this.staticDelegate = staticDelegate;
        this.dynamicDelegate = new private_import_core_1.ReflectionCapabilities();
    }
    StaticAndDynamicReflectionCapabilities.install = function (staticDelegate) {
        private_import_core_1.reflector.updateCapabilities(new StaticAndDynamicReflectionCapabilities(staticDelegate));
    };
    StaticAndDynamicReflectionCapabilities.prototype.isReflectionEnabled = function () { return true; };
    StaticAndDynamicReflectionCapabilities.prototype.factory = function (type) { return this.dynamicDelegate.factory(type); };
    StaticAndDynamicReflectionCapabilities.prototype.interfaces = function (type) { return this.dynamicDelegate.interfaces(type); };
    StaticAndDynamicReflectionCapabilities.prototype.hasLifecycleHook = function (type, lcInterface, lcProperty) {
        return isStaticType(type) ?
            this.staticDelegate.hasLifecycleHook(type, lcInterface, lcProperty) :
            this.dynamicDelegate.hasLifecycleHook(type, lcInterface, lcProperty);
    };
    StaticAndDynamicReflectionCapabilities.prototype.parameters = function (type) {
        return isStaticType(type) ? this.staticDelegate.parameters(type) :
            this.dynamicDelegate.parameters(type);
    };
    StaticAndDynamicReflectionCapabilities.prototype.annotations = function (type) {
        return isStaticType(type) ? this.staticDelegate.annotations(type) :
            this.dynamicDelegate.annotations(type);
    };
    StaticAndDynamicReflectionCapabilities.prototype.propMetadata = function (typeOrFunc) {
        return isStaticType(typeOrFunc) ? this.staticDelegate.propMetadata(typeOrFunc) :
            this.dynamicDelegate.propMetadata(typeOrFunc);
    };
    StaticAndDynamicReflectionCapabilities.prototype.getter = function (name) { return this.dynamicDelegate.getter(name); };
    StaticAndDynamicReflectionCapabilities.prototype.setter = function (name) { return this.dynamicDelegate.setter(name); };
    StaticAndDynamicReflectionCapabilities.prototype.method = function (name) { return this.dynamicDelegate.method(name); };
    StaticAndDynamicReflectionCapabilities.prototype.importUri = function (type) { return this.staticDelegate.importUri(type); };
    StaticAndDynamicReflectionCapabilities.prototype.resolveIdentifier = function (name, moduleUrl, runtime) {
        return this.staticDelegate.resolveIdentifier(name, moduleUrl, runtime);
    };
    StaticAndDynamicReflectionCapabilities.prototype.resolveEnum = function (enumIdentifier, name) {
        if (isStaticType(enumIdentifier)) {
            return this.staticDelegate.resolveEnum(enumIdentifier, name);
        }
        else {
            return null;
        }
    };
    return StaticAndDynamicReflectionCapabilities;
}());
exports.StaticAndDynamicReflectionCapabilities = StaticAndDynamicReflectionCapabilities;
function isStaticType(type) {
    return typeof type === 'object' && type.name && type.filePath;
}
//# sourceMappingURL=static_reflection_capabilities.js.map