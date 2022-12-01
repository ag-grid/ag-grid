import { Module } from "../interfaces/iModule";
import { ModuleNames } from "./moduleNames";
import { doOnce } from "../utils/function";
import { values } from "../utils/generic";

export class ModuleRegistry {

    // having in a map a) removes duplicates and b) allows fast lookup
    private static modulesMap: { [name: string]: Module; } = {};
    private static moduleBased: boolean | undefined;

    public static register(module: Module, moduleBased = true): void {
        ModuleRegistry.modulesMap[module.moduleName] = module;

        ModuleRegistry.setModuleBased(moduleBased);
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

    // noinspection JSUnusedGlobalSymbols
    public static registerModules(modules: Module[], moduleBased = true): void {
        ModuleRegistry.setModuleBased(moduleBased);

        if (!modules) {
            return;
        }
        modules.forEach(module => ModuleRegistry.register(module, moduleBased));
    }

    public static assertRegistered(moduleName: ModuleNames, reason: string): boolean {
        if (this.isRegistered(moduleName)) {
            return true;
        }

        const warningKey = reason + moduleName;
        let warningMessage: string;
        if (ModuleRegistry.moduleBased) {
            warningMessage = `AG Grid: unable to use ${reason} as module ${moduleName} is not present. Please see: https://www.ag-grid.com/javascript-grid/modules/`;
        } else {
            warningMessage = `AG Grid: unable to use ${reason} as package 'ag-grid-enterprise' is not present. Please see: https://www.ag-grid.com/javascript-grid/packages/`;
        }

        doOnce(() => {
            console.warn(warningMessage);
        }, warningKey);

        return false;
    }

    public static isRegistered(moduleName: ModuleNames): boolean {
        return !!ModuleRegistry.modulesMap[moduleName];
    }

    public static getRegisteredModules(): Module[] {
        return values(ModuleRegistry.modulesMap);
    }

    public static isPackageBased(): boolean {
        return !ModuleRegistry.moduleBased;
    }
}
