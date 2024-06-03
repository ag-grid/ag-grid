import type { Module, ModuleValidationInvalidResult } from '../interfaces/iModule';
import { _doOnce } from '../utils/function';
import { _values } from '../utils/generic';
import { ModuleNames } from './moduleNames';

export class ModuleRegistry {
    // having in a map a) removes duplicates and b) allows fast lookup
    private static globalModulesMap: { [name: string]: Module } = {};
    private static gridModulesMap: { [gridId: string]: { [name: string]: Module } } = {};
    private static moduleBased: boolean | undefined;
    private static currentModuleVersion: string;
    private static isBundled: boolean | undefined;
    private static areGridScopedModules = false;

    /**
     * Globally register the given module for all grids.
     * @param module - module to register
     */
    public static register(module: Module): void {
        ModuleRegistry.__register(module, true, undefined);
    }
    /**
     * Globally register the given modules for all grids.
     * @param modules - modules to register
     */
    public static registerModules(modules: Module[]): void {
        ModuleRegistry.__registerModules(modules, true, undefined);
    }

    /** AG GRID INTERNAL - Module registration helper. */
    public static __register(module: Module, moduleBased: boolean, gridId: string | undefined): void {
        ModuleRegistry.runVersionChecks(module);

        if (gridId !== undefined) {
            ModuleRegistry.areGridScopedModules = true;
            if (ModuleRegistry.gridModulesMap[gridId] === undefined) {
                ModuleRegistry.gridModulesMap[gridId] = {};
            }
            ModuleRegistry.gridModulesMap[gridId][module.moduleName] = module;
        } else {
            ModuleRegistry.globalModulesMap[module.moduleName] = module;
        }

        ModuleRegistry.setModuleBased(moduleBased);
    }

    /** AG GRID INTERNAL - Unregister grid scoped module. */
    public static __unRegisterGridModules(gridId: string): void {
        delete ModuleRegistry.gridModulesMap[gridId];
    }
    /** AG GRID INTERNAL - Module registration helper. */
    public static __registerModules(modules: Module[], moduleBased: boolean, gridId: string | undefined): void {
        ModuleRegistry.setModuleBased(moduleBased);

        if (!modules) {
            return;
        }
        modules.forEach((module) => ModuleRegistry.__register(module, moduleBased, gridId));
    }

    private static isValidModuleVersion(module: Module): boolean {
        const [moduleMajor, moduleMinor] = module.version.split('.') || [];
        const [currentModuleMajor, currentModuleMinor] = ModuleRegistry.currentModuleVersion.split('.') || [];

        return moduleMajor === currentModuleMajor && moduleMinor === currentModuleMinor;
    }

    private static runVersionChecks(module: Module) {
        if (!ModuleRegistry.currentModuleVersion) {
            ModuleRegistry.currentModuleVersion = module.version;
        }

        if (!module.version) {
            console.error(
                `AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '${module.moduleName}' is incompatible. Please update all modules to the same version.`
            );
        } else if (!ModuleRegistry.isValidModuleVersion(module)) {
            console.error(
                `AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '${module.moduleName}' is version ${module.version} but the other modules are version ${this.currentModuleVersion}. Please update all modules to the same version.`
            );
        }

        if (module.validate) {
            const result = module.validate();
            if (!result.isValid) {
                const errorResult = result as ModuleValidationInvalidResult;
                console.error(`AG Grid: ${errorResult.message}`);
            }
        }
    }

    private static setModuleBased(moduleBased: boolean) {
        if (ModuleRegistry.moduleBased === undefined) {
            ModuleRegistry.moduleBased = moduleBased;
        } else {
            if (ModuleRegistry.moduleBased !== moduleBased) {
                _doOnce(() => {
                    console.warn(
                        `AG Grid: You are mixing modules (i.e. @ag-grid-community/core) and packages (ag-grid-community) - you can only use one or the other of these mechanisms.`
                    );
                    console.warn('Please see https://www.ag-grid.com/javascript-grid/modules/ for more information.');
                }, 'ModulePackageCheck');
            }
        }
    }

    /**
     * AG GRID INTERNAL - Set if files are being served from a single UMD bundle to provide accurate enterprise upgrade steps.
     */
    public static __setIsBundled() {
        ModuleRegistry.isBundled = true;
    }

    /** AG GRID INTERNAL - Assert a given module has been register, globally or individually with this grid. */
    public static __assertRegistered(moduleName: ModuleNames, reason: string, gridId: string): boolean {
        if (this.__isRegistered(moduleName, gridId)) {
            return true;
        }

        const warningKey = reason + moduleName;
        let warningMessage: string;

        if (ModuleRegistry.isBundled) {
            {
                warningMessage = `AG Grid: unable to use ${reason} as 'ag-grid-enterprise' has not been loaded. Check you are using the Enterprise bundle:
        
        <script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@AG_GRID_VERSION/dist/ag-grid-enterprise.min.js"></script>
        
For more info see: https://ag-grid.com/javascript-data-grid/getting-started/#getting-started-with-ag-grid-enterprise`;
            }
        } else if (ModuleRegistry.moduleBased || ModuleRegistry.moduleBased === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const modName = Object.entries(ModuleNames).find(([k, v]) => v === moduleName)?.[0];
            warningMessage = `AG Grid: unable to use ${reason} as the ${modName} is not registered${ModuleRegistry.areGridScopedModules ? ` for gridId: ${gridId}` : ''}. Check if you have registered the module:
           
    import { ModuleRegistry } from '@ag-grid-community/core';
    import { ${modName} } from '${moduleName}';
    
    ModuleRegistry.registerModules([ ${modName} ]);

For more info see: https://www.ag-grid.com/javascript-grid/modules/`;
        } else {
            warningMessage = `AG Grid: unable to use ${reason} as package 'ag-grid-enterprise' has not been imported. Check that you have imported the package:
            
    import 'ag-grid-enterprise';`;
        }

        _doOnce(() => {
            console.warn(warningMessage);
        }, warningKey);

        return false;
    }

    /** AG GRID INTERNAL - Is the given module registered, globally or individually with this grid. */
    public static __isRegistered(moduleName: ModuleNames, gridId: string): boolean {
        return !!ModuleRegistry.globalModulesMap[moduleName] || !!ModuleRegistry.gridModulesMap[gridId]?.[moduleName];
    }

    /** AG GRID INTERNAL - Get all registered modules globally / individually for this grid. */
    public static __getRegisteredModules(gridId: string): Module[] {
        return [..._values(ModuleRegistry.globalModulesMap), ..._values(ModuleRegistry.gridModulesMap[gridId] || {})];
    }

    /** AG GRID INTERNAL - Get the list of modules registered individually for this grid. */
    public static __getGridRegisteredModules(gridId: string): Module[] {
        return _values(ModuleRegistry.gridModulesMap[gridId] ?? {}) || [];
    }

    /** INTERNAL */
    public static __isPackageBased(): boolean {
        return !ModuleRegistry.moduleBased;
    }
}
