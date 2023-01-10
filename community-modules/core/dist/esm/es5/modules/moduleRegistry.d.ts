// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Module } from "../interfaces/iModule";
import { ModuleNames } from "./moduleNames";
export declare class ModuleRegistry {
    private static modulesMap;
    private static moduleBased;
    private static currentModuleVersion;
    static register(module: Module, moduleBased?: boolean): void;
    private static runVersionChecks;
    private static setModuleBased;
    static registerModules(modules: Module[], moduleBased?: boolean): void;
    static assertRegistered(moduleName: ModuleNames, reason: string): boolean;
    static isRegistered(moduleName: ModuleNames): boolean;
    static getRegisteredModules(): Module[];
    static isPackageBased(): boolean;
}
