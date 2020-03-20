/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { _ } from "../utils";
var ModuleRegistry = /** @class */ (function () {
    function ModuleRegistry() {
    }
    ModuleRegistry.register = function (module) {
        ModuleRegistry.modulesMap[module.moduleName] = module;
    };
    // noinspection JSUnusedGlobalSymbols
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
        var warningMessage = "ag-Grid: unable to use " + reason + " as module " + moduleName + " is not present. Please see: https://www.ag-grid.com/javascript-grid-modules/";
        _.doOnce(function () {
            console.warn(warningMessage);
        }, warningKey);
        return false;
    };
    ModuleRegistry.isRegistered = function (moduleName) {
        return !!ModuleRegistry.modulesMap[moduleName];
    };
    ModuleRegistry.getRegisteredModules = function () {
        return _.values(ModuleRegistry.modulesMap);
    };
    // having in a map a) removes duplicates and b) allows fast lookup
    ModuleRegistry.modulesMap = {};
    return ModuleRegistry;
}());
export { ModuleRegistry };
