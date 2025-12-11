import { expect, test } from '@utils/grid/test-utils';

import { agTestIdFor } from 'ag-grid-community';

test.agExample(import.meta, () => {
    [
        { prod: true, version: '19.1.1' },
        { prod: false, version: '19.1.1' },
        { prod: true, version: '19.2.1' },
        { prod: false, version: '19.2.1' },
        { prod: true, version: '18.2.0' },
        { prod: false, version: '18.2.0' },
    ].forEach((configOptions) => {
        test.describe(`Example with config: ${JSON.stringify(configOptions)}`, () => {
            test.use({ loadPageOptions: configOptions });

            test.reactFunctionalTs(`Example`, async ({ page, agIdFor, loadPageOptions }) => {
                const grid1 = agIdFor.grid('1');
                const grid2 = agIdFor.grid('2');

                expect(loadPageOptions?.version).toEqual(configOptions.version);
                expect(loadPageOptions?.prod).toEqual(configOptions.prod);

                await expect(grid1).toBeVisible();
                await expect(page.getByText('Users Grid (Position: 1)')).toBeVisible();
                await expect(grid2).toBeVisible();
                await expect(page.getByText('Customers Grid (Position: 2)')).toBeVisible();

                // Ensure clicking headers works correctly
                await grid1.getByTestId(agTestIdFor.headerCell('id')).click();
                await grid2.getByTestId(agTestIdFor.headerCell('name')).click();

                await expect(grid1.getByTestId(agTestIdFor.headerCell('id'))).toHaveText(' users   1      ');
                await expect(grid2.getByTestId(agTestIdFor.headerCell('name'))).toHaveText('    Name   1       ');

                await page.getByRole('button', { name: '⬇️ Move Down' }).first().click();

                // Verify the grids have swapped positions
                await expect(page.getByText('Users Grid (Position: 2)')).toBeVisible();
                await expect(page.getByText('Customers Grid (Position: 1)')).toBeVisible();

                // REACT 19 DEV Resets grids state that moves down in re-order
                if (
                    (loadPageOptions!.version === '19.1.1' || loadPageOptions!.version === '19.2.1') &&
                    !loadPageOptions!.prod
                ) {
                    await expect(grid1.getByTestId(agTestIdFor.headerCell('id'))).toHaveText(' users         ');
                    await expect(grid2.getByTestId(agTestIdFor.headerCell('name'))).toHaveText('    Name   1       ');
                } else {
                    await expect(grid1.getByTestId(agTestIdFor.headerCell('id'))).toHaveText(' users   1      ');
                    await expect(grid2.getByTestId(agTestIdFor.headerCell('name'))).toHaveText('    Name   1       ');
                }

                // Ensure clicking headers works correctly
                await grid1.getByTestId(agTestIdFor.headerCell('id')).click();
                await grid2.getByTestId(agTestIdFor.headerCell('name')).click();

                await page.getByRole('button', { name: '⬇️ Move Down' }).first().click();

                // REACT 19 DEV Resets grids state that moves down in re-order
                if (
                    (loadPageOptions!.version === '19.1.1' || loadPageOptions!.version === '19.2.1') &&
                    !loadPageOptions!.prod
                ) {
                    await expect(grid1.getByTestId(agTestIdFor.headerCell('id'))).toHaveText('    users   1       ');
                    await expect(grid2.getByTestId(agTestIdFor.headerCell('name'))).toHaveText('    Name          ');
                } else {
                    await expect(grid1.getByTestId(agTestIdFor.headerCell('id'))).toHaveText(' users   1      ');
                    await expect(grid2.getByTestId(agTestIdFor.headerCell('name'))).toHaveText('    Name   1       ');
                }

                await grid1.getByTestId(agTestIdFor.headerCell('id')).click();
                await grid2.getByTestId(agTestIdFor.headerCell('name')).click();

                await expect(page.getByText('Users Grid (Position: 1)')).toBeVisible();
                await expect(page.getByText('Customers Grid (Position: 2)')).toBeVisible();

                // REACT 19 DEV Resets grids state that moves down in re-order
                if (
                    (loadPageOptions!.version === '19.1.1' || loadPageOptions!.version === '19.2.1') &&
                    !loadPageOptions!.prod
                ) {
                    await expect(grid1.getByTestId(agTestIdFor.headerCell('id'))).toHaveText('    users   1       ');
                    await expect(grid2.getByTestId(agTestIdFor.headerCell('name'))).toHaveText('    Name   1       ');
                } else {
                    // Because the grid state has not been reset this is the third click which resets the sort back to the default
                    await expect(grid1.getByTestId(agTestIdFor.headerCell('id'))).toHaveText(' users         ');
                    await expect(grid2.getByTestId(agTestIdFor.headerCell('name'))).toHaveText('    Name          ');
                }

                // click the cell to validate the focusing is working
                const nameCell = agIdFor.cell('2', 'name');
                await nameCell.click();
                await expect(nameCell).toHaveText('Jane Smith');
                await expect(nameCell).toBeFocused();
            });
        });
    });
});
