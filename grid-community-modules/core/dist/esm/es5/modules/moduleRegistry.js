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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { ModuleNames } from "./moduleNames";
import { doOnce } from "../utils/function";
import { values } from "../utils/generic";
var ModuleRegistry = /** @class */ (function () {
    function ModuleRegistry() {
    }
    /**
     * Globally register the given module for all grids.
     * @param module - module to register
     */
    ModuleRegistry.register = function (module) {
        ModuleRegistry.__register(module, true, undefined);
    };
    /**
     * Globally register the given modules for all grids.
     * @param modules - modules to register
     */
    ModuleRegistry.registerModules = function (modules) {
        ModuleRegistry.__registerModules(modules, true, undefined);
    };
    /** AG GRID INTERNAL - Module registration helper. */
    ModuleRegistry.__register = function (module, moduleBased, gridId) {
        ModuleRegistry.runVersionChecks(module);
        if (gridId !== undefined) {
            ModuleRegistry.areGridScopedModules = true;
            if (ModuleRegistry.gridModulesMap[gridId] === undefined) {
                ModuleRegistry.gridModulesMap[gridId] = {};
            }
            ModuleRegistry.gridModulesMap[gridId][module.moduleName] = module;
        }
        else {
            ModuleRegistry.globalModulesMap[module.moduleName] = module;
        }
        ModuleRegistry.setModuleBased(moduleBased);
    };
    /** AG GRID INTERNAL - Unregister grid scoped module. */
    ModuleRegistry.__unRegisterGridModules = function (gridId) {
        delete ModuleRegistry.gridModulesMap[gridId];
    };
    /** AG GRID INTERNAL - Module registration helper. */
    ModuleRegistry.__registerModules = function (modules, moduleBased, gridId) {
        ModuleRegistry.setModuleBased(moduleBased);
        if (!modules) {
            return;
        }
        modules.forEach(function (module) { return ModuleRegistry.__register(module, moduleBased, gridId); });
    };
    ModuleRegistry.isValidModuleVersion = function (module) {
        var _a = __read(module.version.split('.') || [], 2), moduleMajor = _a[0], moduleMinor = _a[1];
        var _b = __read(ModuleRegistry.currentModuleVersion.split('.') || [], 2), currentModuleMajor = _b[0], currentModuleMinor = _b[1];
        return moduleMajor === currentModuleMajor && moduleMinor === currentModuleMinor;
    };
    ModuleRegistry.runVersionChecks = function (module) {
        if (!ModuleRegistry.currentModuleVersion) {
            ModuleRegistry.currentModuleVersion = module.version;
        }
        if (!module.version) {
            console.error("AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '".concat(module.moduleName, "' is incompatible. Please update all modules to the same version."));
        }
        else if (!ModuleRegistry.isValidModuleVersion(module)) {
            console.error("AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '".concat(module.moduleName, "' is version ").concat(module.version, " but the other modules are version ").concat(this.currentModuleVersion, ". Please update all modules to the same version."));
        }
        if (module.validate) {
            var result = module.validate();
            if (!result.isValid) {
                var errorResult = result;
                console.error("AG Grid: ".concat(errorResult.message));
            }
        }
    };
    ModuleRegistry.setModuleBased = function (moduleBased) {
        if (ModuleRegistry.moduleBased === undefined) {
            ModuleRegistry.moduleBased = moduleBased;
        }
        else {
            if (ModuleRegistry.moduleBased !== moduleBased) {
                doOnce(function () {
                    console.warn("AG Grid: You are mixing modules (i.e. @ag-grid-community/core) and packages (ag-grid-community) - you can only use one or the other of these mechanisms.");
                    console.warn('Please see https://www.ag-grid.com/javascript-grid/packages-modules/ for more information.');
                }, 'ModulePackageCheck');
            }
        }
    };
    /**
     * AG GRID INTERNAL - Set if files are being served from a single UMD bundle to provide accurate enterprise upgrade steps.
     */
    ModuleRegistry.__setIsBundled = function () {
        ModuleRegistry.isBundled = true;
    };
    /** AG GRID INTERNAL - Assert a given module has been register, globally or individually with this grid. */
    ModuleRegistry.__assertRegistered = function (moduleName, reason, gridId) {
        var _a;
        if (this.__isRegistered(moduleName, gridId)) {
            return true;
        }
        var warningKey = reason + moduleName;
        var warningMessage;
        if (ModuleRegistry.isBundled) {
            {
                warningMessage =
                    "AG Grid: unable to use ".concat(reason, " as 'ag-grid-enterprise' has not been loaded. Check you are using the Enterprise bundle:\n        \n        <script src=\"https://cdn.jsdelivr.net/npm/ag-grid-enterprise@AG_GRID_VERSION/dist/ag-grid-enterprise.min.js\"></script>\n        \nFor more info see: https://ag-grid.com/javascript-data-grid/getting-started/#getting-started-with-ag-grid-enterprise");
            }
        }
        else if (ModuleRegistry.moduleBased || ModuleRegistry.moduleBased === undefined) {
            var modName = (_a = Object.entries(ModuleNames).find(function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                return v === moduleName;
            })) === null || _a === void 0 ? void 0 : _a[0];
            warningMessage =
                "AG Grid: unable to use ".concat(reason, " as the ").concat(modName, " is not registered").concat(ModuleRegistry.areGridScopedModules ? " for gridId: ".concat(gridId) : '', ". Check if you have registered the module:\n           \n    import { ModuleRegistry } from '@ag-grid-community/core';\n    import { ").concat(modName, " } from '").concat(moduleName, "';\n    \n    ModuleRegistry.registerModules([ ").concat(modName, " ]);\n\nFor more info see: https://www.ag-grid.com/javascript-grid/modules/");
        }
        else {
            warningMessage =
                "AG Grid: unable to use ".concat(reason, " as package 'ag-grid-enterprise' has not been imported. Check that you have imported the package:\n            \n    import 'ag-grid-enterprise';\n            \nFor more info see: https://www.ag-grid.com/javascript-grid/packages/");
        }
        doOnce(function () {
            console.warn(warningMessage);
        }, warningKey);
        return false;
    };
    /** AG GRID INTERNAL - Is the given module registered, globally or individually with this grid. */
    ModuleRegistry.__isRegistered = function (moduleName, gridId) {
        var _a;
        return !!ModuleRegistry.globalModulesMap[moduleName] || !!((_a = ModuleRegistry.gridModulesMap[gridId]) === null || _a === void 0 ? void 0 : _a[moduleName]);
    };
    /** AG GRID INTERNAL - Get all registered modules globally / individually for this grid. */
    ModuleRegistry.__getRegisteredModules = function (gridId) {
        return __spreadArray(__spreadArray([], __read(values(ModuleRegistry.globalModulesMap)), false), __read(values(ModuleRegistry.gridModulesMap[gridId] || {})), false);
    };
    /** AG GRID INTERNAL - Get the list of modules registered individually for this grid. */
    ModuleRegistry.__getGridRegisteredModules = function (gridId) {
        var _a;
        return values((_a = ModuleRegistry.gridModulesMap[gridId]) !== null && _a !== void 0 ? _a : {}) || [];
    };
    /** INTERNAL */
    ModuleRegistry.__isPackageBased = function () {
        return !ModuleRegistry.moduleBased;
    };
    // having in a map a) removes duplicates and b) allows fast lookup
    ModuleRegistry.globalModulesMap = {};
    ModuleRegistry.gridModulesMap = {};
    ModuleRegistry.areGridScopedModules = false;
    return ModuleRegistry;
}());
export { ModuleRegistry };
