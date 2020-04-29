import {Module} from "../interfaces/iModule";
import {ModuleNames} from "./moduleNames";
import {_} from "../utils";

export class ModuleRegistry {

    // having in a map a) removes duplicates and b) allows fast lookup
    private static modulesMap: { [name: string]: Module } = {};
    private static moduleBased: boolean | undefined;

    public static register(module: Module, moduleBased = true): void {
        ModuleRegistry.modulesMap[module.moduleName] = module;

        if (ModuleRegistry.moduleBased === undefined) {
            ModuleRegistry.moduleBased = moduleBased;
        } else {
            if (ModuleRegistry.moduleBased !== moduleBased) {
                _.doOnce(() => {
                        console.warn(`ag-Grid: You are mixing modules (i.e. @ag-grid-community/core) and packages (ag-grid-community) - you can only use one or the other of these mechanisms.`);
                        console.warn('Please see https://www.ag-grid.com/javascript-grid-packages-modules/ for more information.');

                    },
                    'ModulePackageCheck');
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    public static registerModules(modules: Module[], moduleBased = true): void {
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
        const warningMessage = `ag-Grid: unable to use ${reason} as module ${moduleName} is not present. Please see: https://www.ag-grid.com/javascript-grid-modules/`;

        _.doOnce(() => {
            console.warn(warningMessage);
        }, warningKey);

        return false;
    }

    public static isRegistered(moduleName: ModuleNames): boolean {
        return !!ModuleRegistry.modulesMap[moduleName];
    }

    public static getRegisteredModules(): Module[] {
        return _.values(ModuleRegistry.modulesMap);
    }

    public static isPackageBased(): boolean {
        return !ModuleRegistry.moduleBased;
    }
}
