// Import the test helper from test-utils
import { expect, setAgExampleUrl, test } from '@utils/grid/test-utils';

// Infer test URL from file location
setAgExampleUrl(import.meta);

test.eachFramework('Example', async ({ agIdFor }) => {
    await expect(agIdFor.autoGroupCell('row-group-country-Canada')).toContainText('Canada (351)', {
        useInnerText: true,
    });
    await expect(agIdFor.cell('row-group-country-Canada', 'bronze')).toContainText('104');
    await expect(agIdFor.cell('row-group-country-Canada', 'silver')).toContainText('5');
    await expect(agIdFor.cell('row-group-country-Canada', 'gold')).toContainText('0.47863247863247865');
});
