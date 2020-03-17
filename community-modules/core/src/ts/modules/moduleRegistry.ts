import {Module} from "../interfaces/iModule";
import {ModuleNames} from "./moduleNames";
import {_} from "../utils";

export class ModuleRegistry {

    // having in a map a) removes duplicates and b) allows fast lookup
    private static modulesMap: { [name: string]: Module } = {};

    public static register(module: Module): void {
        ModuleRegistry.modulesMap[module.moduleName] = module;
    }

    // noinspection JSUnusedGlobalSymbols
    public static registerModules(modules: Module[]): void {
        if(!modules) {
            return;
        }
        modules.forEach(ModuleRegistry.register);
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
}
