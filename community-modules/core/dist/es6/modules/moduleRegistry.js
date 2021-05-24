/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { doOnce } from "../utils/function";
import { values } from "../utils/generic";
var ModuleRegistry = /** @class */ (function () {
    function ModuleRegistry() {
    }
    ModuleRegistry.register = function (module, moduleBased) {
        if (moduleBased === void 0) { moduleBased = true; }
        ModuleRegistry.modulesMap[module.moduleName] = module;
        if (ModuleRegistry.moduleBased === undefined) {
            ModuleRegistry.moduleBased = moduleBased;
        }
        else {
            if (ModuleRegistry.moduleBased !== moduleBased) {
                doOnce(function () {
                    console.warn("AG Grid: You are mixing modules (i.e. @ag-grid-community/core) and packages (ag-grid-community) - you can only use one or the other of these mechanisms.");
                    console.warn('Please see https://www.ag-grid.com/javascript-table/packages-modules/ for more information.');
                }, 'ModulePackageCheck');
            }
        }
    };
    // noinspection JSUnusedGlobalSymbols
    ModuleRegistry.registerModules = function (modules, moduleBased) {
        if (moduleBased === void 0) { moduleBased = true; }
        if (!modules) {
            return;
        }
        modules.forEach(function (module) { return ModuleRegistry.register(module, moduleBased); });
    };
    ModuleRegistry.assertRegistered = function (moduleName, reason) {
        if (this.isRegistered(moduleName)) {
            return true;
        }
        var warningKey = reason + moduleName;
        var warningMessage = "AG Grid: unable to use " + reason + " as module " + moduleName + " is not present. Please see: https://www.ag-grid.com/javascript-table/modules/";
        doOnce(function () {
            console.warn(warningMessage);
        }, warningKey);
        return false;
    };
    ModuleRegistry.isRegistered = function (moduleName) {
        return !!ModuleRegistry.modulesMap[moduleName];
    };
    ModuleRegistry.getRegisteredModules = function () {
        return values(ModuleRegistry.modulesMap);
    };
    ModuleRegistry.isPackageBased = function () {
        return !ModuleRegistry.moduleBased;
    };
    // having in a map a) removes duplicates and b) allows fast lookup
    ModuleRegistry.modulesMap = {};
    return ModuleRegistry;
}());
export { ModuleRegistry };
