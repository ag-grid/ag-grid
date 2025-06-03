import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { TestIdService } from './testIdService';

/**
 * @feature Testing
 * @gridOptions testIds
 */
export const TestingModule: _ModuleWithoutApi = {
    moduleName: 'Testing',
    version: VERSION,
    beans: [TestIdService],
};
