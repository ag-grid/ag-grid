// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Module } from "../interfaces/iModule";
import { ModuleNames } from "./moduleNames";
export declare class ModuleRegistry {
    private static modulesMap;
    private static moduleBased;
    static register(module: Module, moduleBased?: boolean): void;
    static registerModules(modules: Module[], moduleBased?: boolean): void;
    static assertRegistered(moduleName: ModuleNames, reason: string): boolean;
    static isRegistered(moduleName: ModuleNames): boolean;
    static getRegisteredModules(): Module[];
    static isPackageBased(): boolean;
}
