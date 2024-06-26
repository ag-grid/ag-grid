import type { Module } from './interfaces/iModule';
import { ModuleNames } from './modules/moduleNames';
import { ValidationService } from './validation/validationService';
export declare const GridCoreModule: {
    version: string;
    moduleName: ModuleNames;
};
export declare const ValidationsModule: {
    version: string;
    moduleName: string;
    beans: (typeof ValidationService)[];
};
export declare const CommunityFeaturesModule: Module;
