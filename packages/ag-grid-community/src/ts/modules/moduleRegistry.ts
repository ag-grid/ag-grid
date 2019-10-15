import {Module} from "../interfaces/iModule";
import {ModuleNames} from "./moduleNames";
import {_} from "../utils";

export class ModuleRegistry {

    // having in a map a) removes duplicates and b) allows fast lookup
    private static modulesMap: {[name: string]: Module} = {};

    public static register(module: Module): void {
        this.modulesMap[module.moduleName] = module;
    }

    public static assertRegistered(moduleName: ModuleNames, reason: string): boolean {
        if (this.isRegistered(moduleName)) {
            return true;
        }

        const warningKey = reason + moduleName;
        const warningMessage = `ag-Grid: unable to use ${reason} as module ${moduleName} is not present. `
            + `You need to load the module with: import "${moduleName}"`;

        _.doOnce( () => { console.warn(warningMessage) }, warningKey);
    }

    public static isRegistered(moduleName: ModuleNames): boolean {
        return !!this.modulesMap[moduleName];
    }

    public static getRegisteredModules(): Module[] {
        const res: Module[] = [];
        _.iterateObject(this.modulesMap, (key: string, module: Module) => res.push(module) );
        return res;
    }
}
