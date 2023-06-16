import { Module } from "../interfaces/iModule";
import { ModuleNames } from "./moduleNames";
export declare class ModuleRegistry {
    private static globalModulesMap;
    private static gridModulesMap;
    private static moduleBased;
    private static currentModuleVersion;
    private static isBundled;
    private static areGridScopedModules;
    static register(module: Module, moduleBased?: boolean, gridId?: string | undefined): void;
    static unRegisterGridModules(gridId: string): void;
    static registerModules(modules: Module[], moduleBased?: boolean, gridId?: string | undefined): void;
    private static isValidModuleVersion;
    private static runVersionChecks;
    private static setModuleBased;
    /**
     * INTERNAL - Set if files are being served from a single UMD bundle to provide accurate enterprise upgrade steps.
     */
    static setIsBundled(): void;
    static assertRegistered(moduleName: ModuleNames, reason: string, gridId: string): boolean;
    static isRegistered(moduleName: ModuleNames, gridId: string): boolean;
    static getRegisteredModules(gridId: string): Module[];
    static isPackageBased(): boolean;
}
