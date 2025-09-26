import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { VERSION } from '../version';
import { TestIdService, setTestIdAttribute } from './testIdService';

/**
 * Internal module. Not for direct use. Use `setupAgTestIds` instead.
 *
 * @feature Testing
 */
const TestingModule: _ModuleWithoutApi = {
    moduleName: 'Testing',
    version: VERSION,
    beans: [TestIdService],
};

interface TestIdSetupParams {
    testIdAttribute?: string;
}

export function setupAgTestIds({ testIdAttribute }: TestIdSetupParams = {}): void {
    if (testIdAttribute) {
        setTestIdAttribute(testIdAttribute);
    }

    ModuleRegistry.registerModules([TestingModule]);
}
