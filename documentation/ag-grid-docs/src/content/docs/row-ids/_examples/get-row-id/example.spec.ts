// Import the test helper from test-utils
import { expect, setAgExampleUrl, test } from '@utils/grid/test-utils';

// Infer test URL from file location
setAgExampleUrl(import.meta);

test.eachFramework('Example', async ({ agIdFor }) => {
    await expect(agIdFor.rowNode('c2')).toBeVisible();

    await expect(agIdFor.cell('c2', 'make')).toContainText('Ford');
    await expect(agIdFor.cell('c2', 'price')).toContainText('32000');
});
