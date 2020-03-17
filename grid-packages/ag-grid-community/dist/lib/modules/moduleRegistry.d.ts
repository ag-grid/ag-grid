import { Module } from "../interfaces/iModule";
import { ModuleNames } from "./moduleNames";
export declare class ModuleRegistry {
    private static modulesMap;
    static register(module: Module): void;
    static registerModules(modules: Module[]): void;
    static assertRegistered(moduleName: ModuleNames, reason: string): boolean;
    static isRegistered(moduleName: ModuleNames): boolean;
    static getRegisteredModules(): Module[];
}
