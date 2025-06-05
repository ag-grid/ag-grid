import type { TestIdParams } from '../testing/testIdService';

export interface ITestIdService {
    setTestId(eGui: HTMLElement, params: TestIdParams): void;
    setupAllTestIds(): void;
}
