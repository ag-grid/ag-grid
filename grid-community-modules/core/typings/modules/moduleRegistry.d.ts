import { Module } from "../interfaces/iModule";
import { ModuleNames } from "./moduleNames";
export declare class ModuleRegistry {
    private static modulesMap;
    private static moduleBased;
    private static currentModuleVersion;
    private static isBundled;
    static register(module: Module, moduleBased?: boolean): void;
    private static runVersionChecks;
    private static setModuleBased;
    /**
     * INTERNAL - Set if files are being served from a single UMD bundle to provide accurate enterprise upgrade steps.
     */
    static setIsBundled(): void;
    static registerModules(modules: Module[], moduleBased?: boolean): void;
    static assertRegistered(moduleName: ModuleNames, reason: string): boolean;
    static isRegistered(moduleName: ModuleNames): boolean;
    static getRegisteredModules(): Module[];
    static isPackageBased(): boolean;
}
