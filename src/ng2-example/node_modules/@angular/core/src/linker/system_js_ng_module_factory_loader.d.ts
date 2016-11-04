import { Compiler } from './compiler';
import { NgModuleFactory } from './ng_module_factory';
import { NgModuleFactoryLoader } from './ng_module_factory_loader';
/**
 * Configuration for SystemJsNgModuleLoader.
 * token.
 *
 * @experimental
 */
export declare abstract class SystemJsNgModuleLoaderConfig {
    /**
     * Prefix to add when computing the name of the factory module for a given module name.
     */
    factoryPathPrefix: string;
    /**
     * Suffix to add when computing the name of the factory module for a given module name.
     */
    factoryPathSuffix: string;
}
/**
 * NgModuleFactoryLoader that uses SystemJS to load NgModuleFactory
 * @experimental
 */
export declare class SystemJsNgModuleLoader implements NgModuleFactoryLoader {
    private _compiler;
    private _config;
    constructor(_compiler: Compiler, config?: SystemJsNgModuleLoaderConfig);
    load(path: string): Promise<NgModuleFactory<any>>;
    private loadAndCompile(path);
    private loadFactory(path);
}
