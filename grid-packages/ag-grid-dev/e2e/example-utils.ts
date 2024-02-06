import { test,} from '@playwright/test';

export function testAllFrameworks(testToRun: ({ framework }: { framework: string }) => void) {
    const frameworks = ['angular', 'reactFunctional', 'reactFunctionalTs', 'vue', 'vue3', 'vanilla', 'typescript'];
    frameworks.forEach((framework) => {
        test.describe('framework: ' + framework, () => {
           testToRun({ framework });
        });
    });
}