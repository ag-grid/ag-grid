import type { Module, ModuleValidationInvalidResult } from '../interfaces/iModule';
import type { RowModelType } from '../interfaces/iRowModel';
import { _errorOnce } from '../utils/function';
import { ModuleNames } from './moduleNames';

interface RowModelModuleStore {
    [name: string]: Module;
}

type ModuleStore = {
    [modelType in RowModelType | 'all']?: RowModelModuleStore;
};

const globalModulesMap: ModuleStore = {};
const gridModulesMap: { [gridId: string]: ModuleStore } = {};
let currentModuleVersion: string;
let areGridScopedModules = false;

function isValidModuleVersion(module: Module): boolean {
    const [moduleMajor, moduleMinor] = module.version.split('.') || [];
    const [currentModuleMajor, currentModuleMinor] = currentModuleVersion.split('.') || [];

    return moduleMajor === currentModuleMajor && moduleMinor === currentModuleMinor;
}

function runVersionChecks(module: Module) {
    if (!currentModuleVersion) {
        currentModuleVersion = module.version;
    }
    const errorMsg = (details: string) =>
        `You are using incompatible versions of AG Grid modules. Major and minor versions should always match across modules. ${details} Please update all modules to the same version.`;
    if (!module.version) {
        _errorOnce(errorMsg(`'${module.moduleName}' is incompatible.`));
    } else if (!isValidModuleVersion(module)) {
        _errorOnce(
            errorMsg(
                `'${module.moduleName}' is version ${module.version} but the other modules are version ${currentModuleVersion}.`
            )
        );
    }

    if (module.validate) {
        const result = module.validate();
        if (!result.isValid) {
            const errorResult = result as ModuleValidationInvalidResult;
            _errorOnce(`${errorResult.message}`);
        }
    }
}

export function _registerModule(module: Module, gridId: string | undefined): void {
    runVersionChecks(module);
    const rowModels = module.rowModels ?? ['all'];

    let moduleStore: ModuleStore;
    if (gridId !== undefined) {
        areGridScopedModules = true;
        if (gridModulesMap[gridId] === undefined) {
            gridModulesMap[gridId] = {};
        }
        moduleStore = gridModulesMap[gridId];
    } else {
        moduleStore = globalModulesMap;
    }
    rowModels.forEach((rowModel) => {
        if (moduleStore[rowModel] === undefined) {
            moduleStore[rowModel] = {};
        }
        moduleStore[rowModel]![module.moduleName] = module;
    });

    if (module.dependsOn) {
        module.dependsOn.forEach((dependency) => _registerModule(dependency, gridId));
    }
}

export function _unRegisterGridModules(gridId: string): void {
    delete gridModulesMap[gridId];
}

export function _isModuleRegistered(moduleName: ModuleNames, gridId: string, rowModel: RowModelType): boolean {
    const isRegisteredForRowModel = (model: RowModelType | 'all') =>
        !!globalModulesMap[model]?.[moduleName] || !!gridModulesMap[gridId][rowModel]?.[moduleName];
    return isRegisteredForRowModel(rowModel) || isRegisteredForRowModel('all');
}

export function _assertModuleRegistered(
    moduleName: ModuleNames,
    reason: string,
    gridId: string,
    rowModel: RowModelType
): boolean {
    if (_isModuleRegistered(moduleName, gridId, rowModel)) {
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const modName = Object.entries(ModuleNames).find(([k, v]) => v === moduleName)?.[0];
    const warningMessage = `AG Grid: unable to use ${reason} as the ${modName} is not registered${areGridScopedModules ? ` for gridId: ${gridId}` : ''}. Check if you have registered the module:
       
import { ModuleRegistry } from '@ag-grid-community/core';
import { ${modName} } from '${moduleName}';

ModuleRegistry.registerModules([ ${modName} ]);

For more info see: https://www.ag-grid.com/javascript-grid/modules/`;

    _errorOnce(warningMessage);

    return false;
}

export function _getRegisteredModules(gridId: string, rowModel: RowModelType): Module[] {
    const gridModules = gridModulesMap[gridId] ?? {};
    return [
        ...Object.values(globalModulesMap['all'] ?? {}),
        ...Object.values(gridModules['all'] ?? {}),
        ...Object.values(globalModulesMap[rowModel] ?? {}),
        ...Object.values(gridModules[rowModel] ?? {}),
    ];
}

export function _getGridRegisteredModules(gridId: string, rowModel: RowModelType): Module[] {
    const gridModules = gridModulesMap[gridId] ?? {};
    return [...Object.values(gridModules['all'] ?? {}), ...Object.values(gridModules[rowModel] ?? {})];
}

export class ModuleRegistry {
    /**
     * @deprecated v33 Use `registerModules([module])` instead.
     */
    public static register(module: Module): void {
        _registerModule(module, undefined);
    }
    /**
     * Globally register the given modules for all grids.
     * @param modules - modules to register
     */
    public static registerModules(modules: Module[]): void {
        modules.forEach((module) => _registerModule(module, undefined));
    }
}
