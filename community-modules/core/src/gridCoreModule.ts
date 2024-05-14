import { VERSION } from './version';



import { useFilters } from './filter/filtersFeature';
import { Module } from './interfaces/iModule';
import { ModuleNames } from './modules/moduleNames';
import { useValidations } from './validation/validationService';


export function useCoreModuleDefaults(): Module {
  useFilters();
  useValidations();
    return {
        version: VERSION,
        moduleName: ModuleNames.CommunityCoreModule,
        beans: []
    };
}

export function useCoreModule(features?: any): Module {
    return {
        version: VERSION,
        moduleName: ModuleNames.CommunityCoreModule,
        beans: []
    };
}


export const GridCoreModule = {
  version: VERSION,
};