import type { Module } from '../interfaces/iModule';
import { ModuleNames } from './moduleNames';
export declare class ModuleRegistry {
    private static globalModulesMap;
    private static gridModulesMap;
    private static moduleBased;
    private static currentModuleVersion;
    private static isBundled;
    private static areGridScopedModules;
    /**
     * Globally register the given module for all grids.
     * @param module - module to register
     */
    static register(module: Module): void;
    /**
     * Globally register the given modules for all grids.
     * @param modules - modules to register
     */
    static registerModules(modules: Module[]): void;
    /** AG GRID INTERNAL - Module registration helper. */
    static __register(module: Module, moduleBased: boolean, gridId: string | undefined): void;
    /** AG GRID INTERNAL - Unregister grid scoped module. */
    static __unRegisterGridModules(gridId: string): void;
    /** AG GRID INTERNAL - Module registration helper. */
    static __registerModules(modules: Module[], moduleBased: boolean, gridId: string | undefined): void;
    private static isValidModuleVersion;
    private static runVersionChecks;
    private static setModuleBased;
    /**
     * AG GRID INTERNAL - Set if files are being served from a single UMD bundle to provide accurate enterprise upgrade steps.
     */
    static __setIsBundled(): void;
    /** AG GRID INTERNAL - Assert a given module has been register, globally or individually with this grid. */
    static __assertRegistered(moduleName: ModuleNames, reason: string, gridId: string): boolean;
    /** AG GRID INTERNAL - Is the given module registered, globally or individually with this grid. */
    static __isRegistered(moduleName: ModuleNames, gridId: string): boolean;
    /** AG GRID INTERNAL - Get all registered modules globally / individually for this grid. */
    static __getRegisteredModules(gridId: string): Module[];
    /** AG GRID INTERNAL - Get the list of modules registered individually for this grid. */
    static __getGridRegisteredModules(gridId: string): Module[];
    /** INTERNAL */
    static __isPackageBased(): boolean;
}
