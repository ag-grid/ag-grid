"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleRegistry = void 0;
const moduleNames_1 = require("./moduleNames");
const function_1 = require("../utils/function");
const generic_1 = require("../utils/generic");
class ModuleRegistry {
    /**
     * Globally register the given module for all grids.
     * @param module - module to register
     */
    static register(module) {
        ModuleRegistry.__register(module, true, undefined);
    }
    /**
     * Globally register the given modules for all grids.
     * @param modules - modules to register
     */
    static registerModules(modules) {
        ModuleRegistry.__registerModules(modules, true, undefined);
    }
    /** AG GRID INTERNAL - Module registration helper. */
    static __register(module, moduleBased, gridId) {
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
    }
    /** AG GRID INTERNAL - Unregister grid scoped module. */
    static __unRegisterGridModules(gridId) {
        delete ModuleRegistry.gridModulesMap[gridId];
    }
    /** AG GRID INTERNAL - Module registration helper. */
    static __registerModules(modules, moduleBased, gridId) {
        ModuleRegistry.setModuleBased(moduleBased);
        if (!modules) {
            return;
        }
        modules.forEach(module => ModuleRegistry.__register(module, moduleBased, gridId));
    }
    static isValidModuleVersion(module) {
        const [moduleMajor, moduleMinor] = module.version.split('.') || [];
        const [currentModuleMajor, currentModuleMinor] = ModuleRegistry.currentModuleVersion.split('.') || [];
        return moduleMajor === currentModuleMajor && moduleMinor === currentModuleMinor;
    }
    static runVersionChecks(module) {
        if (!ModuleRegistry.currentModuleVersion) {
            ModuleRegistry.currentModuleVersion = module.version;
        }
        if (!module.version) {
            console.error(`AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '${module.moduleName}' is incompatible. Please update all modules to the same version.`);
        }
        else if (!ModuleRegistry.isValidModuleVersion(module)) {
            console.error(`AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '${module.moduleName}' is version ${module.version} but the other modules are version ${this.currentModuleVersion}. Please update all modules to the same version.`);
        }
        if (module.validate) {
            const result = module.validate();
            if (!result.isValid) {
                const errorResult = result;
                console.error(`AG Grid: ${errorResult.message}`);
            }
        }
    }
    static setModuleBased(moduleBased) {
        if (ModuleRegistry.moduleBased === undefined) {
            ModuleRegistry.moduleBased = moduleBased;
        }
        else {
            if (ModuleRegistry.moduleBased !== moduleBased) {
                (0, function_1.doOnce)(() => {
                    console.warn(`AG Grid: You are mixing modules (i.e. @ag-grid-community/core) and packages (ag-grid-community) - you can only use one or the other of these mechanisms.`);
                    console.warn('Please see https://www.ag-grid.com/javascript-grid/packages-modules/ for more information.');
                }, 'ModulePackageCheck');
            }
        }
    }
    /**
     * AG GRID INTERNAL - Set if files are being served from a single UMD bundle to provide accurate enterprise upgrade steps.
     */
    static __setIsBundled() {
        ModuleRegistry.isBundled = true;
    }
    /** AG GRID INTERNAL - Assert a given module has been register, globally or individually with this grid. */
    static __assertRegistered(moduleName, reason, gridId) {
        var _a;
        if (this.__isRegistered(moduleName, gridId)) {
            return true;
        }
        const warningKey = reason + moduleName;
        let warningMessage;
        if (ModuleRegistry.isBundled) {
            {
                warningMessage =
                    `AG Grid: unable to use ${reason} as 'ag-grid-enterprise' has not been loaded. Check you are using the Enterprise bundle:
        
        <script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@AG_GRID_VERSION/dist/ag-grid-enterprise.min.js"></script>
        
For more info see: https://ag-grid.com/javascript-data-grid/getting-started/#getting-started-with-ag-grid-enterprise`;
            }
        }
        else if (ModuleRegistry.moduleBased || ModuleRegistry.moduleBased === undefined) {
            let modName = (_a = Object.entries(moduleNames_1.ModuleNames).find(([k, v]) => v === moduleName)) === null || _a === void 0 ? void 0 : _a[0];
            warningMessage =
                `AG Grid: unable to use ${reason} as the ${modName} is not registered${ModuleRegistry.areGridScopedModules ? ` for gridId: ${gridId}` : ''}. Check if you have registered the module:
           
    import { ModuleRegistry } from '@ag-grid-community/core';
    import { ${modName} } from '${moduleName}';
    
    ModuleRegistry.registerModules([ ${modName} ]);

For more info see: https://www.ag-grid.com/javascript-grid/modules/`;
        }
        else {
            warningMessage =
                `AG Grid: unable to use ${reason} as package 'ag-grid-enterprise' has not been imported. Check that you have imported the package:
            
    import 'ag-grid-enterprise';
            
For more info see: https://www.ag-grid.com/javascript-grid/packages/`;
        }
        (0, function_1.doOnce)(() => {
            console.warn(warningMessage);
        }, warningKey);
        return false;
    }
    /** AG GRID INTERNAL - Is the given module registered, globally or individually with this grid. */
    static __isRegistered(moduleName, gridId) {
        var _a;
        return !!ModuleRegistry.globalModulesMap[moduleName] || !!((_a = ModuleRegistry.gridModulesMap[gridId]) === null || _a === void 0 ? void 0 : _a[moduleName]);
    }
    /** AG GRID INTERNAL - Get all registered modules globally / individually for this grid. */
    static __getRegisteredModules(gridId) {
        return [...(0, generic_1.values)(ModuleRegistry.globalModulesMap), ...(0, generic_1.values)(ModuleRegistry.gridModulesMap[gridId] || {})];
    }
    /** AG GRID INTERNAL - Get the list of modules registered individually for this grid. */
    static __getGridRegisteredModules(gridId) {
        var _a;
        return (0, generic_1.values)((_a = ModuleRegistry.gridModulesMap[gridId]) !== null && _a !== void 0 ? _a : {}) || [];
    }
    /** INTERNAL */
    static __isPackageBased() {
        return !ModuleRegistry.moduleBased;
    }
}
exports.ModuleRegistry = ModuleRegistry;
// having in a map a) removes duplicates and b) allows fast lookup
ModuleRegistry.globalModulesMap = {};
ModuleRegistry.gridModulesMap = {};
ModuleRegistry.areGridScopedModules = false;
