/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var ModuleRegistry = /** @class */ (function () {
    function ModuleRegistry() {
    }
    ModuleRegistry.register = function (module) {
        ModuleRegistry.modulesMap[module.moduleName] = module;
    };
    ModuleRegistry.registerModules = function (modules) {
        if (!modules) {
            return;
        }
        modules.forEach(ModuleRegistry.register);
    };
    ModuleRegistry.assertRegistered = function (moduleName, reason) {
        if (this.isRegistered(moduleName)) {
            return true;
        }
        var warningKey = reason + moduleName;
        var warningMessage = "ag-Grid: unable to use " + reason + " as module " + moduleName + " is not present. "
            + ("You need to load the module with: import \"" + moduleName + "\"");
        utils_1._.doOnce(function () {
            console.warn(warningMessage);
        }, warningKey);
        return false;
    };
    ModuleRegistry.isRegistered = function (moduleName) {
        return !!ModuleRegistry.modulesMap[moduleName];
    };
    ModuleRegistry.getRegisteredModules = function () {
        return utils_1._.values(ModuleRegistry.modulesMap);
    };
    // having in a map a) removes duplicates and b) allows fast lookup
    ModuleRegistry.modulesMap = {};
    return ModuleRegistry;
}());
exports.ModuleRegistry = ModuleRegistry;

//# sourceMappingURL=moduleRegistry.js.map
