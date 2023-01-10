/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleRegistry = void 0;
var moduleNames_1 = require("./moduleNames");
var function_1 = require("../utils/function");
var generic_1 = require("../utils/generic");
var ModuleRegistry = /** @class */ (function () {
    function ModuleRegistry() {
    }
    ModuleRegistry.register = function (module, moduleBased) {
        if (moduleBased === void 0) { moduleBased = true; }
        ModuleRegistry.runVersionChecks(module);
        ModuleRegistry.modulesMap[module.moduleName] = module;
        ModuleRegistry.setModuleBased(moduleBased);
    };
    ModuleRegistry.runVersionChecks = function (module) {
        if (!ModuleRegistry.currentModuleVersion) {
            ModuleRegistry.currentModuleVersion = module.version;
        }
        if (!module.version) {
            console.error("AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '" + module.moduleName + "' is incompatible. Please update all modules to the same version.");
        }
        else if (module.version !== ModuleRegistry.currentModuleVersion) {
            console.error("AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '" + module.moduleName + "' is version " + module.version + " but the other modules are version " + this.currentModuleVersion + ". Please update all modules to the same version.");
        }
        if (module.validate) {
            var result = module.validate();
            if (!result.isValid) {
                var errorResult = result;
                console.error("AG Grid: " + errorResult.message);
            }
        }
    };
    ModuleRegistry.setModuleBased = function (moduleBased) {
        if (ModuleRegistry.moduleBased === undefined) {
            ModuleRegistry.moduleBased = moduleBased;
        }
        else {
            if (ModuleRegistry.moduleBased !== moduleBased) {
                function_1.doOnce(function () {
                    console.warn("AG Grid: You are mixing modules (i.e. @ag-grid-community/core) and packages (ag-grid-community) - you can only use one or the other of these mechanisms.");
                    console.warn('Please see https://www.ag-grid.com/javascript-grid/packages-modules/ for more information.');
                }, 'ModulePackageCheck');
            }
        }
    };
    // noinspection JSUnusedGlobalSymbols
    ModuleRegistry.registerModules = function (modules, moduleBased) {
        if (moduleBased === void 0) { moduleBased = true; }
        ModuleRegistry.setModuleBased(moduleBased);
        if (!modules) {
            return;
        }
        modules.forEach(function (module) { return ModuleRegistry.register(module, moduleBased); });
    };
    ModuleRegistry.assertRegistered = function (moduleName, reason) {
        var _a;
        if (this.isRegistered(moduleName)) {
            return true;
        }
        var warningKey = reason + moduleName;
        var warningMessage;
        if (ModuleRegistry.moduleBased) {
            var modName = (_a = Object.entries(moduleNames_1.ModuleNames).find(function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                return v === moduleName;
            })) === null || _a === void 0 ? void 0 : _a[0];
            warningMessage =
                "AG Grid: unable to use " + reason + " as the " + modName + " is not registered. Check if you have registered the module:\n           \n    import { ModuleRegistry } from '@ag-grid-community/core';\n    import { " + modName + " } from '" + moduleName + "';\n    \n    ModuleRegistry.registerModules([ " + modName + " ]);\n\nFor more info see: https://www.ag-grid.com/javascript-grid/modules/";
        }
        else {
            warningMessage =
                "AG Grid: unable to use " + reason + " as package 'ag-grid-enterprise' has not been imported. Check that you have imported the package:\n            \n    import 'ag-grid-enterprise';\n            \nFor more info see: https://www.ag-grid.com/javascript-grid/packages/";
        }
        function_1.doOnce(function () {
            console.warn(warningMessage);
        }, warningKey);
        return false;
    };
    ModuleRegistry.isRegistered = function (moduleName) {
        return !!ModuleRegistry.modulesMap[moduleName];
    };
    ModuleRegistry.getRegisteredModules = function () {
        return generic_1.values(ModuleRegistry.modulesMap);
    };
    ModuleRegistry.isPackageBased = function () {
        return !ModuleRegistry.moduleBased;
    };
    // having in a map a) removes duplicates and b) allows fast lookup
    ModuleRegistry.modulesMap = {};
    return ModuleRegistry;
}());
exports.ModuleRegistry = ModuleRegistry;
