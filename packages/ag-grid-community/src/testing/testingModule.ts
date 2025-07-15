import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { VERSION } from '../version';
import { TestIdService, setTestIdAttribute } from './testIdService';

interface TestingModuleParams {
    testIdAttribute?: string;
}

type TestingModuleType = {
    with: (params?: TestingModuleParams) => _ModuleWithoutApi;
} & _ModuleWithoutApi;

/**
 * @feature Testing
 * @gridOptions testIds
 */
export const TestingModule: TestingModuleType = {
    moduleName: 'Testing',
    version: VERSION,
    beans: [TestIdService],
    with({ testIdAttribute } = {}) {
        if (testIdAttribute) {
            setTestIdAttribute(testIdAttribute);
        }

        return {
            moduleName: 'Testing',
            version: VERSION,
            beans: [TestIdService],
        };
    },
};

export function setupAgTestIds(params?: TestingModuleParams): void {
    ModuleRegistry.registerModules([TestingModule.with(params)]);
}
