import { Module, ModuleValidationInvalidResult } from "../interfaces/iModule";
import { ModuleNames } from "./moduleNames";
import { doOnce } from "../utils/function";
import { values } from "../utils/generic";

export class ModuleRegistry {

    // having in a map a) removes duplicates and b) allows fast lookup
    private static globalModulesMap: { [name: string]: Module; } = {};
    private static gridModulesMap: { [gridId: string]: { [name: string]: Module; } } = {}
    private static moduleBased: boolean | undefined;
    private static currentModuleVersion: string;
    private static isBundled: boolean | undefined;
    private static areGridScopedModules = false;


    public static register(module: Module, moduleBased = true, gridId: string | undefined = undefined): void {
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

    public static registerModules(modules: Module[], moduleBased = true, gridId: string | undefined = undefined): void {
        ModuleRegistry.setModuleBased(moduleBased);

        if (!modules) {
            return;
        }
        modules.forEach(module => ModuleRegistry.register(module, moduleBased, gridId));
    }

    private static runVersionChecks(module: Module) {
        if (!ModuleRegistry.currentModuleVersion) {
            ModuleRegistry.currentModuleVersion = module.version;
        }

        if (!module.version) {
            console.error(`AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '${module.moduleName}' is incompatible. Please update all modules to the same version.`);
        } else if (module.version !== ModuleRegistry.currentModuleVersion) {
            console.error(`AG Grid: You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. '${module.moduleName}' is version ${module.version} but the other modules are version ${this.currentModuleVersion}. Please update all modules to the same version.`);
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
                doOnce(() => {
                    console.warn(`AG Grid: You are mixing modules (i.e. @ag-grid-community/core) and packages (ag-grid-community) - you can only use one or the other of these mechanisms.`);
                    console.warn('Please see https://www.ag-grid.com/javascript-grid/packages-modules/ for more information.');

                },
                    'ModulePackageCheck');
            }
        }
    }

    /**
     * INTERNAL - Set if files are being served from a single UMD bundle to provide accurate enterprise upgrade steps.
     */
    public static setIsBundled() {
        ModuleRegistry.isBundled = true;
    }

    public static assertRegistered(moduleName: ModuleNames, reason: string, gridId: string): boolean {
        if (this.isRegistered(moduleName, gridId)) {
            return true;
        }

        const warningKey = reason + moduleName;
        let warningMessage: string;

        if (ModuleRegistry.isBundled) {
            {
                warningMessage =
                    `AG Grid: unable to use ${reason} as 'ag-grid-enterprise' has not been loaded. Check you are using the Enterprise bundle:
        
        <script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@AG_GRID_VERSION/dist/ag-grid-enterprise.min.js"></script>
        
For more info see: https://ag-grid.com/javascript-data-grid/getting-started/#getting-started-with-ag-grid-enterprise`;
            }
        }
        else if (ModuleRegistry.moduleBased || ModuleRegistry.moduleBased === undefined) {
            let modName = Object.entries(ModuleNames).find(([k, v]) => v === moduleName)?.[0];
            warningMessage =
                `AG Grid: unable to use ${reason} as the ${modName} is not registered${ModuleRegistry.areGridScopedModules ? ` for gridId: ${gridId}` : ''}. Check if you have registered the module:
           
    import { ModuleRegistry } from '@ag-grid-community/core';
    import { ${modName} } from '${moduleName}';
    
    ModuleRegistry.registerModules([ ${modName} ]);

For more info see: https://www.ag-grid.com/javascript-grid/modules/`;
        } else {
            warningMessage =
                `AG Grid: unable to use ${reason} as package 'ag-grid-enterprise' has not been imported. Check that you have imported the package:
            
    import 'ag-grid-enterprise';
            
For more info see: https://www.ag-grid.com/javascript-grid/packages/`;
        }

        doOnce(() => {
            console.warn(warningMessage);
        }, warningKey);

        return false;
    }

    public static isRegistered(moduleName: ModuleNames, gridId: string): boolean {
        return !!ModuleRegistry.globalModulesMap[moduleName] || !!ModuleRegistry.gridModulesMap[gridId]?.[moduleName];
    }

    public static getRegisteredModules(gridId: string): Module[] {
        return [...values(ModuleRegistry.globalModulesMap), ...values(ModuleRegistry.gridModulesMap[gridId] || {})];
    }

    public static isPackageBased(): boolean {
        return !ModuleRegistry.moduleBased;
    }
}
